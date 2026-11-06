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
  Tag,
  Link2,
  Lock,
  Download,
  Search,
  CheckCircle2,
  Copy,
  Plus,
  Send,
  Loader2,
  Calendar,
} from "lucide-react";
import { InterviewSession } from "@/types/interview";
import { getSurveyById, getAllSurveys } from "@/surveys";

export default function AdminPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Güvenlik & PIN Koruması
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Filtreleme & Arama
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSurvey, setFilterSurvey] = useState("all");

  // Süreli Davetiye Linki Üretici State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [inviteSurveyId, setInviteSurveyId] = useState("print-it-right");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompany, setInviteCompany] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDays, setInviteDays] = useState("7");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatorError, setGeneratorError] = useState("");

  const surveys = getAllSurveys();

  useEffect(() => {
    const authStatus = sessionStorage.getItem("vv_admin_auth");
    if (authStatus === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "2026") {
      sessionStorage.setItem("vv_admin_auth", "true");
      setIsAuthorized(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

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
    if (isAuthorized) {
      fetchSessions();
    }
  }, [isAuthorized]);

  // Süreli Davetiye Linki Üretme
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratorError("");
    setGeneratedUrl("");
    setCopySuccess(false);

    if (!inviteName.trim() || !inviteEmail.trim() || !inviteCompany.trim() || !inviteTitle.trim()) {
      setGeneratorError("Lütfen katılımcının ad, e-posta, firma ve unvan bilgilerini giriniz.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: inviteSurveyId,
          fullName: inviteName.trim(),
          email: inviteEmail.trim(),
          company: inviteCompany.trim(),
          title: inviteTitle.trim(),
          validDays: Number(inviteDays) || 7,
          mode: "admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Davetiye linki oluşturulamadı.");
      }

      const fullUrl = `${window.location.origin}${data.url}`;
      setGeneratedUrl(fullUrl);
    } catch (err: unknown) {
      const error = err as Error;
      setGeneratorError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Filtreleme
  const filteredSessions = sessions.filter((s) => {
    const matchesSurvey = filterSurvey === "all" || s.projectId === filterSurvey;
    const matchesQuery =
      s.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.participant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tracking?.uid && s.tracking.uid.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSurvey && matchesQuery;
  });

  const totalSessions = sessions.length;
  const avgRating =
    totalSessions > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.feedback?.rating || 5), 0) /
          totalSessions
        ).toFixed(1)
      : "5.0";

  const totalValid = sessions.filter(
    (s) => !Object.values(s.responses).some((r) => r.isJunk)
  ).length;

  // Hafif CSV Dışa Aktarma
  const exportToCSV = () => {
    if (sessions.length === 0) return;

    const headers = [
      "Oturum ID",
      "Anket",
      "Katılımcı",
      "E-posta",
      "Şirket",
      "Unvan",
      "UID",
      "Puan",
      "Tarih",
      "Soru 1 Deşifre",
      "Soru 2 Deşifre",
      "Soru 3 Deşifre",
    ];

    const rows = sessions.map((s) => {
      const responsesList = Object.values(s.responses);
      const q1 = (responsesList[0]?.transcript || responsesList[0]?.textResponse || "").replace(/"/g, '""');
      const q2 = (responsesList[1]?.transcript || responsesList[1]?.textResponse || "").replace(/"/g, '""');
      const q3 = (responsesList[2]?.transcript || responsesList[2]?.textResponse || "").replace(/"/g, '""');

      return [
        `"${s.id}"`,
        `"${s.projectId}"`,
        `"${s.participant.fullName}"`,
        `"${s.participant.email}"`,
        `"${s.participant.company}"`,
        `"${s.participant.title}"`,
        `"${s.tracking?.uid || ""}"`,
        `"${s.feedback?.rating || 5}"`,
        `"${new Date(s.startedAt).toLocaleString("tr-TR")}"`,
        `"${q1}"`,
        `"${q2}"`,
        `"${q3}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voice_verification_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. PIN Koruması Ekranı
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Yönetici Girişi</h2>
            <p className="text-xs text-slate-400 mt-1">
              Araştırma ve transkript sonuçlarını görüntülemek için PIN giriniz.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN Kodu (Varsayılan: 2026)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm text-white tracking-widest focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            {pinError && (
              <span className="text-[11px] text-red-400 block">Hatalı PIN. Tekrar deneyiniz.</span>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              Paneli Aç
            </button>
          </form>

          <Link href="/" className="inline-block text-[11px] text-slate-500 hover:text-slate-400">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // 2. Yetkili Yönetici Paneli
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
                  Supabase Bulut Depolama
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Tüm aktif anketler, katılımcı ses kayıtları ve anlık AI transkriptleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isGeneratorOpen ? "Üreticiyi Gizle" : "Süreli Özel Link Üret"}</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV İndir</span>
            </button>

            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Yenile</span>
            </button>
          </div>
        </div>

        {/* Süreli Özel Davetiye Linki Üretici Kartı (Açılır/Kapanır) */}
        {isGeneratorOpen && (
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Kişiye Özel Süreli Davetiye Bağlantısı Üret
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Katılımcı bu linki açtığında tüm bilgileri tanımlı gelir; sadece gizlilik onayı vererek 3 saniyede başlar.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono">TTL Korumalı</span>
            </div>

            {generatorError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{generatorError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateInvite} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Anket Seçimi
                  </label>
                  <select
                    value={inviteSurveyId}
                    onChange={(e) => setInviteSurveyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {surveys.map((sv) => (
                      <option key={sv.id} value={sv.id}>
                        {sv.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Ad Soyad <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Örn: Burak Kaya"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    E-posta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="burak@sutaskurumsal.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Firma / Kurum <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCompany}
                    onChange={(e) => setInviteCompany(e.target.value)}
                    placeholder="Örn: Sütaş A.Ş."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Unvan / Rol <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    placeholder="Örn: Bakım Mühendisi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Geçerlilik Süresi
                  </label>
                  <select
                    value={inviteDays}
                    onChange={(e) => setInviteDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="3">3 Gün</option>
                    <option value="7">7 Gün (Önerilen)</option>
                    <option value="14">14 Gün</option>
                    <option value="30">30 Gün</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Üretiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Davetiye Linki Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Üretilen Bağlantı Alanı */}
            {generatedUrl && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Özel Davet Linki Hazır ({inviteDays} Gün Geçerli)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Tek tıkla kopyalayabilirsiniz</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-indigo-500/30 text-white font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Linki Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
              <span className="text-xs text-slate-400">Ortalama Deneyim</span>
              <h3 className="text-2xl font-bold text-white mt-0.5">{avgRating} / 5.0</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Doğrulanmış Kayıt</span>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {totalValid} / {totalSessions}
              </h3>
            </div>
          </div>
        </div>

        {/* Arama & Filtre Çubuğu */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Katılımcı, şirket veya UID ara..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterSurvey}
              onChange={(e) => setFilterSurvey(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tüm Anketler</option>
              <option value="print-it-right">Print It Right</option>
            </select>
            <span className="text-xs text-slate-500">
              Gösterilen: <strong>{filteredSessions.length}</strong>
            </span>
          </div>
        </div>

        {/* Katılımcı ve Sonuç Kartları */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Görüşme Kayıtları & Gemini 2.5 Flash Deşifreleri
            </h2>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {sessions.length === 0
                ? "Henüz tamamlanmış bir görüşme bulunmuyor. Üst kısımdan bir davetiye linki üreterek ilk görüşmenizi test edebilirsiniz."
                : "Arama kriterlerinize uygun görüşme bulunamadı."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((s) => {
                const isExpanded = expandedSessionId === s.id;
                const hasJunk = Object.values(s.responses).some((r) => r.isJunk);
                const currentSurvey = getSurveyById(s.projectId);

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
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {s.participant.fullName}
                            </h4>

                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                              {currentSurvey.title.split(":")[0]}
                            </span>

                            {s.tracking?.uid && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" /> {s.tracking.uid}
                              </span>
                            )}
                            {s.tracking?.ref && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center gap-1">
                                <Link2 className="w-2.5 h-2.5" /> {s.tracking.ref}
                              </span>
                            )}

                            {hasJunk && (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Şüpheli Veri
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {s.participant.company} • {s.participant.title}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {s.participant.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(s.startedAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{s.feedback?.rating || 5}.0</span>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-900 text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detay Paneli */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-900 bg-slate-900/30 space-y-4">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Soru Bazlı Ses Kayıtları & Gemini 2.5 Flash Deşifresi
                        </h5>

                        <div className="space-y-3">
                          {Object.entries(s.responses).map(([qId, resp]) => {
                            const questionMeta = currentSurvey.questions.find((q) => q.id === qId);

                            return (
                              <div
                                key={qId}
                                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                    {questionMeta?.title || qId}
                                  </span>
                                  {resp.durationSec && (
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      {Math.round(resp.durationSec)} sn
                                    </span>
                                  )}
                                </div>

                                {/* Ses Oynatıcı */}
                                {resp.audioUrl && (
                                  <div className="pt-1">
                                    <audio
                                      controls
                                      src={resp.audioUrl}
                                      className="w-full h-8 rounded-lg accent-indigo-500"
                                      preload="none"
                                    />
                                  </div>
                                )}

                                {/* Transkript Metni */}
                                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
                                  <span className="text-[10px] text-indigo-400 font-semibold block mb-1">
                                    {resp.audioUrl ? "🎙️ SES DEŞİFRESİ (TRANSCRIPT):" : "✍️ YAZILI YANIT:"}
                                  </span>
                                  <p className="whitespace-pre-wrap">
                                    {resp.transcript || resp.textResponse || "(Kayıt işleniyor...)"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
