"use client";

import React, { useState, useEffect } from "react";
import { Mic, PenLine, HelpCircle, ArrowRight, ArrowLeft, Check, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Question, QuestionResponse, ParticipantData } from "@/types/interview";
import { useAudioRecorder } from "@/features/audio/hooks/useAudioRecorder";
import { AudioRecorderControl } from "@/features/audio/components/AudioRecorderControl";
import { AssistantDrawer } from "@/features/assistant/components/AssistantDrawer";
import { useLanguage } from "@/context/LanguageContext";
import { formatTime } from "@/lib/utils";
import { getLocalizedText } from "@/lib/i18n";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  projectContext: string;
  participant?: ParticipantData | null;
  caseAnchor?: string;
  initialResponse?: QuestionResponse;
  onResponseSubmit: (response: QuestionResponse) => void;
  onSaveDraft?: (response: QuestionResponse) => void;
  onPrevious?: (draftResponse?: QuestionResponse) => void;
  onCancel?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  projectContext,
  participant,
  caseAnchor,
  initialResponse,
  onResponseSubmit,
  onSaveDraft,
  onPrevious,
  onCancel,
}) => {
  const { t, lang } = useLanguage();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [mode, setMode] = useState<"audio" | "text">(
    initialResponse?.mode || "audio"
  );
  const [textInput, setTextInput] = useState(
    initialResponse?.textResponse || ""
  );
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Geri dönüldüğünde önceki ses kaydını dinletebilmek için URL
  const [initialAudioUrl, setInitialAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialResponse?.audioBlob) {
      const url = URL.createObjectURL(initialResponse.audioBlob);
      setInitialAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [initialResponse?.audioBlob]);

  const recorder = useAudioRecorder(question.maxDurationSec);

  const hasAudioResponse = Boolean(
    recorder.audioBlob || (initialResponse?.audioBlob && initialAudioUrl)
  );
  const hasTextResponse = textInput.trim().length >= 10;
  const canProceed = mode === "audio" ? hasAudioResponse : hasTextResponse;

  // Önceki soruya dönerken mevcut sorunun yanıtını taslak olarak koru
  const handlePrevious = () => {
    let currentDraft: QuestionResponse | undefined = undefined;

    if (mode === "text") {
      if (textInput.trim().length > 0) {
        currentDraft = {
          questionId: question.id,
          mode: "text",
          textResponse: textInput.trim(),
        };
      }
    } else {
      const activeBlob = recorder.audioBlob || initialResponse?.audioBlob;
      if (activeBlob) {
        currentDraft = {
          questionId: question.id,
          mode: "audio",
          audioBlob: activeBlob,
          durationSec: recorder.duration || initialResponse?.durationSec || 0,
        };
      }
    }

    if (currentDraft && onSaveDraft) {
      onSaveDraft(currentDraft);
    }

    onPrevious?.(currentDraft);
  };

  const handleNext = () => {
    if (!canProceed) return;

    if (mode === "audio") {
      onResponseSubmit({
        questionId: question.id,
        mode: "audio",
        audioBlob: recorder.audioBlob || initialResponse?.audioBlob,
        durationSec:
          recorder.duration || initialResponse?.durationSec || 0,
      });
    } else {
      onResponseSubmit({
        questionId: question.id,
        mode: "text",
        textResponse: textInput.trim(),
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn">
      {/* İlerleme ve Yardım Barı */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {t.questionProgress} {questionNumber} / {totalQuestions}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{t.maxDurationPrefix} {formatTime(question.maxDurationSec || 90)}</span>
          </span>
        </div>

        {/* AI Asistana Danış Butonu */}
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all group"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>{t.askAssistant}</span>
        </button>
      </div>

      {/* Soru Başlığı ve Açıklaması */}
      {/* Soru Bağlamı & Faz Rozeti (Hatırlatıcı Çapa) */}
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold tracking-wide">
          <Sparkles className="w-3 h-3" />
          {(() => {
            if (questionNumber <= 2) {
              return lang === "en" ? "Phase 1: Event & Part Role" : "Faz 1: Olay & Parçanın Rolü";
            }
            if (questionNumber <= 4) {
              return lang === "en" ? "Phase 2: Response & Part Data" : "Faz 2: İlk Müdahale & Parça Bilgisi";
            }
            if (questionNumber <= 6) {
              return lang === "en" ? "Phase 3: Solutions & Hygiene Environment" : "Faz 3: Çözüm Alternatifleri & Hijyen Şartları";
            }
            return lang === "en" ? "Phase 4: Operational Impact & Outcome" : "Faz 4: Operasyonel Etki, Roller & Sonuç";
          })()}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {caseAnchor
            ? `• ${caseAnchor}`
            : lang === "en"
            ? "• Case Focus: Specific part event"
            : "• Vaka Odağı: Belirlediğiniz somut parça"}
        </span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
        {getLocalizedText(question, "title", lang)}
      </h2>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3.5">
        {getLocalizedText(question, "description", lang)}
      </p>

      {/* Sabit Rol & Kapsam Güvencesi Notu (Tüm sorularda sabit rehberlik) */}
      <div className="p-3 mb-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11.5px] text-slate-300">
          {lang === "en" ? (
            <>
              <strong className="text-slate-100 font-semibold">Scope & Role Notice: </strong>
              If this question does not directly match your specific responsibilities, you may simply state{" "}
              <span className="text-indigo-300 font-medium">&quot;This question does not apply to my role&quot;</span>{" "}
              or answer only the aspects related to your work. You can also consult the{" "}
              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium inline cursor-pointer"
              >
                AI Copilot
              </button>{" "}
              to ask how someone in your position can frame this question.
            </>
          ) : (
            <>
              <strong className="text-slate-100 font-semibold">Rol & Kapsam Notu: </strong>
              Bu sorunun durumunuzla doğrudan ilgili olmadığını düşünüyorsanız;{" "}
              <span className="text-indigo-300 font-medium">&quot;Bu soru benim rolüme hitap etmiyor&quot;</span>{" "}
              diyebilir veya yalnızca görevinizle kesişen yönleriyle yanıtlayabilirsiniz. Dilerseniz{" "}
              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium inline cursor-pointer"
              >
                AI Asistan&apos;a
              </button>{" "}
              kendi göreviniz açısından soruyu nasıl ele alabileceğinizi sorabilirsiniz.
            </>
          )}
        </p>
      </div>

      {/* Ses / Metin Modu Sekmeleri */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-800/80 border border-slate-700/70 max-w-xs mx-auto mb-6">
        <button
          type="button"
          onClick={() => setMode("audio")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
            mode === "audio"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{t.tabAudio}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("text")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
            mode === "text"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>{t.tabText}</span>
        </button>
      </div>

      {/* Giriş Alanı */}
      <div className="min-h-[160px] flex flex-col justify-center mb-6">
        {mode === "audio" ? (
          <AudioRecorderControl
            recorder={recorder}
            maxDurationSec={question.maxDurationSec}
            initialAudioUrl={initialAudioUrl}
            initialDuration={initialResponse?.durationSec}
            onResetInitial={() => setInitialAudioUrl(null)}
            onAudioConfirmed={(blob, dur) => {
              onSaveDraft?.({
                questionId: question.id,
                mode: "audio",
                audioBlob: blob,
                durationSec: dur,
              });
            }}
          />
        ) : (
          <div className="w-full">
            <textarea
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onBlur={() => {
                if (textInput.trim().length > 0) {
                  onSaveDraft?.({
                    questionId: question.id,
                    mode: "text",
                    textResponse: textInput.trim(),
                  });
                }
              }}
              placeholder={t.textPlaceholder}
              className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500">
              <span>{textInput.trim().length} karakter</span>
            </div>
          </div>
        )}
      </div>

      {/* Alt Navigasyon Barı: Önceki Soru & Sonraki Soru & İptal Et */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {/* Sol Alan: Önceki Soru Butonu ve/veya İptal Et */}
        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.prevQuestion}</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
            >
              {t.cancelSessionBtn}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {canProceed && (
            <span className="hidden sm:inline-flex text-emerald-400 items-center gap-1 text-xs font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{mode === "audio" ? t.recordSuccess : t.textSuccess}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>
              {questionNumber === totalQuestions
                ? t.finishSurvey
                : t.nextQuestion}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* İptal Onay Modalı */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-white">{t.cancelModalTitle}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.cancelModalDesc}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                {t.cancelModalBackBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  onCancel?.();
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {t.cancelModalConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini AI Soru Asistanı Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        question={question}
        projectContext={projectContext}
        lang={lang}
        participantRole={participant?.title}
        participantCompany={participant?.company}
      />
    </div>
  );
};
