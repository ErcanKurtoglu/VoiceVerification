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
  Mail,
  Scale,
  Sparkles,
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
    contactEmail: "voiceverifyapp@gmail.com",
    tabs: {
      kvkk: "KVKK & GDPR Aydınlatma",
      biometric: "Biyometrik Güvence",
      terms: "Katılım Şartları (Terms)",
    },
    kvkk: {
      callout:
        "Bu aydınlatma metni; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) m. 10 ve AB Genel Veri Koruma Tüzüğü (GDPR) m. 13-14 uyarınca, veri sorumlusu sıfatıyla katılımcıları bilgilendirmek ve şeffaflığı sağlamak amacıyla hazırlanmıştır.",
      sec1Title: "1. Veri Sorumlusu ve İletişim Kanalları",
      sec1Text:
        "Veri sorumlusu VoiceVerify AI Araştırma Ekibi'dir (VoiceVerify AI Research Team). KVKK ve GDPR kapsamındaki tüm soru, bilgi edinme, silme veya rıza geri çekme talepleriniz için doğrudan araştırma ekibine başvurabilirsiniz:",
      sec2Title: "2. İşlenen Kişisel Veri Kategorileri & Toplama Yöntemi",
      sec2Text:
        "Araştırma kapsamında; Kimlik (Ad-Soyad), İletişim (E-posta), Mesleki Deneyim (Çalışılan Şirket/Tesis, Görev/Unvan), İşlem Güvenliği (Oturum ID, zaman damgası) ve İşitsel/İçeriksel Veri (Ses kayıtları ve transkriptler) toplanmaktadır. Veriler, anket web arayüzü üzerinden elektronik ortamda ve tamamen katılımcının kendi iradesiyle iletilmektedir.",
      sec3Title: "3. Veri İşleme Amaçları ve Hukuki Sebepleri",
      sec3Text:
        "Toplanan veriler; gıda sanayiinde plansız duruş maliyetleri ve 3B parça ihtiyaçlarının doğrulanması, katılımcı profilinin teyidi ve araştırma sonuç raporunun iletilmesi amacıyla işlenir. Hukuki sebepler: KVKK m. 5/1 ve GDPR m. 6(1)(a) uyarınca Açık Rıza; ayrıca araştırma metodolojisi gereğince KVKK m. 5/2-f ve GDPR m. 6(1)(f) uyarınca meşru menfaattir.",
      sec4Title: "4. Yapay Zeka (AI) İşleme ve Veri Aktarımı Sınırları",
      sec4Text:
        "Ses kayıtlarınız, gelişmiş konuşma tanıma (Speech-to-Text) ve yapay zeka modelleri üzerinden yalnızca yazılı metne dönüştürülmekte ve nitel içerik analizi yapılmaktadır. Verileriniz kesinlikle reklam/pazarlama amacıyla 3. şahıslara veya veri simsarlarına satılmaz, devredilmez.",
      sec5Title: "5. 30 Günlük Otomatik İmha Politikası",
      sec5Text:
        "Ham ses dosyaları, deşifre ve onaylama süreçleri tamamlandıktan sonra en geç 30 gün içinde sunuculardan kalıcı ve geri döndürülemez şekilde silinir. Nihai analiz ve araştırma raporlarında yalnızca tamamen anonimleştirilmiş içgörüler ve sektörel istatistikler saklanır.",
      sec6Title: "6. İlgili Kişi Hakları (KVKK m. 11 & GDPR m. 15-22)",
      sec6Text:
        "Dilediğiniz an verilerinizin işlenip işlenmediğini öğrenme, kopyasını talep etme, düzeltilmesini isteme, silinmesini veya açık rızanızın geri çekilmesini talep etme hakkına sahipsiniz. Başvurularınız için:",
    },
    biometric: {
      callout:
        "Yasal & Teknik Taahhüt: Sesiniz hiçbir koşulda biyometrik kimlik tanıma, ses parmak izi eşleme (voiceprint) veya ses klonlama amacıyla işlenmez.",
      sec1Title: "Biyometrik Veri Sınırı Nedir? (EDPB & KVKK İlke Kararları)",
      sec1Text:
        "KVKK m. 6 ve GDPR m. 9 uyarınca biyometrik veriler özel niteliklidir. Avrupa Veri Koruma Kurulu (EDPB) yönergeleri uyarınca; ses kaydı bir kişinin akustik kimliğini tekil olarak doğrulamak amacıyla işlenmediği sürece özel nitelikli biyometrik veri oluşturmaz. Platformumuz sesi yalnızca konuşulan kelimeleri metne döken bir girdi kanalı (Speech-to-Text) olarak kullanır; akustik ses izi veya frekans şablonu çıkarmaz.",
      sec2Title: "Katılımcıya Tam Kontrol & İnceleme Güvencesi",
      sec2Text:
        "Kaydı durdurduğunuzda ses otomatik olarak sisteme gönderilmez. Göndermeden önce sesinizi baştan sona dinleyebilir, tek tuşla silebilir veya yeniden kaydedebilirsiniz.",
      sec3Title: "Yazılı Yanıt Seçeneği ile Tam Eşitlik (Text Parity)",
      sec3Text:
        "Sesli yanıt vermek zorunlu değildir. Gürültülü ortamlarda veya kişisel tercihiniz doğrultusunda, her sorunun altındaki 'Yazarak Yanıtla' sekmesine geçerek düşüncelerinizi doğrudan klavye ile iletebilirsiniz.",
    },
    terms: {
      callout:
        "Bu koşullar, VoiceVerification AI araştırma platformuna katılım prensiplerini, gizlilik sınırlarını ve fikri mülkiyet çerçevesini belirler.",
      sec1Title: "1. Araştırma Niteliği & Ön-Ticari Kapsam (Customer Discovery)",
      sec1Text:
        "Bu çalışma, A-Side Challenge 2026 kapsamında gıda sanayiinde parça arızaları ve temin gecikmelerine ilişkin saha deneyimlerini doğrulamak amacıyla yürütülen ön-ticari bir Ar-Ge ve pazar keşif çalışmasıdır. Anketteki sorular ve AI asistan açıklamaları; bağlayıcı ticari teklif, kesin mühendislik/hijyen taahhüdü veya malzeme seçim garantisi teşkil etmez.",
      sec2Title: "2. Fabrika Gizliliği, Ticari Sırlar & Fikri Mülkiyet",
      sec2Text:
        "Katılımcıların tesislerine, hat mimarilerine veya özel işletme prosedürlerine ait bilgiler gizli tutulur. Katılımcıdan tescilli CAD çizimleri veya gizli şirket belgeleri talep edilmez. Araştırma çıktıları sektör geneline yönelik anonimleştirilmiş kıyaslama (benchmark) raporları olarak sunulur; fabrika ve şahıs isimleri yayınlanmaz.",
      sec3Title: "3. Veri Dürüstlüğü ve Anti-Garbage Koruması",
      sec3Text:
        "Katılımcı, yanıtlarında gerçek ve bizzat gözlemlediği saha tecrübelerini aktarmayı taahhüt eder. Sistem; bot aktivitelerini, boş/sessiz kayıtları, anlaşılmayan parazitleri ve honeypot girişimlerini filtreleyen çok katmanlı Anti-Garbage motoruyla korunmaktadır. Gerçek dışı girdiler analitik raporlardan elenir.",
    },
    footerRights: "VoiceVerification AI © 2026 • Tüm Hakları Saklıdır",
    footerBtn: "Okudum, Anladım",
  },
  en: {
    title: "Legal Terms & Data Security",
    subtitle: "VoiceVerification AI • Print It Right Research Framework",
    closeAria: "Close",
    contactEmail: "voiceverifyapp@gmail.com",
    tabs: {
      kvkk: "GDPR & KVKK Notice",
      biometric: "Biometric Protection",
      terms: "Terms of Participation",
    },
    kvkk: {
      callout:
        "This Privacy Notice is provided in accordance with Articles 13 & 14 of the EU General Data Protection Regulation (GDPR) and Article 10 of Turkish Law No. 6698 (KVKK) to ensure full transparency regarding data controller practices.",
      sec1Title: "1. Data Controller & Direct Contact Channel",
      sec1Text:
        "The data controller is the VoiceVerify AI Research Team. For any questions, data access requests, or consent withdrawal under GDPR and KVKK, please contact the research team directly:",
      sec2Title: "2. Categories of Personal Data & Collection Method",
      sec2Text:
        "We collect: Identity Data (Full Name), Contact Data (Email Address), Professional Background (Company/Plant, Job Title/Role), Technical Security Data (Session ID, timestamp), and Audio/Verbatim Data (Voice recordings and Speech-to-Text transcripts). All data is voluntarily provided by participants through our interactive web questionnaire.",
      sec3Title: "3. Purposes and Legal Bases for Processing",
      sec3Text:
        "Data is processed to validate downtime costs and 3D food-safe part challenges in manufacturing, authenticate participant eligibility, and deliver aggregated research findings. Legal bases: Explicit Consent pursuant to GDPR Art. 6(1)(a) & KVKK Art. 5/1, and Legitimate Interests pursuant to GDPR Art. 6(1)(f) & KVKK Art. 5/2-f.",
      sec4Title: "4. AI Processing & Third-Party Disclosure Limits",
      sec4Text:
        "Audio recordings are processed via Speech-to-Text (STT) and AI models exclusively to produce verbatim transcripts and qualitative thematic summaries. Your data is strictly never sold, rented, or transferred to commercial data brokers or advertisers.",
      sec5Title: "5. 30-Day Automated Audio Deletion Policy",
      sec5Text:
        "Raw audio recordings are permanently and irreversibly purged from our servers within 30 days of transcription and verification. Final research summaries and benchmark datasets contain exclusively anonymized, aggregated insights.",
      sec6Title: "6. Data Subject Rights (GDPR Articles 15-22 & KVKK Art. 11)",
      sec6Text:
        "You have the right to access, rectify, restrict, erase ('Right to be Forgotten'), or withdraw your consent at any time without adverse consequences. For requests, please contact:",
    },
    biometric: {
      callout:
        "Legal & Technical Guarantee: Your voice is never processed for acoustic biometric identification, voiceprint profiling, or synthetic voice cloning.",
      sec1Title: "Biometric Data Boundary (EDPB & Regulatory Framework)",
      sec1Text:
        "Under GDPR Article 9 and KVKK Article 6, biometric data constitutes special category data. According to European Data Protection Board (EDPB) Guidelines, voice recordings do not constitute biometric data unless processed through specific technical means enabling unique identification (such as acoustic voiceprints). We use voice solely as a Speech-to-Text input medium; no acoustic voiceprint or biometric template is ever generated.",
      sec2Title: "Full Participant Control & Review Guarantee",
      sec2Text:
        "Recordings are never submitted automatically. You can listen back, review, delete, or re-record your answer before finalizing submission.",
      sec3Title: "Equal Text Alternative (Text Parity)",
      sec3Text:
        "Voice recording is never compulsory. If you are in a noisy plant environment or prefer writing, simply switch to the 'Respond in Writing' tab on any question.",
    },
    terms: {
      callout:
        "These terms outline the pre-commercial research scope, confidentiality safeguards, and data integrity principles of VoiceVerification AI.",
      sec1Title: "1. Research Nature & Pre-Commercial Customer Discovery",
      sec1Text:
        "This platform is an exploratory R&D and market-need validation initiative conducted under A-Side Challenge 2026. Questionnaire items and AI copilot clarifications do not constitute binding commercial offers, warranty statements, or official engineering safety certifications.",
      sec2Title: "2. Plant Confidentiality, Trade Secrets & IP",
      sec2Text:
        "Proprietary manufacturing line designs and sensitive operational procedures remain strictly protected. Participants are never asked to submit confidential CAD models or trade secrets. Benchmark reports are published strictly in aggregated form with plant and participant identities redacted.",
      sec3Title: "3. Data Integrity & Anti-Garbage Undertaking",
      sec3Text:
        "Participants undertake to share genuine, firsthand operational experiences. The platform employs anti-garbage protections against bots, silent audio, and synthetic submissions. Ineligible or noise responses are isolated from analytical findings.",
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
                  <Shield className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec1Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec1Text}{" "}
                  <a
                    href={`mailto:${c.contactEmail}`}
                    className="text-indigo-300 font-mono underline hover:text-indigo-200"
                  >
                    {c.contactEmail}
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec2Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec2Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {c.kvkk.sec3Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec3Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec4Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec4Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {c.kvkk.sec5Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec5Text}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  {c.kvkk.sec6Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.kvkk.sec6Text}{" "}
                  <a
                    href={`mailto:${c.contactEmail}`}
                    className="text-indigo-300 font-mono underline hover:text-indigo-200"
                  >
                    {c.contactEmail}
                  </a>
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

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {c.biometric.sec3Title}
                </h4>
                <p className="text-slate-400 pl-6">
                  {c.biometric.sec3Text}
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
                {c.terms.callout}
              </div>

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
