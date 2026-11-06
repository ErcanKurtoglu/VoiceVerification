"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Mic,
  PenLine,
  HelpCircle,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import {
  ParticipantData,
  ParticipantSchema,
  SurveyConfig,
  TrackingData,
} from "@/types/interview";
import { generateShortId } from "@/lib/utils";
import { isSpamSubmission } from "@/features/anti-garbage/honeypot";
import { ConsentModal } from "./ConsentModal";

interface OnboardingFormProps {
  project: SurveyConfig;
  onSubmit: (data: ParticipantData, tracking?: TrackingData) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ project, onSubmit }) => {
  const searchParams = useSearchParams();
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentTab, setConsentTab] = useState<"kvkk" | "terms" | "biometric">("kvkk");

  const [tracking, setTracking] = useState<TrackingData>({});
  const [isPreFilled, setIsPreFilled] = useState(false);

  const [formData, setFormData] = useState<ParticipantData>({
    fullName: "",
    email: "",
    company: "",
    title: "",
    linkedinUrl: "",
    consentGiven: false,
    honeypot: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // URL Query Parametrelerinden otomatik doldurma ve Tracking (Typeform / Formbricks Modeli)
  useEffect(() => {
    if (!searchParams) return;

    // 1. Tracking Parametreleri & Otomatik UID Senkronizasyonu
    let uidParam = searchParams.get("uid") || searchParams.get("user_id") || undefined;
    const refParam = searchParams.get("ref") || searchParams.get("source") || undefined;
    const srcParam = searchParams.get("utm_source") || undefined;
    const campaignParam = searchParams.get("utm_campaign") || undefined;

    // Eğer URL'de UID yoksa, anında tekil bir oturum UID'si üret ve adres çubuğuna yaz
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

    // 2. Geliştirici Kısayolu (?n=e)
    const quickN = searchParams.get("n");
    if (quickN) {
      const alias = quickN === "e" ? "Ercan" : quickN;
      const quickData: ParticipantData = {
        fullName: alias,
        email: `${quickN}@test.com`,
        company: "A-Side Project",
        title: "Challenge Lead",
        linkedinUrl: "",
        consentGiven: true,
        honeypot: "",
      };
      setFormData(quickData);
      setIsPreFilled(true);
      return;
    }

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
  }, [searchParams]);

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
      setErrors({ form: "Spam bot aktivitesi engellendi." });
      return;
    }

    const validation = ParticipantSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(validation.data, tracking);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* 1. Üst Bilgi & Rozetler */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{project.tagline}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>~{project.estimatedMinutes} Dakika • {project.questions.length} Soru</span>
        </span>
      </div>

      {/* 2. Survey Başlığı & Açıklaması */}
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-3">
        {project.title}
      </h1>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
        {project.description}
      </p>

      {/* 3. Platform Nasıl Kullanılır? (Tips & Rehber Kartı) */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6 space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nasıl Çalışır? (Platform İpuçları)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <Mic className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Sesli Yanıt:</strong> Mikrofona basıp düşüncelerinizi sesli söyleyin; en hızlı yoldur.</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <PenLine className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span><strong>Yazılı Seçenek:</strong> Dilerseniz tek tıkla yazarak da fikirlerinizi iletebilirsiniz.</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>AI Asistan:</strong> Soruyu açmak veya örnek istemek için sağ üstteki asistanı kullanın.</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Güvenli Kontrol:</strong> Sesinizi göndermeden önce dinleyebilir veya silebilirsiniz.</span>
          </div>
        </div>
      </div>

      {/* 4. Katılımcı Bilgileri & Tracking */}
      {isPreFilled && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-4">
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Bilgileriniz davet bağlantınızdan otomatik olarak tanımlandı.</span>
        </div>
      )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Ad Soyad <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Örn: Ayşe Yılmaz"
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
              E-posta Adresi <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Örn: ayse@sirketiniz.com"
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
              Şirket / Kurum <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="company"
              placeholder="Örn: Sütaş, Danone veya Bağımsız"
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
              Unvan / Rol <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Örn: Bakım Mühendisi, Fabrika Müdürü vb."
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {errors.title && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.title}</span>
            )}
          </div>
        </div>

        {/* LinkedIn Profili şimdilik pasife alındı
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            LinkedIn Profili <span className="text-slate-500 font-normal">(İsteğe bağlı)</span>
          </label>
          <input
            type="url"
            name="linkedinUrl"
            placeholder="https://linkedin.com/in/profiliniz"
            value={formData.linkedinUrl || ""}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        */}

        {/* 5. KVKK / Gizlilik & Ses Rızası Onayı */}
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
              Ses kaydımın bu araştırma kapsamında yapay zeka modelleriyle deşifre edilmesini, anonimleştirilerek işlenmesini ve{" "}
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
            <span className="text-[11px] text-red-400 mt-1.5 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {errors.consentGiven}
            </span>
          )}
        </div>

        {errors.form && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {errors.form}
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99]"
        >
          <span>Görüşmeye Başla (Soru 1)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
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
