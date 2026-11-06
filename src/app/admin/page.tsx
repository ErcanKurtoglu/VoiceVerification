"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Layers,
  HelpCircle,
  Trash2,
  KeyRound,
  Mic,
  FileText,
  LogOut,
} from "lucide-react";
import { InterviewSession, SurveyConfig, Question } from "@/types/interview";
import { getAllSurveys, PRINT_IT_RIGHT_SURVEY } from "@/surveys";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [surveysList, setSurveysList] = useState<SurveyConfig[]>(getAllSurveys());
  const [rawSurveysData, setRawSurveysData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Tab: "results" | "surveys"
  const [activeTab, setActiveTab] = useState<"results" | "surveys">("results");

  // Gizli URL Parametresi Koruması (?p=123ercan123)
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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

  // Yeni Anket Oluşturma State
  const [isNewSurveyModalOpen, setIsNewSurveyModalOpen] = useState(false);
  const [newSurveyTitle, setNewSurveyTitle] = useState("");
  const [newSurveyTagline, setNewSurveyTagline] = useState("");
  const [newSurveyDesc, setNewSurveyDesc] = useState("");
  const [newSurveyPin, setNewSurveyPin] = useState("");
  const [newSurveyAudience, setNewSurveyAudience] = useState("");
  const [newSurveyAiContext, setNewSurveyAiContext] = useState("");
  const [newSurveyQuestions, setNewSurveyQuestions] = useState<Array<{ title: string; description: string; clarificationHint: string }>>([
    { title: "İlk Soru Başlığı", description: "Bu soruda katılımcıdan öğrenmek istediğiniz ana problem.", clarificationHint: "AI asistan ipucu." },
    { title: "İkinci Soru Başlığı", description: "Bu problemin maliyeti veya sıklığı.", clarificationHint: "AI asistan ipucu." },
    { title: "Üçüncü Soru Başlığı", description: "Çözüm teklifiniz veya pilot teste bakış açıları.", clarificationHint: "AI asistan ipucu." },
  ]);
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);
  const [surveySaveError, setSurveySaveError] = useState("");
  const [surveySaveSuccess, setSurveySaveSuccess] = useState("");

  // PIN Değiştirme Modal State
  const [editingPinSurvey, setEditingPinSurvey] = useState<{ id: string; title: string; currentPin: string } | null>(null);
  const [newPinValue, setNewPinValue] = useState("");
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinUpdateError, setPinUpdateError] = useState("");
  const [pinUpdateSuccess, setPinUpdateSuccess] = useState("");

  // Anket Silme Modal State
  const [deletingSurvey, setDeletingSurvey] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingSurvey, setIsDeletingSurvey] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "123ercan123";
    const pParam = searchParams.get("p");
    const storedSecret = sessionStorage.getItem("vv_admin_secret");

    if (pParam === ADMIN_SECRET) {
      sessionStorage.setItem("vv_admin_secret", ADMIN_SECRET);
      setIsAuthorized(true);
    } else if (storedSecret === ADMIN_SECRET) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
    setIsAuthChecking(false);
  }, [searchParams]);

  const handleLogout = () => {
    sessionStorage.removeItem("vv_admin_secret");
    setIsAuthorized(false);
    window.location.href = "/";
  };

  const fetchSurveys = async () => {
    try {
      const res = await fetch("/api/surveys");
      const data = await res.json();
      if (data.surveys && data.surveys.length > 0) {
        setSurveysList(data.surveys);
        setRawSurveysData(data.raw || []);
      }
    } catch (err) {
      console.error("Anketler yüklenemedi:", err);
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
      fetchSurveys();
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

  // Yeni Anket Kaydetme
  const handleSaveNewSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySaveError("");
    setSurveySaveSuccess("");

    if (!newSurveyTitle.trim() || !newSurveyDesc.trim() || !newSurveyPin.trim()) {
      setSurveySaveError("Lütfen anket başlığı, açıklama ve PIN kodunu giriniz.");
      return;
    }

    const formattedQuestions: Question[] = newSurveyQuestions.map((q, idx) => ({
      id: `q${idx + 1}_${Date.now()}`,
      order: idx + 1,
      title: q.title.trim() || `Soru ${idx + 1}`,
      description: q.description.trim() || "Açıklama",
      clarificationHint: q.clarificationHint.trim() || "Teknik detay.",
      maxDurationSec: 120,
    }));

    setIsSavingSurvey(true);

    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSurveyTitle.trim(),
          tagline: newSurveyTagline.trim() || "Doğrulama",
          description: newSurveyDesc.trim(),
          targetAudience: newSurveyAudience.trim(),
          accessPin: newSurveyPin.trim().toUpperCase(),
          aiContext: newSurveyAiContext.trim() || newSurveyDesc.trim(),
          questions: formattedQuestions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Anket kaydedilemedi.");
      }

      setSurveySaveSuccess(`"${newSurveyTitle}" anketi (${data.accessPin} PIN kodu ile) başarıyla oluşturuldu ve canlıya alındı!`);
      await fetchSurveys();

      // Formu sıfırla
      setTimeout(() => {
        setIsNewSurveyModalOpen(false);
        setSurveySaveSuccess("");
      }, 1800);
    } catch (err: unknown) {
      const error = err as Error;
      setSurveySaveError(error.message);
    } finally {
      setIsSavingSurvey(false);
    }
  };

  // PIN Güncelleme
  const handleOpenPinModal = (surveyId: string, title: string, currentPin: string) => {
    setEditingPinSurvey({ id: surveyId, title, currentPin });
    setNewPinValue(currentPin);
    setPinUpdateError("");
    setPinUpdateSuccess("");
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPinSurvey) return;

    const cleanPin = newPinValue.trim().toUpperCase();
    if (!cleanPin) {
      setPinUpdateError("Lütfen geçerli bir PIN kodu giriniz.");
      return;
    }

    setIsUpdatingPin(true);
    setPinUpdateError("");
    setPinUpdateSuccess("");

    try {
      const res = await fetch("/api/surveys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPinSurvey.id,
          accessPin: cleanPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "PIN güncellenemedi.");
      }

      setPinUpdateSuccess(`PIN kodu başarıyla "${cleanPin}" olarak güncellendi!`);
      await fetchSurveys();

      setTimeout(() => {
        setEditingPinSurvey(null);
        setPinUpdateSuccess("");
      }, 1400);
    } catch (err: unknown) {
      const error = err as Error;
      setPinUpdateError(error.message);
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Anket Silme
  const handleDeleteSurvey = async () => {
    if (!deletingSurvey) return;

    setIsDeletingSurvey(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/surveys?id=${encodeURIComponent(deletingSurvey.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Anket silinemedi.");
      }

      await fetchSurveys();
      setDeletingSurvey(null);
    } catch (err: unknown) {
      const error = err as Error;
      setDeleteError(error.message);
    } finally {
      setIsDeletingSurvey(false);
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
  const ratedSessions = sessions.filter(
    (s) => s.feedback?.rating && s.feedback.rating > 0
  );
  const avgRating =
    ratedSessions.length > 0
      ? (
          ratedSessions.reduce((acc, s) => acc + (s.feedback?.rating || 0), 0) /
          ratedSessions.length
        ).toFixed(1)
      : "-";

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
      "Deneyim Puanı",
      "Beğenilen Özellikler (Etiketler)",
      "Geri Bildirim Notu / Önerisi",
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
      const feedbackTags = (s.feedback?.tags || []).join("; ").replace(/"/g, '""');
      const feedbackNotes = (s.feedback?.notes || "").replace(/"/g, '""');

      return [
        `"${s.id}"`,
        `"${s.projectId}"`,
        `"${s.participant.fullName}"`,
        `"${s.participant.email}"`,
        `"${s.participant.company}"`,
        `"${s.participant.title}"`,
        `"${s.tracking?.uid || ""}"`,
        `"${s.feedback?.rating && s.feedback.rating > 0 ? `${s.feedback.rating}.0` : "Seçim Yapılmadı"}"`,
        `"${feedbackTags || "Seçilmedi"}"`,
        `"${feedbackNotes || "İletilmedi"}"`,
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

  // 1. Gizli URL Parametresi Koruması Ekranı (?p=123ercan123)
  if (!isAuthorized) {
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-slate-800 text-slate-400 border border-slate-700">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">404 - Sayfa Bulunamadı</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Aradığınız sayfa mevcut değil veya bu alana erişim yetkiniz bulunmuyor.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
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

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab Değiştirici */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("results")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "results"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Görüşme Kayıtları
              </button>
              <button
                onClick={() => setActiveTab("surveys")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "surveys"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Anket Yönetimi ({surveysList.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isGeneratorOpen ? "Gizle" : "Özel Link Üret"}</span>
            </button>

            {activeTab === "results" && (
              <button
                onClick={exportToCSV}
                disabled={sessions.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV İndir</span>
              </button>
            )}

            <button
              onClick={() => {
                fetchSessions();
                fetchSurveys();
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Yenile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-medium transition-all"
              title="Yönetici Oturumunu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
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
                    {surveysList.map((sv) => (
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

        {/* TAB 1: GÖRÜŞME KAYITLARI & DEŞİFRELER */}
        {activeTab === "results" && (
          <>
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
                  {surveysList.map((sv) => (
                    <option key={sv.id} value={sv.id}>
                      {sv.title}
                    </option>
                  ))}
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
                  Görüşme Kayıtları & Yapay Zeka (AI) Deşifreleri
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
                    const currentSurvey = surveysList.find((sv) => sv.id === s.projectId) || surveysList[0];

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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {s.participant.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-medium text-slate-400">İsim Soyisim:</span>
                                  <h4 className="text-sm font-bold text-white tracking-wide">
                                    {s.participant.fullName}
                                  </h4>
                                </div>

                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                                  {currentSurvey?.title?.split(":")[0] || s.projectId}
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
                            {s.feedback?.rating && s.feedback.rating > 0 ? (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{s.feedback.rating}.0</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700/60">
                                <span>Seçim Yapılmadı</span>
                              </div>
                            )}
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
                            {/* Katılımcı Bilgi Kartı */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">İsim Soyisim</span>
                                <span className="font-semibold text-white">{s.participant.fullName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Firma / Kurum</span>
                                <span className="font-medium text-slate-300">{s.participant.company}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Unvan / Rol</span>
                                <span className="font-medium text-slate-300">{s.participant.title}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">E-posta Adresi</span>
                                <span className="font-medium text-slate-300">{s.participant.email}</span>
                              </div>
                            </div>

                            {/* Katılımcı Deneyim & Geri Bildirim Özeti */}
                            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  <span>Katılımcı Deneyim Geri Bildirimi</span>
                                </h6>
                                <span className="text-xs font-mono">
                                  {s.feedback?.rating && s.feedback.rating > 0 ? (
                                    <span className="text-amber-400 font-bold">{s.feedback.rating}.0 / 5.0</span>
                                  ) : (
                                    <span className="text-slate-500 italic">Puan Seçilmedi</span>
                                  )}
                                </span>
                              </div>

                              {/* Beğenilen Özellikler (Etiketler) */}
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                                  En Çok Beğenilen Özellikler:
                                </span>
                                {s.feedback?.tags && s.feedback.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {s.feedback.tags.map((tag, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-[11px] font-medium"
                                      >
                                        ✓ {tag}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-xs">Herhangi bir etiket seçilmedi.</span>
                                )}
                              </div>

                              {/* Katılımcının Eklediği Not / Öneri */}
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Katılımcının Notu / Önerisi:
                                </span>
                                {s.feedback?.notes && s.feedback.notes.trim().length > 0 ? (
                                  <p className="text-xs text-slate-200 bg-slate-900/80 border border-slate-800 p-3 rounded-xl italic leading-relaxed">
                                    &ldquo;{s.feedback.notes}&rdquo;
                                  </p>
                                ) : (
                                  <span className="text-slate-500 italic text-xs">Özel bir geri bildirim notu iletilmedi.</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Soru & Katılımcı Cevapları (Deşifre Sonuçları)</span>
                              </h5>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Toplam {Object.keys(s.responses).length} Soru
                              </span>
                            </div>

                            <div className="space-y-4">
                              {Object.entries(s.responses).map(([qId, resp], idx) => {
                                const questionMeta =
                                  currentSurvey?.questions?.find((q) => q.id === qId) ||
                                  PRINT_IT_RIGHT_SURVEY.questions.find((q) => q.id === qId);

                                const questionTitle = questionMeta?.title || `Soru #${idx + 1}`;
                                const questionDesc = questionMeta?.description;
                                const isAudio = resp.mode === "audio" || Boolean(resp.audioUrl);
                                const transcriptText = resp.transcript || resp.textResponse || "";

                                return (
                                  <div
                                    key={qId}
                                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3"
                                  >
                                    {/* Soru Başlık Satırı */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-slate-900">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                                            SORU #{idx + 1}
                                          </span>
                                          <h6 className="text-xs md:text-sm font-semibold text-white">
                                            {questionTitle}
                                          </h6>
                                        </div>
                                        {questionDesc && (
                                          <p className="text-[11px] text-slate-400 leading-relaxed">
                                            {questionDesc}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {isAudio ? (
                                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1.5 font-mono">
                                            <Mic className="w-3.5 h-3.5" />
                                            <span>Sesli Yanıt {resp.durationSec ? `(${Math.round(resp.durationSec)} sn)` : ""}</span>
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium flex items-center gap-1.5 font-mono">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Yazılı Yanıt</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* DEŞİFRE / CEVAP KISMI (Sesler sadece veritabanında arşivlenir, panelde doğrudan temiz deşifre sunulur) */}
                                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                                          <span>💬 Katılımcının Yanıtı {isAudio ? "(Deşifre Sonucu)" : "(Yazılı Cevap)"}:</span>
                                        </span>
                                        {isAudio && (
                                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
                                            Yapay Zeka (AI) Transkripti
                                          </span>
                                        )}
                                      </div>

                                      {transcriptText ? (
                                        <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-indigo-500">
                                          &ldquo;{transcriptText}&rdquo;
                                        </p>
                                      ) : (
                                        <p className="text-xs text-slate-500 italic pl-3 border-l-2 border-slate-700">
                                          {resp.audioUrl
                                            ? "Ses kaydı mevcut, deşifre işleniyor..."
                                            : "Katılımcı boş yanıt iletti."}
                                        </p>
                                      )}
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
          </>
        )}

        {/* TAB 2: ANKET YÖNETİMİ & SURVEY OLUŞTURMA */}
        {activeTab === "surveys" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Aktif Anket Örnekleri ({surveysList.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Her anket bağımsız bir erişim PIN koduna, soru setine ve AI asistan bağlamına sahiptir.
                </p>
              </div>

              <button
                onClick={() => setIsNewSurveyModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Anket Ekle</span>
              </button>
            </div>

            {/* Anket Kartları Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveysList.map((sv) => {
                const rawMatch = rawSurveysData.find((r) => r.id === sv.id);
                const pin = rawMatch?.access_pin || (sv.id === "print-it-right" ? "PIR-2026" : "KOD-YOK");

                return (
                  <div
                    key={sv.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-mono">
                          {sv.tagline}
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-white">
                          <KeyRound className="w-3 h-3 text-indigo-400" />
                          <span>PIN: <strong>{pin}</strong></span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1.5">{sv.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                        {sv.description}
                      </p>

                      <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <strong className="text-slate-300">Hedef Kitle: </strong>
                          {sv.targetAudience || "Sektör Profesyonelleri"}
                        </div>
                        <div>
                          <strong className="text-slate-300">Soru Sayısı: </strong>
                          {sv.questions.length} Soru (~{sv.estimatedMinutes} Dakika)
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPinModal(sv.id, sv.title, pin)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-all flex items-center gap-1 border border-slate-700 active:scale-95"
                          title="Giriş PIN Kodunu Güncelle"
                        >
                          <KeyRound className="w-3 h-3 text-indigo-400" />
                          <span>PIN Değiştir</span>
                        </button>

                        <button
                          onClick={() => {
                            setInviteSurveyId(sv.id);
                            setIsGeneratorOpen(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          title="Özel Davet Linki Üret"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Link Üret</span>
                        </button>

                        <button
                          onClick={() => {
                            setDeletingSurvey({ id: sv.id, title: sv.title });
                            setDeleteError("");
                          }}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[11px] transition-all border border-red-500/20 active:scale-95"
                          title="Anketi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* YENİ ANKET EKLEME MODALI */}
        {isNewSurveyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-2xl p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Yeni Anket Oluştur</h3>
                    <p className="text-xs text-slate-400">
                      Anket bilgileri ve soru setini tanımlayın; otomatik olarak canlıya alınsın.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNewSurveyModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {surveySaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{surveySaveSuccess}</span>
                </div>
              )}

              {surveySaveError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{surveySaveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveNewSurvey} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Anket Başlığı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSurveyTitle}
                      onChange={(e) => setNewSurveyTitle(e.target.value)}
                      placeholder="Örn: Soğuk Zincir IoT İzleme"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Giriş PIN Kodu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSurveyPin}
                      onChange={(e) => setNewSurveyPin(e.target.value.toUpperCase())}
                      placeholder="Örn: COLD-2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Kısa Etiket (Tagline)
                    </label>
                    <input
                      type="text"
                      value={newSurveyTagline}
                      onChange={(e) => setNewSurveyTagline(e.target.value)}
                      placeholder="Örn: IoT & Donanım Doğrulaması"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hedef Kitle
                    </label>
                    <input
                      type="text"
                      value={newSurveyAudience}
                      onChange={(e) => setNewSurveyAudience(e.target.value)}
                      placeholder="Örn: Lojistik Müdürleri, Kalite Şefleri"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Anket Açıklaması <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newSurveyDesc}
                    onChange={(e) => setNewSurveyDesc(e.target.value)}
                    placeholder="Anketin amacı ve katılımcıya katacağı değer..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Yapay Zeka Asistan Bağlamı (AI Context)
                  </label>
                  <textarea
                    rows={2}
                    value={newSurveyAiContext}
                    onChange={(e) => setNewSurveyAiContext(e.target.value)}
                    placeholder="Yapay zeka (AI) asistanının sorularda katılımcıya yardımcı olabilmesi için sektör teknik terimleri ve arka plan bilgisi..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Dinamik Soru Listesi */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      Anket Soruları ({newSurveyQuestions.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewSurveyQuestions([
                          ...newSurveyQuestions,
                          {
                            title: `Soru ${newSurveyQuestions.length + 1}`,
                            description: "Soru detayı...",
                            clarificationHint: "İpucu...",
                          },
                        ])
                      }
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Soru Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {newSurveyQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-400">
                            Soru #{idx + 1}
                          </span>
                          {newSurveyQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setNewSurveyQuestions(newSurveyQuestions.filter((_, i) => i !== idx))
                              }
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => {
                            const updated = [...newSurveyQuestions];
                            updated[idx].title = e.target.value;
                            setNewSurveyQuestions(updated);
                          }}
                          placeholder="Soru Başlığı"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />

                        <textarea
                          rows={2}
                          value={q.description}
                          onChange={(e) => {
                            const updated = [...newSurveyQuestions];
                            updated[idx].description = e.target.value;
                            setNewSurveyQuestions(updated);
                          }}
                          placeholder="Soru Açıklaması ve Kapsamı"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewSurveyModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingSurvey}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSavingSurvey ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Anketi Canlıya Al</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PIN GÜNCELLEME MODALI */}
        {editingPinSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Anket PIN Kodunu Güncelle</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                      {editingPinSurvey.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingPinSurvey(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {pinUpdateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pinUpdateSuccess}</span>
                </div>
              )}

              {pinUpdateError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinUpdateError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Mevcut PIN Kodu
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400">
                    {editingPinSurvey.currentPin}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Yeni PIN Kodu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value.toUpperCase())}
                    placeholder="Örn: PIR-2026-EXPO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Büyük harf ve rakamlar önerilir. PIN güncellendiğinde landing page üzerinden anında geçerli olur.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingPinSurvey(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdatingPin}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingPin ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Güncelleniyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PIN&apos;i Güncelle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ANKET SİLME ONAY MODALI */}
        {deletingSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Anketi Sil</h3>
                <p className="text-xs text-slate-400">
                  <strong className="text-white">&quot;{deletingSurvey.title}&quot;</strong> anketini yayından kaldırmak istediğinizden emin misiniz?
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 text-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                * Bu işlem anketi yayından kaldırır ve yeni katılımcı girişlerini engeller.
              </p>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingSurvey(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  İptal
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSurvey}
                  disabled={isDeletingSurvey}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDeletingSurvey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Siliniyor...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Evet, Sil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
