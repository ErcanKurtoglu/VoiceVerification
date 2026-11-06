"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export const AlreadyCompletedCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
        {t.alreadyCompletedTitle}
      </h2>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
        {t.alreadyCompletedDesc}
      </p>

      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
        >
          <span>{t.backToHome}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
