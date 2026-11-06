"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "tr",
  setLang: () => {},
  t: translations.tr,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("tr");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("voice_verify_lang") as Language;
      if (savedLang === "tr" || savedLang === "en") {
        setLangState(savedLang);
      }
    } catch {
      // LocalStorage hatası olursa varsayılan "tr" kalır
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("voice_verify_lang", newLang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner backdrop-blur-md ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className="flex items-center gap-1 pl-2 pr-1 text-slate-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLang("tr")}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all ${
          lang === "tr"
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all ${
          lang === "en"
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
};
