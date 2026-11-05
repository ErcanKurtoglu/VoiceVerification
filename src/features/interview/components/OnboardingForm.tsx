"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { ParticipantData, ParticipantSchema, ProjectConfig } from "@/types/interview";
import { isSpamSubmission } from "@/features/anti-garbage/honeypot";
import { ConsentModal } from "./ConsentModal";

interface OnboardingFormProps {
  project: ProjectConfig;
  onSubmit: (data: ParticipantData) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ project, onSubmit }) => {
  const searchParams = useSearchParams();
  const [isConsentOpen, setIsConsentOpen] = useState(false);

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

  // URL Query Parametrelerinden otomatik doldurma (Hibrit Giriş / Magic Link)
  useEffect(() => {
    if (!searchParams) return;
    const nameParam = searchParams.get("name") || "";
    const emailParam = searchParams.get("email") || "";
    const companyParam = searchParams.get("company") || "";
    const titleParam = searchParams.get("title") || "";
    const linkedinParam = searchParams.get("linkedin") || "";

    if (nameParam || emailParam || companyParam || titleParam) {
      setFormData((prev) => ({
        ...prev,
        fullName: nameParam || prev.fullName,
        email: emailParam || prev.email,
        company: companyParam || prev.company,
        title: titleParam || prev.title,
        linkedinUrl: linkedinParam || prev.linkedinUrl,
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

    onSubmit(validation.data);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* Üst Bilgi Rozeti */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sektörel Doğrulama Araştırması</span>
        </span>
        <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>~{project.estimatedMinutes} Dakika</span>
        </span>
      </div>

      {/* Başlık ve Açıklama */}
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-3">
        {project.title}
      </h1>
      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
        {project.description}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot Input (Görünmez Bot Tuzağı) */}
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
              placeholder="Örn: Tech A.Ş. veya Serbest"
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
              placeholder="Örn: Ürün Yöneticisi, Kurucu vb."
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {errors.title && (
              <span className="text-[11px] text-red-400 mt-1 block">{errors.title}</span>
            )}
          </div>
        </div>

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

        {/* KVKK / Ses Rızası Onayı */}
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
              Ses kaydımın yapay zeka ile metne dönüştürülmesini ve anonimleştirilerek araştırma raporuna dahil edilmesini kabul ediyorum.{" "}
              <button
                type="button"
                onClick={() => setIsConsentOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Aydınlatma Metnini İncele
              </button>
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
          <span>Görüşmeye Başla</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* KVKK Modal */}
      <ConsentModal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} />
    </div>
  );
};
