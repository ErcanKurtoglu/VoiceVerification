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

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "kvkk" | "terms" | "biometric";
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "kvkk",
}) => {
  const [activeTab, setActiveTab] = useState<"kvkk" | "terms" | "biometric">(defaultTab);

  if (!isOpen) return null;

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
                Hukuki Şartlar & Veri Güvenliği
              </h3>
              <p className="text-[11px] text-slate-400">
                VoiceVerification AI • Print It Right Araştırma Çerçevesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
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
            <span>KVKK & GDPR Metni</span>
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
            <span>Biyometrik Güvence</span>
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
            <span>Kullanıcı Şartları (Terms)</span>
          </button>
        </div>

        {/* 2. Kaydırılabilir İçerik Alanı */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-300 leading-relaxed pr-1 custom-scrollbar">
          {activeTab === "kvkk" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
                Bu araştırma, 6698 sayılı KVKK ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamında gıda sanayiinde plansız duruş maliyetleri ve 3B parça ihtiyaçlarını doğrulamak üzere yürütülmektedir.
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  1. Veri Sorumlusu ve İşleme Amaçları
                </h4>
                <p className="text-slate-400 pl-6">
                  İlettiğiniz ad-soyad, e-posta, şirket ve unvan verileri katılımcı profilini doğrulamak ve araştırma sonuç raporunu tarafınıza iletmek amacıyla işlenir. Yanıtlarınız sektörel istatistiklere dönüştürülür.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  2. Ses Kaydının Deşifresi ve NLP Analizi
                </h4>
                <p className="text-slate-400 pl-6">
                  Kaydettiğiniz ses, gelişmiş yapay zeka (AI) ve konuşma tanıma (STT) modelleri üzerinden yalnızca yazılı metne dönüştürülmekte ve içerik analizi yapılmaktadır. Sesiniz asla pazarlama verisi olarak 3. kişilere satılmaz.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  3. Veri Saklama ve 30 Günlük Otomatik İmha
                </h4>
                <p className="text-slate-400 pl-6">
                  Ham ses dosyaları deşifre ve onaylama süreci tamamlandıktan sonra en geç <strong>30 gün içinde</strong> sunuculardan kalıcı olarak silinir. Raporlarda yalnızca tamamen anonimleştirilmiş içgörüler kullanılır.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  4. KVKK Madde 11 Kapsamındaki Haklarınız
                </h4>
                <p className="text-slate-400 pl-6">
                  Dilediğiniz an verilerinizin silinmesini, anonim hale getirilmesini veya açık rızanızın geri çekilmesini talep edebilirsiniz. Başvurularınız için: <code className="text-indigo-300">privacy@voiceverify.ai</code>
                </p>
              </div>
            </div>
          )}

          {activeTab === "biometric" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-[11px] leading-relaxed">
                <strong>Yasal Taahhüt:</strong> Sesiniz hiçbir zaman akustik biyometrik kimlik doğrulama, ses izi eşleme veya ses klonlama amacıyla işlenmez.
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  Biyometrik Veri Sınırı Nedir?
                </h4>
                <p className="text-slate-400 pl-6">
                  KVKK m.6 kapsamında biyometrik veriler özel niteliklidir. Platformumuz, ses dalgalarınızdan biyometrik kimlik veya ses parmak izi (voiceprint) çıkarımı yapmaz. Ses yalnızca &quot;Speech-to-Text&quot; aracılığıyla metin karakterlerine dönüştürülür.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Kullanıcıya Tam Denetim Güvencesi
                </h4>
                <p className="text-slate-400 pl-6">
                  Kaydı tamamladığınızda ses otomatik gönderilmez. Dinleyebilir, silebilir, yeniden kaydedebilir veya dilediğiniz zaman tek tıkla &quot;Yazarak Yanıtla&quot; sekmesine geçebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  1. Araştırma Niteliği & Ön-Ticari Kapsam
                </h4>
                <p className="text-slate-400 pl-6">
                  Bu çalışma gıdaya uygun 3B parça üretimi hipotezlerini doğrulamak için tasarlanmıştır. Görüşmedeki sorular veya AI asistan yanıtları bağlayıcı ticari teklif veya nihai mühendislik garantisi teşkil etmez.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  2. Ticari Sırlar & Fikri Mülkiyet
                </h4>
                <p className="text-slate-400 pl-6">
                  Katılımcının fabrikasındaki tescilli hat tasarımları korunur. Raporlamalar yalnızca agregasyon yapılarak toplu içgörü şeklinde sunulur; fabrika isimleri gizlenir.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  3. Bot & Spam Koruması (Anti-Garbage)
                </h4>
                <p className="text-slate-400 pl-6">
                  Sistem bot aktivitelerini, ses kalitesizliğini (sessizlik, parazit, honeypot) otomatik engeller. Katılımcı gerçek tecrübelerini aktarmayı taahhüt eder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Alt Buton */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            VoiceVerification AI &copy; 2026 • Tüm Hakları Saklıdır
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            Okudum, Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
