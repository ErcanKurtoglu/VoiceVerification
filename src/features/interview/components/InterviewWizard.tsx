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

  const storageKey = `voice_verification_session_${project.id}`;

  // İlk yüklemede initialParticipant'ı kontrol et
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
      const sessionDraft = {
        projectId: project.id,
        participant: updatedParticipant,
        tracking: updatedTracking || tracking,
        responses: updatedResponses,
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

  // Adım 2: Soru Cevaplandı
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

  // Adım 3: Feedback Verildi ve Sunucuya Gönderim Yapılıyor
  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    if (!participant) return;
    setIsSubmitting(true);

    const sessionId = generateUUID();
    const sessionData: InterviewSession = {
      id: sessionId,
      projectId: project.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      participant,
      tracking,
      responses,
      feedback,
      status: "completed",
    };

    try {
      // Sunucuya gönderme
      await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionData,
        }),
      });

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
        <OnboardingForm project={project} onSubmit={handleOnboardingSubmit} />
      )}

      {step === "questions" && project.questions[currentQuestionIndex] && (
        <QuestionCard
          question={project.questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={project.questions.length}
          projectContext={project.aiContext}
          initialResponse={responses[project.questions[currentQuestionIndex].id]}
          onResponseSubmit={handleQuestionSubmit}
        />
      )}

      {step === "feedback" && (
        <FeedbackForm onSubmit={handleFeedbackSubmit} isSubmitting={isSubmitting} />
      )}

      {step === "completed" && participant && (
        <CompletionCard participant={participant} onReset={handleReset} />
      )}
    </div>
  );
};
