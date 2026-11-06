"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, AlertCircle, ArrowRight, Home, KeyRound } from "lucide-react";

interface AccessDeniedCardProps {
  reason: "missing_access" | "expired" | "invalid_code";
  surveyId: string;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  reason,
  surveyId,
}) => {
  const [accessCode, setAccessCode] = useState("");

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    window.location.href = `/s/${surveyId}?code=${encodeURIComponent(accessCode.trim().toUpperCase())}`;
  };

  const isExpired = reason === "expired";

  return (
    <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center animate-fadeIn">
      <div
        className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner ${
          isExpired
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        }`}
      >
        {isExpired ? <AlertCircle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
        {isExpired
          ? "Bu Davet Bağlantısının Süresi Doldu"
          : "Özel Davetiye Bağlantısı Gereklidir"}
      </h2>

      <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
        {isExpired
          ? "Bu anket için tanımlanan süreli erişim anahtarının geçerlilik süresi tamamlanmıştır. Yeni bir erişim bağlantısı talep edebilir veya erişim kodunuz varsa aşağıdan girebilirsiniz."
          : "Bu sektörel doğrulama anketi katılımcılara özel olarak sınırlandırılmıştır. Doğrudan veya süresi dolmuş bağlantılarla erişilemez. Davet e-postanızdaki bağlantıyı kullanabilir veya elinizdeki kodu girebilirsiniz."}
      </p>

      {/* Erişim Kodu Girme Alanı */}
      <form onSubmit={handleApplyCode} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
        <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span>Erişim veya Kampanya Kodunuz Var mı?</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Örn: PIR-2026"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all flex items-center gap-1 shrink-0"
          >
            <span>Doğrula</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Ana Sayfaya Dönüş */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Ana Sayfaya / Araştırma Portalı&apos;na Dön</span>
        </Link>
      </div>
    </div>
  );
};
