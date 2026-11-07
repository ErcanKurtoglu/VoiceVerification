"use client";

import React, { useState } from "react";
import {
  Shield,
  X,
  CheckCircle2,
  FileText,
  Lock,
  Clock,
  Fingerprint,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "kvkk" | "terms" | "biometric";
}

const MODAL_CONTENT = {
  tr: {
    title: "Hukuki Şartlar & Veri Güvenliği",
    subtitle: "VoiceVerification AI • Print It Right Araştırma Çerçevesi",
    closeAria: "Kapat",
    tabs: {
      kvkk: "KVKK & GDPR Metni",
      biometric: "Biyometrik Güvence",
      terms: "Kullanıcı Şartları (Terms)",
    },
    kvkk: {
      callout:
        "Bu araştırma, 6698 sayılı KVKK ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamında gıda sanayiinde plansız duruş maliyetleri ve 3B parça ihtiyaçlarını doğrulamak üzere yürütülmektedir.",
      sec1Title: "1. Veri Sorumlusu ve İşleme Amaçları",
      sec1Text:
        "İlettiğiniz ad-soyad, e-posta, şirket ve unvan verileri katılımcı profilini doğrulamak ve araştırma sonuç raporunu tarafınıza iletmek amacıyla işlenir. Yanıtlarınız sektörel istatistiklere dönüştürülür.",
      sec2Title: "2. Ses Kaydının Deşifresi ve NLP Analizi",
      sec2Text:
        "Kaydettiğiniz ses, gelişmiş yapay zeka (AI) ve konuşma tanıma (STT) modelleri üzerinden yalnızca yazılı metne dönüştürülmekte ve içerik analizi yapılmaktadır. Sesiniz asla pazarlama verisi olarak 3. kişilere satılmaz.",
      sec3Title: "3. Veri Saklama ve 30 Günlük Otomatik İmha",
      sec3Text:
        "Ham ses dosyaları deşifre ve onaylama süreci tamamlandıktan sonra en geç 30 gün içinde sunuculardan kalıcı olarak silinir. Raporlarda yalnızca tamamen anonimleştirilmiş içgörüler kullanılır.",
      sec4Title: "4. KVKK Madde 11 Kapsamındaki Haklarınız",
      sec4Text:
        "Dilediğiniz an verilerinizin silinmesini, anonim hale getirilmesini veya açık rızanızın geri çekilmesini talep edebilirsiniz. Başvurularınız için:",
    },
    biometric: {
      callout:
        "Yasal Taahhüt: Sesiniz hiçbir zaman akustik biyometrik kimlik doğrulama, ses izi eşleme veya ses klonlama amacıyla işlenmez.",
      sec1Title: "Biyometrik Veri Sınırı Nedir?",
      sec1Text:
        "KVKK m.6 kapsamında biyometrik veriler özel niteliklidir. Platformumuz, ses dalgalarınızdan biyometrik kimlik veya ses parmak izi (voiceprint) çıkarımı yapmaz. Ses yalnızca \"Speech-to-Text\" aracılığıyla metin karakterlerine dönüştürülür.",
      sec2Title: "Kullanıcıya Tam Denetim Güvencesi",
      sec2Text:
        "Kaydı tamamladığınızda ses otomatik gönderilmez. Dinleyebilir, silebilir, yeniden kaydedebilir veya dilediğiniz zaman tek tıkla \"Yazarak Yanıtla\" sekmesine geçebilirsiniz.",
    },
    terms: {
      sec1Title: "1. Araştırma Niteliği & Ön-Ticari Kapsam",
      sec1Text:
        "Bu çalışma gıdaya uygun 3B parça üretimi hipotezlerini doğrulamak için tasarlanmıştır. Görüşmedeki sorular veya AI asistan yanıtları bağlayıcı ticari teklif veya nihai mühendislik garantisi teşkil etmez.",
      sec2Title: "2. Ticari Sırlar & Fikri Mülkiyet",
      sec2Text:
        "Katılımcının fabrikasındaki tescilli hat tasarımları korunur. Raporlamalar yalnızca agregasyon yapılarak toplu içgörü şeklinde sunulur; fabrika isimleri gizlenir.",
      sec3Title: "3. Bot & Spam Koruması (Anti-Garbage)",
      sec3Text:
        "Sistem bot aktivitelerini, ses kalitesizliğini (sessizlik, parazit, honeypot) otomatik engeller. Katılımcı gerçek tecrübelerini aktarmayı taahhüt eder.",
    },
    footerRights: "VoiceVerification AI © 2026 • Tüm Hakları Saklıdır",
    footerBtn: "Okudum, Anladım",
  },
  en: {
    title: "Legal Terms & Data Security",
    subtitle: "VoiceVerification AI • Print It Right Research Framework",
    closeAria: "Close",
    tabs: {
      kvkk: "GDPR & Privacy Policy",
      biometric: "Biometric Protection",
      terms: "Terms of Use",
    },
    kvkk: {
      callout:
        "This research is conducted under the EU General Data Protection Regulation (GDPR) and Law No. 6698 (KVKK) to validate unplanned downtime costs and 3D part requirements in industrial manufacturing.",
      sec1Title: "1. Data Controller & Processing Purposes",
      sec1Text:
        "Your full name, email, company, and job title are processed to verify participant profiles and share aggregate research findings. Your responses are converted into sectoral statistics.",
      sec2Title: "2. Audio Transcription & NLP Analysis",
      sec2Text:
        "Your recorded audio is converted into text via Speech-to-Text (STT) models and analyzed for qualitative insights. Your voice is never sold or used for marketing profiling.",
      sec3Title: "3. Data Retention & 30-Day Automated Deletion",
      sec3Text:
        "Raw audio files are permanently purged from servers within 30 days after transcription and verification. Benchmark reports contain only completely anonymized insights.",
      sec4Title: "4. Your Rights Under GDPR & Data Protection Regulations",
      sec4Text:
        "You may request the deletion, anonymization, or withdrawal of consent for your data at any time. For requests, please contact:",
    },
    biometric: {
      callout:
        "Legal Guarantee: Your voice is never processed for acoustic biometric identification, voiceprint matching, or voice cloning.",
      sec1Title: "What Is the Biometric Data Boundary?",
      sec1Text:
        "Biometric data is classified as special category data under GDPR Article 9. Our platform does not extract biometric identifiers or voiceprints from your speech. Voice is strictly converted into text characters via Speech-to-Text.",
      sec2Title: "Full Participant Control Guarantee",
      sec2Text:
        "Recordings are never automatically submitted. You can review, delete, re-record, or switch to the 'Respond in Writing' tab at any time.",
    },
    terms: {
      sec1Title: "1. Research Nature & Pre-Commercial Scope",
      sec1Text:
        "This study is designed for early-stage customer discovery and market need validation. Questions or AI assistant clarifications do not constitute binding commercial offers or final engineering warranties.",
      sec2Title: "2. Trade Secrets & Intellectual Property",
      sec2Text:
        "Proprietary factory designs and confidential operating procedures remain strictly protected. Insights are published solely in aggregate form, and individual enterprise identities remain confidential.",
      sec3Title: "3. Bot & Spam Protection (Anti-Garbage)",
      sec3Text:
        "The platform automatically detects and filters automated bot activity, silence, and low audio fidelity. Participants agree to share genuine professional insights.",
    },
    footerRights: "VoiceVerification AI © 2026 • All Rights Reserved",
    footerBtn: "I Understand & Acknowledge",
  },
};

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "kvkk",
}) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"kvkk" | "terms" | "biometric">(defaultTab);

  if (!isOpen) return null;

  const c = MODAL_CONTENT[lang] || MODAL_CONTENT.tr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-h-[90vh] flex flex-col">
        {/* 1. Başlık & Sekmeler */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {c.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {c.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={c.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekme Butonları */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("kvkk")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "kvkk"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{c.tabs.kvkk}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("biometric")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "biometric"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{c.tabs.biometric}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "terms"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{c.tabs.terms}</span>
          </button>
        </div>

        {/* 2. Kaydırılabilir İçerik Alanı */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-300 leading-relaxed pr-1 custom-scrollbar">
          {activeTab === "kvkk" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
                {c.kvkk.callout}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec1Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec1Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {c.kvkk.sec2Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec2Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {c.kvkk.sec3Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec3Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec4Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec4Text} <code className="text-indigo-300">privacy@voiceverify.ai</code>
                </p>
              </div>
            </div>
          )}

          {activeTab === "biometric" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-[11px] leading-relaxed">
                {c.biometric.callout}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  {c.biometric.sec1Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.biometric.sec1Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  {c.biometric.sec2Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.biometric.sec2Text}
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {c.terms.sec1Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.terms.sec1Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  {c.terms.sec2Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.terms.sec2Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {c.terms.sec3Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.terms.sec3Text}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Alt Buton */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {c.footerRights}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
          >
            {c.footerBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
