"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  ShieldCheck,
  BarChart3,
  Bot,
  Zap,
  Lock,
  Volume2,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building,
  User,
  Mail,
  Briefcase,
} from "lucide-react";
import { ConsentModal } from "@/features/interview/components/ConsentModal";

export default function LandingPage() {
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
      setErrorMsg("Lütfen size iletilen anket erişim kodunu (PIN) giriniz.");
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
        setInfoMsg("Mevcut oturum ve takip bağlantınız geri yüklendi. Yönlendiriliyorsunuz...");
      } else {
        setInfoMsg("Kodunuz doğrulandı. Görüşme başlatılıyor...");
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
            <span className="text-[10px] text-slate-400 font-medium">Asenkron Sesli Doğrulama Altyapısı</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Yönetici Paneli</span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Bölümü & PIN ile Giriş Kartı */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sektörel Pazar Doğrulaması & Asenkron Niteliksel İçgörü</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Sektör Liderlerine Danışmanın{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            En Akıcı ve Güvenilir
          </span>{" "}
          Yolu
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Takvim uyuşmazlığı ve yanıtsız anketler geride kaldı. Profesyoneller kendi tempolarında, 3 dakikada sesli veya yazılı yanıt verir; yapay zeka deşifre motorumuz hipotezleri doğrular.
        </p>

        {/* PIN ve Katılımcı Bilgileriyle Görüşmeye Giriş Kartı */}
        <div className="w-full max-w-xl p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-left mb-12">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Erişim Kodu (PIN) ile Görüşmeye Katılın
              </h3>
              <p className="text-[11px] text-slate-400">
                Size iletilen PIN kodunu ve bilgilerinizi girerek doğrudan ilgili araştırmaya başlayabilirsiniz.
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
                <span>Anket Erişim Kodu (PIN) <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Örn: PIR-2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-white font-mono uppercase tracking-wider text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Örnek Aktif PIN: <strong className="text-indigo-400 font-mono">PIR-2026</strong>
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
            <div className="pt-1">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Oturum Doğrulanıyor & Başlatılıyor...</span>
                </>
              ) : (
                <>
                  <span>Doğrula ve Görüşmeye Başla</span>
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
            <h3 className="text-sm font-semibold text-white">PIN Kodu Girişi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Katılımcılar doğrudan ilgili araştırma için tanımlanmış PIN kodunu girerek süreli oturum oluşturur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">Ses & Metin Eşitliği</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Düşüncelerini konuşarak rahatça aktarır veya yazarak iletir. Takıldığı noktada AI asistanından bağlam desteği alır.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">Deşifre & Doğrulama</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini 2.5 Flash ile anında transkript çıkarılır; spam ve parazitler filtrelenerek raporlanır.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Kurumsal Özellikler & Güvenlik Mimarisi */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-slate-900 z-10">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Neden VoiceVerification AI?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Endüstri standardı güvenlik, veri bütünlüğü ve gizlilik prensipleri üzerine inşa edilmiştir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Anti-Garbage Filtresi</h4>
            <p className="text-slate-400 leading-relaxed">
              Sessiz kayıtlar, mikrofon cızırtıları ve bot aktiviteleri istemci seviyesinde otomatik elenir.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Bağlam Bilen AI Copilot</h4>
            <p className="text-slate-400 leading-relaxed">
              Sorunun neden sorulduğunu katılımcıya kendi sektörünün terimleriyle açıklayan akıllı asistan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Web Audio API Motoru</h4>
            <p className="text-slate-400 leading-relaxed">
              Canlı ses dalga formu, ses seviyesi göstergesi ve kayıt öncesi/sonrası güvenli dinleme desteği.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Sıfır Biyometrik Kayıt</h4>
            <p className="text-slate-400 leading-relaxed">
              Ses verisi akustik parmak izi için kullanılmaz; yalnızca içerik transkripsiyonu sonrası anonimleştirilir.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Alt Footer & Yasal Bilgilendirme */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Biyometrik Kimlik Kaydı Tutulmaz</span>
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
            KVKK & GDPR
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
            Kullanım Şartları
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
            Biyometrik Güvence
          </button>
        </div>
        <div>
          <span>VoiceVerify AI &copy; 2026 • Kurumsal Asenkron Doğrulama</span>
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
