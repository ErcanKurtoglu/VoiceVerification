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

  // Ses Blob'unu Base64 formatına çevirme yardımcısı (Hafif ve bellekte)
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const base64 = res.includes(",") ? res.split(",")[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Adım 3: Anket Tamamlandı, Feedback Verildi -> Yalnızca Kesinleşen Yanıtlar Deşifre İçin Sunucuya Gönderilir (Depolama Şişmesi Önlenir)
  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    if (!participant) return;
    setIsSubmitting(true);

    try {
      // 1. Blob nesnelerini doğrudan base64'e dönüştür (Bulut depolamaya dosya yükleyip yer kaplamadan doğrudan Gemini'ye iletilir)
      const serializableResponses: Record<string, QuestionResponse> = {};
      for (const [qId, resp] of Object.entries(responses)) {
        let audioBase64: string | undefined = undefined;
        if (resp.mode === "audio" && resp.audioBlob) {
          try {
            audioBase64 = await blobToBase64(resp.audioBlob);
          } catch (err) {
            console.error(`Soru ${qId} ses çevirme hatası:`, err);
          }
        }

        serializableResponses[qId] = {
          questionId: resp.questionId,
          mode: resp.mode,
          durationSec: resp.durationSec,
          audioBase64,
          audioUrl: resp.audioUrl,
          textResponse: resp.textResponse,
          sentiment: resp.sentiment,
          summary: resp.summary,
          isJunk: resp.isJunk,
        };
      }

      const sessionData: InterviewSession = {
        id: activeSessionId,
        projectId: project.id,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        participant,
        tracking,
        responses: serializableResponses,
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
