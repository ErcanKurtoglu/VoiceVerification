"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mic,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  RotateCcw,
  UserCheck,
  Building,
  Mail,
  User,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import {
  SurveyConfig,
  ParticipantData,
  ParticipantSchema,
  TrackingData,
} from "@/types/interview";
import { generateShortId } from "@/lib/utils";
import { isSpamSubmission } from "@/features/anti-garbage/honeypot";
import { ConsentModal } from "./ConsentModal";
import { useLanguage } from "@/context/LanguageContext";

interface OnboardingFormProps {
  project: SurveyConfig;
  onSubmit: (data: ParticipantData, tracking?: TrackingData) => void;
  initialParticipant?: Partial<ParticipantData>;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  project,
  onSubmit,
  initialParticipant,
}) => {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentTab, setConsentTab] = useState<"kvkk" | "terms" | "biometric">("kvkk");

  const [tracking, setTracking] = useState<TrackingData>({});
  const [isPreFilled, setIsPreFilled] = useState(false);

  const [formData, setFormData] = useState<ParticipantData>({
    fullName: initialParticipant?.fullName || "",
    email: initialParticipant?.email || "",
    company: initialParticipant?.company || "",
    title: initialParticipant?.title || "",
    linkedinUrl: initialParticipant?.linkedinUrl || "",
    consentGiven: initialParticipant?.consentGiven || false,
    honeypot: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Initial participant varsa doğrudan uygula
    if (initialParticipant?.fullName && initialParticipant?.email) {
      setFormData((prev) => ({
        ...prev,
        fullName: initialParticipant.fullName || prev.fullName,
        email: initialParticipant.email || prev.email,
        company: initialParticipant.company || prev.company,
        title: initialParticipant.title || prev.title,
        consentGiven: initialParticipant.consentGiven || prev.consentGiven,
      }));
      setIsPreFilled(true);
      return;
    }

    if (!searchParams) return;

    // 2. Tracking Parametreleri & Otomatik UID Senkronizasyonu
    let uidParam = searchParams.get("uid") || searchParams.get("user_id") || undefined;
    const refParam = searchParams.get("ref") || searchParams.get("source") || undefined;
    const srcParam = searchParams.get("utm_source") || undefined;
    const campaignParam = searchParams.get("utm_campaign") || undefined;

    if (!uidParam && typeof window !== "undefined") {
      uidParam = generateShortId("usr");
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("uid", uidParam);
      window.history.replaceState({}, "", currentUrl.toString());
    }

    setTracking({
      uid: uidParam,
      ref: refParam,
      source: srcParam,
      campaign: campaignParam,
    });

    // 3. Standart Query Parametreleri (?name=...&email=...&company=...&title=...)
    const nameParam = searchParams.get("name") || "";
    const emailParam = searchParams.get("email") || "";
    const companyParam = searchParams.get("company") || "";
    const titleParam = searchParams.get("title") || "";
    const linkedinParam = searchParams.get("linkedin") || "";
    const consentParam = searchParams.get("consent") === "true";

    if (nameParam || emailParam || companyParam || titleParam) {
      setIsPreFilled(true);
      setFormData((prev) => ({
        ...prev,
        fullName: nameParam || prev.fullName,
        email: emailParam || prev.email,
        company: companyParam || prev.company,
        title: titleParam || prev.title,
        linkedinUrl: linkedinParam || prev.linkedinUrl,
        consentGiven: consentParam ? true : prev.consentGiven,
      }));
    }
  }, [searchParams, initialParticipant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-Garbage: Honeypot Denetimi
    if (isSpamSubmission(formData.honeypot)) {
      console.warn("Spam veya bot form gönderimi sessizce elendi.");
      return;
    }

    // Zod Doğrulaması
    const result = ParticipantSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data, tracking);
  };

  // URL ile gelen ve bilgileri tanımlanmış katılımcı modu (Sadece Privacy Check)
  const isDirectUrlParticipant = Boolean(
    formData.fullName && formData.email && formData.company
  );

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn">
      {/* 1. Başlık & Rozetler */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{project.tagline}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
          {project.title}
        </h1>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {project.description}
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Yaklaşık {project.estimatedMinutes} Dakika
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            {project.questions.length} Soru
          </span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            KVKK Uyumlu
          </span>
        </div>
      </div>

      {/* 2. Platform Kullanım İpuçları */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Görüşme İpuçları</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <Mic className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Ses & Metin:</strong> Konuşarak veya dilediğinizde yazarak yanıtlayın.</span>
          </div>
          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>AI Asistan:</strong> Takıldığınızda soru detayını asistana danışın.</span>
          </div>
          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Geri Dönüş:</strong> Önceki soruya dönebilir, kaydı dinleyebilirsiniz.</span>
          </div>
        </div>
      </div>

      {/* 3. Katılımcı Durumu: Kişisel URL Davetiyesi vs Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot Input */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot || ""}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {isDirectUrlParticipant ? (
          /* Senaryo A: Özel URL İle Gelen Katılımcı (Bilgiler Hazır, Sadece Privacy Check) */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
                <UserCheck className="w-4 h-4" />
                <span>Özel Davetiyeniz Doğrulandı</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Katılımcı</span>
                  <strong className="text-white text-sm">{formData.fullName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Kurum & Rol</span>
                  <span className="text-slate-200">{formData.company} • {formData.title}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-indigo-500/20 text-[11px] text-slate-400">
                <span>E-posta: </span>
                <span className="text-slate-300 font-mono">{formData.email}</span>
              </div>
            </div>

            {/* Sadece Gizlilik ve KVKK Onayı */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Ses kaydımın bu araştırma kapsamında deşifre edilmesini, anonim olarak işlenmesini ve{" "}
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
                    KVKK Metnini
                  </button>{" "}
                  kabul ediyorum.
                </span>
              </label>
              {errors.consentGiven && (
                <span className="text-[11px] text-red-400 mt-2 block">{errors.consentGiven}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>{t.onboardingStartBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Senaryo B: Standart Katılımcı Formu */
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.fullNameLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder={t.fullNamePlaceholder}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.fullName && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.fullName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.emailLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.email && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.companyLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder={t.companyPlaceholder}
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.company && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.company}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.titleLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder={t.titlePlaceholder}
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {errors.title && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.title}</span>
                )}
              </div>
            </div>

            {/* KVKK / Gizlilik Onayı */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleChange}
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
              {errors.consentGiven && (
                <span className="text-[11px] text-red-400 mt-1 block">{errors.consentGiven}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>{t.onboardingStartBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>

      {/* KVKK & Terms Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        defaultTab={consentTab}
      />
    </div>
  );
};
