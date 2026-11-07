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
import { AlreadyCompletedCard } from "./AlreadyCompletedCard";
import { generateUUID } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedText } from "@/lib/i18n";

interface InterviewWizardProps {
  project: SurveyConfig;
  initialParticipant?: Partial<ParticipantData>;
  initialTracking?: TrackingData;
}

type WizardStep = "onboarding" | "questions" | "feedback" | "completed" | "already_completed";

export const InterviewWizard: React.FC<InterviewWizardProps> = ({
  project,
  initialParticipant,
  initialTracking,
}) => {
  const { lang } = useLanguage();
  const [step, setStep] = useState<WizardStep>("onboarding");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [tracking, setTracking] = useState<TrackingData | undefined>(initialTracking);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bu görüşmeye ait tekil oturum kimliği (Ses dosyası yedekleme dizini için)
  const [activeSessionId] = useState<string>(() => generateUUID());

  const storageKey = `voice_verification_session_${project.id}`;

  const getCompletedUrlKey = () => {
    if (typeof window === "undefined") return "";
    const search = window.location.search || "direct";
    const uid = tracking?.uid || initialTracking?.uid || "";
    return `voice_verification_done_${project.id}_${search}_${uid}`;
  };

  // Bu bağlantı ile daha önce form doldurulduysa 'already_completed' göster, değilse aktif taslağı yalnızca ilk yüklemede geri yükle
  useEffect(() => {
    try {
      const key = getCompletedUrlKey();
      if (key && localStorage.getItem(key) === "true") {
        setStep("already_completed");
        return;
      }

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectId === project.id && parsed.status === "in_progress" && parsed.participant) {
          setParticipant(parsed.participant);
          if (parsed.tracking) setTracking(parsed.tracking);
          if (parsed.responses) setResponses(parsed.responses);
          if (parsed.step === "feedback") {
            setStep("feedback");
          } else {
            setStep("questions");
            if (typeof parsed.currentQuestionIndex === "number" && parsed.currentQuestionIndex >= 0) {
              setCurrentQuestionIndex(parsed.currentQuestionIndex);
            }
          }
        }
      }
    } catch {
      // LocalStorage hatası olursa sessizce geç
    }
  }, [project.id]);

  // İlk yüklemede initialTracking'i kontrol et
  useEffect(() => {
    if (initialTracking) {
      setTracking(initialTracking);
    }
  }, [initialTracking]);

  // Taslağı kaydetme
  const saveDraft = (
    updatedParticipant: ParticipantData | null,
    updatedResponses: Record<string, QuestionResponse>,
    updatedTracking?: TrackingData,
    targetStep?: WizardStep,
    targetQuestionIndex?: number
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
        step: targetStep || step,
        currentQuestionIndex:
          targetQuestionIndex !== undefined ? targetQuestionIndex : currentQuestionIndex,
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
    saveDraft(data, responses, trackingData, "questions", 0);
  };

  // Adım 2: Soru Cevaplandı ve İlerlendi
  const handleQuestionSubmit = (response: QuestionResponse) => {
    const updatedResponses = {
      ...responses,
      [response.questionId]: response,
    };
    setResponses(updatedResponses);

    if (currentQuestionIndex < project.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      saveDraft(participant, updatedResponses, tracking, "questions", nextIdx);
    } else {
      setStep("feedback");
      saveDraft(participant, updatedResponses, tracking, "feedback", currentQuestionIndex);
    }
  };

  // Taslak yanıtı kaydetme (Kullanıcı önceki soruya dönerken veya yazarken)
  const handleSaveQuestionDraft = (draftResponse: QuestionResponse) => {
    setResponses((prev) => {
      const updated = {
        ...prev,
        [draftResponse.questionId]: draftResponse,
      };
      saveDraft(participant, updated, tracking, "questions", currentQuestionIndex);
      return updated;
    });
  };

  // Önceki Soruya Geri Dönüş (O anki sorunun taslağını kaybetmeden koru)
  const handlePreviousQuestion = (draftResponse?: QuestionResponse) => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setResponses((prev) => {
        let updated = prev;
        if (draftResponse) {
          updated = {
            ...prev,
            [draftResponse.questionId]: draftResponse,
          };
        }
        saveDraft(participant, updated, tracking, "questions", prevIdx);
        return updated;
      });
      setCurrentQuestionIndex(prevIdx);
    }
  };

  // Feedback ekranından son soruya geri dönüş
  const handleBackToLastQuestion = () => {
    const lastIdx = project.questions.length - 1;
    setCurrentQuestionIndex(lastIdx);
    setStep("questions");
    saveDraft(participant, responses, tracking, "questions", lastIdx);
  };

  // Görüşmeyi İptal Etme & Sıfırdan Başlama
  const handleCancelInterview = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // sessizce geç
    }
    setParticipant(null);
    setResponses({});
    setCurrentQuestionIndex(0);
    setStep("onboarding");
  };

  // Adım 3: Anket Tamamlandı, Feedback Verildi
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

      // 2. Oturum verisini oluştur ve /api/analyze'e gönder (Yapay zeka deşifresi + Supabase DB kaydı)
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

      // 3. Form tamamlandı: Aktif URL'yi kapat, oturum taslağını sil ve tek seferlik katılımı mühürle
      try {
        const completedKey = getCompletedUrlKey();
        if (completedKey) {
          localStorage.setItem(completedKey, "true");
        }
        localStorage.removeItem(storageKey);
        // Tarayıcı geçmişinde URL'i kapat/temizle
        window.history.replaceState(null, "", window.location.pathname);
      } catch {
        // ignore
      }

      setStep("completed");
    } catch (err) {
      console.error("Gönderim hatası:", err);
      setStep("completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[500px]">
      {step === "already_completed" && <AlreadyCompletedCard />}

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
          projectContext={getLocalizedText(project, "aiContext", lang) || project.aiContext}
          participant={participant}
          caseAnchor={getLocalizedText(project, "caseAnchor", lang)}
          initialResponse={responses[project.questions[currentQuestionIndex].id]}
          onResponseSubmit={handleQuestionSubmit}
          onSaveDraft={handleSaveQuestionDraft}
          onPrevious={currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
          onCancel={handleCancelInterview}
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
        <CompletionCard participant={participant} />
      )}
    </div>
  );
};
