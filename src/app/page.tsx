"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  KeyRound,
  Layers,
  Bot,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getAllSurveys } from "@/surveys";

export default function LandingPage() {
  const [accessCode, setAccessCode] = useState("");
  const surveys = getAllSurveys();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    const cleanCode = accessCode.trim().toUpperCase();
    // Kod doğrulaması ile yönlendirme
    if (cleanCode === "PIR-2026" || cleanCode === "FOOD-SAFE") {
      window.location.href = `/s/print-it-right?code=${encodeURIComponent(cleanCode)}`;
    } else {
      window.location.href = `/s/print-it-right?code=${encodeURIComponent(cleanCode)}`;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient Arka Plan Efektleri */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-none">
              VoiceVerify <span className="text-indigo-400 font-mono text-xs">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Asenkron Sesli Doğrulama</span>
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

      {/* 2. Hero Section & Davet Kodu Erişim Kutusu */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sektörel Pazar Araştırması & Asenkron Doğrulama Platformu</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Sektör Profesyonellerine Danışmanın{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            En Hızlı ve Akıllı
          </span>{" "}
          Yolu
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Takvim uyuşmazlığı ve yanıtsız anketler geride kaldı. Profesyoneller kendi tempolarında, 3 dakikada sesli yanıt verir; yapay zeka analiz motorumuz sektörel hipotezleri doğrular.
        </p>

        {/* Hızlı Erişim / Davet Kodu Doğrulama Kartı */}
        <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-12">
          <form onSubmit={handleCodeSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 px-1">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bir Davet Kodu veya Erişim Anahtarınız mı Var?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Örn: PIR-2026"
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <span>Görüşmeye Gir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Test Kodu: <strong className="text-indigo-400 font-mono">PIR-2026</strong></span>
              <Link
                href="/s/print-it-right?n=e"
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Geliştirici Hızlı Testi
              </Link>
            </div>
          </form>
        </div>

        {/* 3. Aktif Araştırmalar Vitrini (Active Surveys) */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Aktif Doğrulama Araştırmaları ({surveys.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Davetiye veya kod ile erişilebilir</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium">
                      {survey.tagline}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{survey.estimatedMinutes} Dk
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {survey.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {survey.description}
                  </p>

                  <div className="text-[11px] text-slate-400 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-slate-300">Hedef Kitle: </strong>
                    {survey.targetAudience}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Erişim: Özel Davet</span>
                  <Link
                    href={`/s/${survey.id}?code=PIR-2026`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-medium transition-all"
                  >
                    <span>Katıl</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Yetenekler & Özellikler */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-slate-900 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Ses Öncelikli & Hibrit</h4>
            <p className="text-slate-400 leading-relaxed">
              Konuşarak yanıt vermek düşünceleri en zengin haliyle aktarır. İstendiğinde tek tıkla yazılı yanıta geçiş yapılabilir.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Bağlam Bilen AI Asistan</h4>
            <p className="text-slate-400 leading-relaxed">
              Katılımcı soruyu anlamadığında yapay zeka asistanı projenin teknik bağlamını kullanarak somut örneklerle açıklar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Süreli & Güvenli Erişim</h4>
            <p className="text-slate-400 leading-relaxed">
              Bağlantılar süreli token veya kampanya kodlarıyla korunur. Rastgele erişimler engellenerek veri kalitesi güvenceye alınır.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>KVKK & GDPR Uyumlu • Biyometrik Kimlik Kaydı Tutulmaz</span>
        </div>
        <div>
          <span>VoiceVerify AI • Asenkron Doğrulama Altyapısı</span>
        </div>
      </footer>
    </main>
  );
}
