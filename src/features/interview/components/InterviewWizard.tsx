"use client";

import React, { useState, useEffect } from "react";
import {
  SurveyConfig,
  ParticipantData,
  QuestionResponse,
  FeedbackData,
  InterviewSession,
  TrackingData,
} from "@/types/interview";
import { OnboardingForm } from "./OnboardingForm";
import { QuestionCard } from "./QuestionCard";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";
import { CompletionCard } from "./CompletionCard";
import { generateUUID } from "@/lib/utils";

interface InterviewWizardProps {
  project: SurveyConfig;
  initialParticipant?: Partial<ParticipantData>;
  initialTracking?: TrackingData;
}

type WizardStep = "onboarding" | "questions" | "feedback" | "completed";

export const InterviewWizard: React.FC<InterviewWizardProps> = ({
  project,
  initialParticipant,
  initialTracking,
}) => {
  const [step, setStep] = useState<WizardStep>("onboarding");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [tracking, setTracking] = useState<TrackingData | undefined>(initialTracking);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bu görüşmeye ait tekil oturum kimliği (Ses dosyası yedekleme dizini için)
  const [activeSessionId] = useState<string>(() => generateUUID());

  const storageKey = `voice_verification_session_${project.id}`;

  // İlk yüklemede initialTracking'i kontrol et
  useEffect(() => {
    if (initialTracking) {
      setTracking(initialTracking);
    }
  }, [initialTracking]);

  // Oturum Direnci: Sayfa yenilenirse taslağı geri yükleme
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectId === project.id && parsed.status === "in_progress") {
          setParticipant(parsed.participant);
          setTracking(parsed.tracking);
          setResponses(parsed.responses || {});
          if (parsed.participant) {
            setStep("questions");
          }
        }
      }
    } catch {
      // LocalStorage hatası olursa sessizce geç
    }
  }, [project.id, storageKey]);

  // Taslağı kaydetme
  const saveDraft = (
    updatedParticipant: ParticipantData | null,
    updatedResponses: Record<string, QuestionResponse>,
    updatedTracking?: TrackingData
  ) => {
    if (!updatedParticipant) return;
    try {
      const cleanResponses: Record<string, Partial<QuestionResponse>> = {};
      for (const [k, v] of Object.entries(updatedResponses)) {
        cleanResponses[k] = {
          questionId: v.questionId,
          mode: v.mode,
          durationSec: v.durationSec,
          textResponse: v.textResponse,
          audioUrl: v.audioUrl,
        };
      }

      const sessionDraft = {
        projectId: project.id,
        participant: updatedParticipant,
        tracking: updatedTracking || tracking,
        responses: cleanResponses,
        status: "in_progress",
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionDraft));
    } catch {
      // Storage dolu veya kapalıysa sessizce geç
    }
  };

  // Adım 1: Onboarding Tamamlandı
  const handleOnboardingSubmit = (data: ParticipantData, trackingData?: TrackingData) => {
    setParticipant(data);
    setTracking(trackingData);
    setStep("questions");
    setCurrentQuestionIndex(0);
    saveDraft(data, responses, trackingData);
  };

  // Adım 2: Soru Cevaplandı ve İlerlendi (Tamamen İstemci Hafızasında Tutulur, Gereksiz Yükleme Yapılmaz)
  const handleQuestionSubmit = (response: QuestionResponse) => {
    const updatedResponses = {
      ...responses,
      [response.questionId]: response,
    };
    setResponses(updatedResponses);
    saveDraft(participant, updatedResponses, tracking);

    if (currentQuestionIndex < project.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStep("feedback");
    }
  };

  // Önceki Soruya Geri Dönüş
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Feedback ekranından son soruya geri dönüş
  const handleBackToLastQuestion = () => {
    setStep("questions");
    setCurrentQuestionIndex(project.questions.length - 1);
  };

  // Adım 3: Anket Tamamlandı, Feedback Verildi -> Yalnızca Kesinleşen Ses Dosyaları Supabase Storage'a Yüklenir ve Deşifre Edilir
  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    if (!participant) return;
    setIsSubmitting(true);

    try {
      // 1. Sadece anket kesinleştiğinde, son geçerli ses dosyalarını paralel olarak Supabase Storage'a yükle
      const finalResponses: Record<string, QuestionResponse> = {};

      const uploadTasks = Object.entries(responses).map(async ([qId, resp]) => {
        let audioUrl = resp.audioUrl;

        if (resp.mode === "audio" && resp.audioBlob) {
          try {
            const formData = new FormData();
            formData.append("surveyId", project.id);
            formData.append("sessionId", activeSessionId);
            formData.append("questionId", resp.questionId);
            formData.append("audio", resp.audioBlob, `${resp.questionId}.webm`);

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const uploadData = await uploadRes.json();
            if (uploadData.audioUrl) {
              audioUrl = uploadData.audioUrl;
            }
          } catch (uploadErr) {
            console.error(`Soru ${qId} ses yükleme hatası:`, uploadErr);
          }
        }

        finalResponses[qId] = {
          questionId: resp.questionId,
          mode: resp.mode,
          durationSec: resp.durationSec,
          audioUrl,
          textResponse: resp.textResponse,
          sentiment: resp.sentiment,
          summary: resp.summary,
          isJunk: resp.isJunk,
        };
      });

      await Promise.all(uploadTasks);

      // 2. Oturum verisini oluştur ve /api/analyze'e gönder (Gemini deşifresi + Supabase DB kaydı)
      const sessionData: InterviewSession = {
        id: activeSessionId,
        projectId: project.id,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        participant,
        tracking,
        responses: finalResponses,
        feedback,
        status: "completed",
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionData,
        }),
      });

      if (!res.ok) {
        console.error("API hatası:", await res.text());
      }

      // Yerel taslağı temizle
      localStorage.removeItem(storageKey);
      setStep("completed");
    } catch (err) {
      console.error("Gönderim hatası:", err);
      setStep("completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setParticipant(null);
    setTracking(undefined);
    setResponses({});
    setCurrentQuestionIndex(0);
    setStep("onboarding");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[500px]">
      {step === "onboarding" && (
        <OnboardingForm
          project={project}
          onSubmit={handleOnboardingSubmit}
          initialParticipant={initialParticipant}
        />
      )}

      {step === "questions" && project.questions[currentQuestionIndex] && (
        <QuestionCard
          key={project.questions[currentQuestionIndex].id}
          question={project.questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={project.questions.length}
          projectContext={project.aiContext}
          initialResponse={responses[project.questions[currentQuestionIndex].id]}
          onResponseSubmit={handleQuestionSubmit}
          onPrevious={currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
        />
      )}

      {step === "feedback" && (
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          onBack={handleBackToLastQuestion}
          isSubmitting={isSubmitting}
        />
      )}

      {step === "completed" && participant && (
        <CompletionCard participant={participant} onReset={handleReset} />
      )}
    </div>
  );
};
