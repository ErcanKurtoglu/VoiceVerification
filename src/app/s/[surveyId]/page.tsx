import { getSurveyById, getAllSurveys } from "@/surveys";
import { InterviewWizard } from "@/features/interview/components/InterviewWizard";
import Link from "next/link";
import { ShieldCheck, Sparkles, BarChart3 } from "lucide-react";
import { Suspense } from "react";

export function generateStaticParams() {
  const surveys = getAllSurveys();
  return surveys.map((s) => ({
    surveyId: s.id,
  }));
}

interface SurveyPageProps {
  params: Promise<{ surveyId: string }>;
}

export default async function SurveyInstancePage({ params }: SurveyPageProps) {
  const { surveyId } = await params;
  const survey = getSurveyById(surveyId);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Arka Plan Ambient Glow Efektleri */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Üst Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            VoiceVerify <span className="text-indigo-400 font-mono text-xs">AI</span>
          </span>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-all"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Analiz Paneli</span>
        </Link>
      </header>

      {/* Ana Akış Sihirbazı */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <Suspense fallback={<div className="text-slate-400 text-xs">Yükleniyor...</div>}>
          <InterviewWizard project={survey} />
        </Suspense>
      </div>

      {/* Alt Footer & Güven Rozetleri */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>KVKK & GDPR Uyumlu Ses Deşifresi • Biyometrik Kimlik Kaydı Tutulmaz</span>
        </div>
        <div>
          <span>Uçtan Uca Asenkron AI Doğrulama Platformu</span>
        </div>
      </footer>
    </main>
  );
}
