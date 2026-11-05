"use client";

import React, { useState } from "react";
import { Star, CheckCircle, Send, MessageSquare } from "lucide-react";
import { FeedbackData } from "@/types/interview";

interface FeedbackFormProps {
  onSubmit: (feedback: FeedbackData) => void;
  isSubmitting?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const availableTags = [
    "Hızlı ve pratikti",
    "Sesli yanıt vermek çok rahattı",
    "Geleneksel anketlerden çok daha iyi",
    "AI Asistan netleştirmesi faydalıydı",
    "Mikrofon deneyimi sorunsuzdu",
    "Takvim/Zoom derdi olmaması harika",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating,
      tags: selectedTags,
      notes: notes.trim(),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Sorular Tamamlandı!</span>
        </span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
        Bu Deneyimi Nasıl Buldunuz?
      </h2>
      <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
        Geliştirdiğimiz bu sesli doğrulama yöntemini geleneksel formlara ve toplantılara kıyasla değerlendirmeniz, sistemi geliştirmemiz için çok değerlidir.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Yıldız Puanlama */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
          <span className="text-xs text-slate-400 mb-2 font-medium">Genel Deneyim Puanınız</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hoverRating || rating) >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-700"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Hızlı Seçim Tag'leri */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2.5">
            En çok neleri beğendiniz? <span className="text-slate-500">(Birden fazla seçebilirsiniz)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
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
            <span>Eklemek istediğiniz bir geri bildirim var mı?</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Arayüz, ses kalitesi veya soru akışıyla ilgili önerileriniz..."
            className="w-full p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white font-medium text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isSubmitting ? (
            <span>Gönderiliyor ve Analiz Ediliyor...</span>
          ) : (
            <>
              <span>Görüşmeyi Tamamla</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
