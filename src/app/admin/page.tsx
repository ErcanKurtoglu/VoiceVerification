"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Star,
  Sparkles,
  RefreshCw,
  Clock,
  Building,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InterviewSession } from "@/types/interview";
import { DEFAULT_PROJECT } from "@/lib/config";

export default function AdminPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Veri yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalSessions = sessions.length;
  const avgRating =
    totalSessions > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.feedback?.rating || 5), 0) /
          totalSessions
        ).toFixed(1)
      : "5.0";

  const totalValid = sessions.filter((s) => !Object.values(s.responses).some((r) => r.isJunk)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Üst Navigasyon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Doğrulama & Görüşme Raporu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                  Yönetici Paneli
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {DEFAULT_PROJECT.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Yenile</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md"
            >
              + Yeni Yanıt Ekle
            </Link>
          </div>
        </div>

        {/* Metrik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Toplam Katılımcı</span>
              <h3 className="text-2xl font-bold text-white mt-0.5">{totalSessions}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Ortalama Deneyim Puanı</span>
              <h3 className="text-2xl font-bold text-white mt-0.5">{avgRating} / 5.0</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Doğrulanmış Kaliteli Veri</span>
              <h3 className="text-2xl font-bold text-white mt-0.5">{totalValid} / {totalSessions}</h3>
            </div>
          </div>
        </div>

        {/* Katılımcı Listesi */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Görüşme Kayıtları & AI Deşifreleri ({sessions.length})
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Henüz tamamlanmış bir görüşme bulunmuyor. Ana sayfaya giderek ilk test görüşmenizi yapabilirsiniz.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => {
                const isExpanded = expandedSessionId === s.id;
                const hasJunk = Object.values(s.responses).some((r) => r.isJunk);

                return (
                  <div
                    key={s.id}
                    className="rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden transition-all"
                  >
                    {/* Özet Başlık Satırı */}
                    <div
                      onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {s.participant.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {s.participant.fullName}
                            </h4>
                            {hasJunk && (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Şüpheli Veri
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" /> {s.participant.title} • {s.participant.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {s.participant.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(s.completedAt || s.startedAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{s.feedback?.rating || 5}.0</span>
                        </div>
                        <button className="p-1 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Genişletilmiş Detaylar (Sorular & Deşifreler) */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {DEFAULT_PROJECT.questions.map((q, idx) => {
                            const resp = s.responses[q.id];
                            return (
                              <div
                                key={q.id}
                                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex flex-col justify-between"
                              >
                                <div>
                                  <span className="text-[10px] text-indigo-400 font-semibold uppercase">
                                    Soru {idx + 1}
                                  </span>
                                  <h5 className="font-semibold text-slate-200 mt-0.5 mb-2">
                                    {q.title}
                                  </h5>

                                  {resp ? (
                                    <div className="space-y-2 text-slate-300">
                                      {resp.transcript ? (
                                        <p className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 italic leading-relaxed">
                                          &ldquo;{resp.transcript}&rdquo;
                                        </p>
                                      ) : resp.textResponse ? (
                                        <p className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                                          {resp.textResponse}
                                        </p>
                                      ) : (
                                        <span className="text-slate-500 italic">Ses kaydı deşifre bekliyor</span>
                                      )}

                                      {resp.summary && (
                                        <div className="text-[11px] text-indigo-300">
                                          <strong>AI Özeti:</strong> {resp.summary}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 italic">Yanıt verilmedi</span>
                                  )}
                                </div>

                                {resp?.sentiment && (
                                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Duygu:</span>
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                        resp.sentiment === "positive"
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : resp.sentiment === "critical"
                                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                          : "bg-slate-700/40 text-slate-300"
                                      }`}
                                    >
                                      {resp.sentiment.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Katılımcının Sistem Değerlendirmesi */}
                        {s.feedback && (
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="text-slate-400">Beğenilen Özellikler: </span>
                              <span className="text-indigo-300 font-medium">
                                {s.feedback.tags.join(", ") || "Belirtilmedi"}
                              </span>
                            </div>
                            {s.feedback.notes && (
                              <div className="text-slate-300">
                                <span className="text-slate-400">Özel Not: </span>
                                &ldquo;{s.feedback.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
