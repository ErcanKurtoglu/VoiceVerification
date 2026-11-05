"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle, Mail, FileText, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { ParticipantData } from "@/types/interview";

interface CompletionCardProps {
  participant: ParticipantData;
  leadReward: string;
  onReset: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  participant,
  leadReward,
  onReset,
}) => {
  useEffect(() => {
    // Şık konfeti patlaması
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

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
        <CheckCircle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
        Teşekkür Ederiz, {participant.fullName.split(" ")[0]}!
      </h2>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
        Değerli görüşleriniz ve vaktiniz için çok teşekkürler. Sektör tecrübeniz ürünümüzün doğru yönde şekillenmesinde kritik rol oynayacak.
      </p>

      {/* Rapor Teslim Kartı */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-left flex items-start gap-3.5 mb-8">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white mb-0.5">
            {leadReward}
          </h4>
          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            Araştırma tamamlandığında hazırlanan yönetici özeti ve sektör trend raporu doğrudan{" "}
            <strong className="text-white">{participant.email}</strong> adresinize gönderilecektir.
          </p>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/admin"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <FileText className="w-4 h-4" />
          <span>Yönetici Analiz Raporunu İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Yeni Bir Yanıt Başlat</span>
        </button>
      </div>
    </div>
  );
};
