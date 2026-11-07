"use client";

import React, { useState } from "react";
import { Star, CheckCircle, Send, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { FeedbackData } from "@/types/interview";
import { useLanguage } from "@/context/LanguageContext";

interface FeedbackFormProps {
  onSubmit: (feedback: FeedbackData) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  onBack,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  // Kullanıcı henüz bir seçim yapmadıysa 0 (seçim yapılmadı) olarak başlatıyoruz
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleTag = (tag: string) => {
    if (isSubmitting) return;
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStarClick = (star: number) => {
    if (isSubmitting) return;
    // Tıklanan yıldıza tekrar basılırsa seçimi kaldır (0'a döndür)
    setRating((prev) => (prev === star ? 0 : star));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit({
      rating: rating > 0 ? rating : 0,
      tags: selectedTags,
      notes: notes.trim(),
    });
  };

  const effectiveRating = hoverRating || rating;

  return (
    <div
      className={`w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn transition-all ${
        isSubmitting ? "opacity-90 cursor-wait select-none" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.feedbackBadge}</span>
        </span>

        {onBack && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.feedbackBackToQuestions}</span>
          </button>
        )}
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
        {t.feedbackTitle}
      </h2>
      <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
        {t.feedbackSubtitle}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isSubmitting} className="contents">
          {/* Yıldız Puanlama */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400 mb-2 font-medium">
              {t.feedbackRatingLabel}
            </span>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                  onMouseLeave={() => !isSubmitting && setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                  className="p-1 text-slate-600 hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed transition-transform focus:outline-none"
                  aria-label={`${star} Star`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      effectiveRating >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-700"
                    } ${isSubmitting ? "opacity-75" : ""}`}
                  />
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {rating > 0 ? (
                <span className="text-amber-400 font-semibold">{rating}.0 / 5.0</span>
              ) : (
                <span className="text-slate-500 italic">{t.feedbackNoRatingYet}</span>
              )}
            </span>
          </div>

          {/* Hızlı Seçim Tag'leri */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2.5">
              {t.feedbackTagsTitle}{" "}
              <span className="text-slate-500">{t.feedbackTagsSubtitle}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {t.feedbackTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Not Alanı */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.feedbackNotesLabel}</span>
            </label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.feedbackNotesPlaceholder}
              className="w-full p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.feedbackSubmittingBtn}</span>
              </>
            ) : (
              <>
                <span>{t.feedbackSubmitBtn}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </fieldset>
      </form>
    </div>
  );
};
