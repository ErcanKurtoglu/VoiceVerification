"use client";

import React, { useState, useEffect } from "react";
import { ProjectConfig, ParticipantData, QuestionResponse, FeedbackData, InterviewSession } from "@/types/interview";
import { OnboardingForm } from "./OnboardingForm";
import { QuestionCard } from "./QuestionCard";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";
import { CompletionCard } from "./CompletionCard";
import { generateUUID } from "@/lib/utils";

interface InterviewWizardProps {
  project: ProjectConfig;
}

type WizardStep = "onboarding" | "questions" | "feedback" | "completed";

const STORAGE_KEY = "voice_verification_active_session";

export const InterviewWizard: React.FC<InterviewWizardProps> = ({ project }) => {
  const [step, setStep] = useState<WizardStep>("onboarding");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Oturum Direnci: Sayfa yenilenirse taslağı geri yükleme
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectId === project.id && parsed.status === "in_progress") {
          setParticipant(parsed.participant);
          setResponses(parsed.responses || {});
          if (parsed.participant) {
            setStep("questions");
          }
        }
      }
    } catch {
      // LocalStorage hatası olursa sessizce geç
    }
  }, [project.id]);

  // Taslağı kaydetme
  const saveDraft = (updatedParticipant: ParticipantData | null, updatedResponses: Record<string, QuestionResponse>) => {
    if (!updatedParticipant) return;
    try {
      const sessionDraft = {
        projectId: project.id,
        participant: updatedParticipant,
        responses: updatedResponses,
        status: "in_progress",
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionDraft));
    } catch {
      // Storage dolu veya kapalıysa sessizce geç
    }
  };

  // Adım 1: Onboarding Tamamlandı
  const handleOnboardingSubmit = (data: ParticipantData) => {
    setParticipant(data);
    setStep("questions");
    setCurrentQuestionIndex(0);
    saveDraft(data, responses);
  };

  // Adım 2: Soru Cevaplandı
  const handleQuestionSubmit = (response: QuestionResponse) => {
    const updatedResponses = {
      ...responses,
      [response.questionId]: response,
    };
    setResponses(updatedResponses);
    saveDraft(participant, updatedResponses);

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
      localStorage.removeItem(STORAGE_KEY);
      setStep("completed");
    } catch (err) {
      console.error("Gönderim hatası:", err);
      // Hata olsa bile kullanıcıya teşekkür ekranını göster (Offline-first dayanıklılık)
      setStep("completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setParticipant(null);
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
        <CompletionCard
          participant={participant}
          leadReward={project.leadReward}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
