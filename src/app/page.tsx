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
  MessageSquare,
  FileText,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { ConsentModal } from "@/features/interview/components/ConsentModal";

export default function LandingPage() {
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentTab, setConsentTab] = useState<"kvkk" | "terms" | "biometric">("kvkk");

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

      {/* 2. Hero Bölümü - Saf Tanıtım & Değer Önermesi */}
      <section className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24 text-center z-10 flex flex-col items-center">
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
          Geleneksel anketler sığ kalır, 45 dakikalık toplantılar ise takvim engeline takılır. 
          VoiceVerify AI ile karar vericiler kendilerine özel davet bağlantılarıyla 3 dakikada sesli veya yazılı yanıt verir; yapay zeka deşifre motorumuz hipotezleri doğrular.
        </p>

        {/* 3 Adımlı Akış Görselleştirmesi */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">Özel Davetiye</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Katılımcılar yalnızca kendilerine iletilen süreli özel link veya kampanya erişim kodu ile görüşmeye dahil olabilir.
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
          <span>VoiceVerification AI &copy; 2026 • Kurumsal Asenkron Doğrulama</span>
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
