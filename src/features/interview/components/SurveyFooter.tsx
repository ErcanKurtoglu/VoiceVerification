"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const SurveyFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 z-10">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>{t.surveyFooterSecureAccess}</span>
      </div>
      <div>
        <span>{t.surveyFooterPlatformTitle}</span>
      </div>
    </footer>
  );
};
