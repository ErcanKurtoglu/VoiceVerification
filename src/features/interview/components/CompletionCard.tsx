"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ParticipantData } from "@/types/interview";
import { useLanguage } from "@/context/LanguageContext";

interface CompletionCardProps {
  participant: ParticipantData;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  participant,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    // Şık konfeti kutlaması
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#10b981"],
      });
    } catch {
      // Confetti render hatası olursa sessizce geç
    }
  }, []);

  const firstName = participant.fullName ? participant.fullName.split(" ")[0] : "";

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
        <CheckCircle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
        {t.completionTitle}{firstName ? `, ${firstName}` : ""}!
      </h2>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
        {t.completionSubtitle}
      </p>

      {/* Güvenlik & İşleme Bilgilendirme Rozeti (Vaatsiz, Güven Veren Şeffaf Mesaj) */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-left flex items-start gap-3.5 mb-8">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white mb-0.5">
            {t.completionBadgeTitle}
          </h4>
          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            {t.completionBadgeDesc}
          </p>
        </div>
      </div>

      {/* Yalnızca Ana Sayfaya Dönüş Butonu (Yeni Yanıt Başlat butonu tamamen kaldırıldı) */}
      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          <span>{t.backToHome}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
