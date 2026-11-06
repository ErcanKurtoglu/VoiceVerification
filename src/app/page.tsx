"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  ShieldCheck,
  Bot,
  Zap,
  Lock,
  Volume2,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ConsentModal } from "@/features/interview/components/ConsentModal";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function LandingPage() {
  const { t, lang } = useLanguage();

  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentTab, setConsentTab] = useState<"kvkk" | "terms" | "biometric">("kvkk");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanPin = pin.trim().toUpperCase();

    if (!cleanPin) {
      setErrorMsg(t.pinError);
      return;
    }

    if (!fullName.trim() || !email.trim() || !company.trim() || !title.trim()) {
      setErrorMsg(t.missingFieldsError);
      return;
    }

    if (!consentGiven) {
      setErrorMsg(t.consentError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessPin: cleanPin,
          fullName: fullName.trim(),
          email: email.trim(),
          company: company.trim(),
          title: title.trim(),
          validDays: 7,
          mode: "participant",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş işlemi gerçekleştirilemedi.");
      }

      if (data.isExisting) {
        setInfoMsg(t.sessionRestoredInfo);
      } else {
        setInfoMsg(t.sessionVerifiedInfo);
      }

      // Üretilen veya geri yüklenen tekil süreli token URL'ine doğrudan yönlendirme
      setTimeout(() => {
        window.location.href = data.url;
      }, 400);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient Arka Plan Işıkları */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. Üst Menü / Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-none">
              VoiceVerify <span className="text-indigo-400 font-mono text-xs">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{t.brandTagline}</span>
          </div>
        </div>

        {/* TR / EN Dil Seçici Butonu */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </header>

      {/* 2. Hero Bölümü & PIN ile Giriş Kartı */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          {t.heroTitleStart}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            {t.heroTitleHighlight}
          </span>
          {t.heroTitleEnd}
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          {t.heroDescription}
        </p>

        {/* PIN ve Katılımcı Bilgileriyle Görüşmeye Giriş Kartı */}
        <div className="w-full max-w-xl p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-left mb-12">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t.pinCardTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.pinCardSubtitle}
              </p>
            </div>
          </div>

          {infoMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. PIN Kodu */}
            <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <label className="block text-xs font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.pinLabel} <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-white font-mono uppercase tracking-wider text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t.pinHelper}
              </span>
            </div>

            {/* 2. Ad Soyad & E-posta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.fullNameLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.emailLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* 3. Şirket & Unvan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.companyLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.companyPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.titleLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* 4. KVKK / Gizlilik Onayı */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  {lang === "tr" ? (
                    <>
                      Ses kaydımın deşifre edilmesini, anonim olarak işlenmesini ve{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setConsentTab("terms");
                          setIsConsentOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        {t.termsLink}
                      </button>{" "}
                      ile{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setConsentTab("kvkk");
                          setIsConsentOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        {t.kvkkLink}
                      </button>{" "}
                      kabul ediyorum.
                    </>
                  ) : (
                    <>
                      {t.consentCheckbox}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setConsentTab("terms");
                          setIsConsentOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        {t.termsLink}
                      </button>{" "}
                      &{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setConsentTab("kvkk");
                          setIsConsentOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        {t.kvkkLink}
                      </button>
                    </>
                  )}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.submittingText}</span>
                </>
              ) : (
                <>
                  <span>{t.submitButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 3 Adımlı Akış Bilgisi */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">{t.step1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">{t.step2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">{t.step3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Kurumsal Özellikler & Güvenlik Mimarisi */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-slate-900 z-10">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t.featuresTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">{t.feat1Title}</h4>
            <p className="text-slate-400 leading-relaxed">{t.feat1Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">{t.feat2Title}</h4>
            <p className="text-slate-400 leading-relaxed">{t.feat2Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">{t.feat3Title}</h4>
            <p className="text-slate-400 leading-relaxed">{t.feat3Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">{t.feat4Title}</h4>
            <p className="text-slate-400 leading-relaxed">{t.feat4Desc}</p>
          </div>
        </div>
      </section>

      {/* 4. Alt Footer & Yasal Bilgilendirme */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t.footerNoBiometrics}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => {
              setConsentTab("kvkk");
              setIsConsentOpen(true);
            }}
            className="text-slate-400 hover:text-indigo-400 transition-colors underline"
          >
            {t.footerKvkk}
          </button>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => {
              setConsentTab("terms");
              setIsConsentOpen(true);
            }}
            className="text-slate-400 hover:text-indigo-400 transition-colors underline"
          >
            {t.footerTerms}
          </button>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => {
              setConsentTab("biometric");
              setIsConsentOpen(true);
            }}
            className="text-slate-400 hover:text-indigo-400 transition-colors underline"
          >
            {t.footerBiometricPolicy}
          </button>
        </div>
        <div>
          <span>{t.footerCopyright}</span>
        </div>
      </footer>

      {/* Yasal & Gizlilik Modalı */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        defaultTab={consentTab}
      />
    </main>
  );
}
