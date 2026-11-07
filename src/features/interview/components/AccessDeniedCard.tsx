"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  Home,
  KeyRound,
  ShieldCheck,
  Building,
  User,
  Mail,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import { getSurveyById } from "@/surveys";
import { ConsentModal } from "./ConsentModal";
import { useLanguage } from "@/context/LanguageContext";

interface AccessDeniedCardProps {
  reason: "missing_access" | "expired" | "invalid_code" | "survey_inactive";
  surveyId: string;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  reason,
  surveyId,
}) => {
  const { t, lang } = useLanguage();
  const survey = getSurveyById(surveyId);

  // Anket pasife alınmışsa form gösterme, doğrudan net uyarı sun
  if (reason === "survey_inactive") {
    return (
      <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl animate-fadeIn text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
          <PauseCircle className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium font-mono uppercase">
          Anket Pasif Durumda
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-3 mb-2">
          {survey.title}
        </h2>

        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          Bu araştırma anketinin veri toplama ve görüşme süreci yönetici tarafından geçici olarak durdurulmuştur veya tamamlanmıştır. Şu anda yeni bir yanıt kabul edilmemektedir.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const [code, setCode] = useState("");
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

    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg("Lütfen geçerli bir erişim veya davetiye kodu (PIN) giriniz.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !company.trim() || !title.trim()) {
      setErrorMsg("Lütfen tüm zorunlu katılımcı alanlarını doldurunuz.");
      return;
    }

    if (!consentGiven) {
      setErrorMsg("Görüşmeye başlamak için aydınlatma ve kullanım şartlarını onaylamalısınız.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId,
          accessPin: cleanCode,
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
        setInfoMsg("Mevcut oturum ve süreli bağlantınız geri yüklendi. Yönlendiriliyorsunuz...");
      }

      // Üretilen veya geri yüklenen tekil süreli token URL'ine yönlendirme
      setTimeout(() => {
        window.location.href = data.url;
      }, 500);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn">
      {/* Üst İkon & Başlık */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium font-mono uppercase">
          {survey.tagline}
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-3 mb-2">
          {survey.title}
        </h2>

        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Bu araştırma sektör profesyonellerine özel olarak sınırlandırılmıştır. 
          Kişisel bir davet linkiniz yoksa, lütfen size iletilen <strong>Erişim Kodu (PIN)</strong> ve bilgilerinizi giriniz.
        </p>
      </div>

      {/* Bilgilendirme / Geri Yükleme Mesajı */}
      {infoMsg && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{infoMsg}</span>
        </div>
      )}

      {/* Hata Mesajı */}
      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Giriş Formu */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Erişim Kodu */}
        <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
          <label className="block text-xs font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Erişim Kodu (PIN) <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t.accessDeniedPinInputPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-white font-mono uppercase tracking-wider text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">
            {lang === "en" ? "Enter the access PIN provided for your organization." : "Kurumunuza iletilen anket erişim PIN kodunu giriniz."}
          </span>
        </div>

        {/* 2. Ad Soyad & E-posta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ad Soyad <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn: Burak Kaya"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              E-posta <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="burak@sirketiniz.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* 3. Şirket & Unvan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Şirket / Kurum <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Örn: Fabrika veya Bağımsız"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Unvan / Rol <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Üretim Mühendisi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* 4. KVKK / Gizlilik Onayı */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              Ses kaydımın deşifre edilmesini, anonim olarak işlenmesini ve{" "}
              <button
                type="button"
                onClick={() => {
                  setConsentTab("terms");
                  setIsConsentOpen(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Kullanım Şartları
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
                KVKK Aydınlatma Metnini
              </button>{" "}
              kabul ediyorum.
            </span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Oturum Doğrulanıyor...</span>
              </>
            ) : (
              <>
                <span>Doğrula ve Görüşmeye Başla</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </form>

      {/* Yasal Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        defaultTab={consentTab}
      />
    </div>
  );
};
