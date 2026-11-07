"use client";

import React, { useRef, useState } from "react";
import { Mic, Square, Trash2, Play, Pause, AlertCircle } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { UseAudioRecorderReturn } from "../hooks/useAudioRecorder";
import { useLanguage } from "@/context/LanguageContext";

interface AudioRecorderControlProps {
  recorder: UseAudioRecorderReturn;
  maxDurationSec?: number;
  initialAudioUrl?: string | null;
  initialDuration?: number;
  onResetInitial?: () => void;
  onAudioConfirmed?: (blob: Blob, durationSec: number) => void;
}

export const AudioRecorderControl: React.FC<AudioRecorderControlProps> = ({
  recorder,
  maxDurationSec = 180,
  initialAudioUrl,
  initialDuration,
  onResetInitial,
  onAudioConfirmed,
}) => {
  const { t, lang } = useLanguage();
  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    analyserNode,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
  } = recorder;

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Aktif ses URL'si: recorder'ın kendi sesi veya önceki kayıttan gelen ses
  const activeAudioUrl = audioUrl || initialAudioUrl;
  const activeDuration = duration || initialDuration || 0;

  const handleTogglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleStopAndConfirm = async () => {
    const result = await stopRecording();
    if (result && result.isValid && audioBlob) {
      onAudioConfirmed?.(audioBlob, duration);
    }
  };

  const handleFullReset = () => {
    resetRecording();
    onResetInitial?.();
    setIsPlaying(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 1. Hata & Çöp Uyarısı Mesajı */}
      {errorMessage && (
        <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Kayıt Öncesi Durum (Başlangıç) */}
      {!isRecording && !activeAudioUrl && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={startRecording}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 cursor-pointer"
            aria-label={t.micAriaStart}
          >
            <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20 group-hover:opacity-40" />
            <Mic className="w-8 h-8 text-white relative z-10" />
          </button>
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            {t.micPromptInitial}
          </span>
        </div>
      )}

      {/* 3. Aktif Kayıt Durumu */}
      {isRecording && (
        <div className="w-full flex flex-col items-center gap-3">
          {/* Waveform Canlı Çizici */}
          <WaveformVisualizer analyserNode={analyserNode} isRecording={isRecording} />

          {/* Süre Sayacı & Durdur Butonu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>
                {formatTime(duration)} / {formatTime(maxDurationSec)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStopAndConfirm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-medium shadow-md transition-all duration-150 cursor-pointer"
              aria-label={t.micAriaStop}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.recordStop}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Kayıt Tamamlandı (Önizleme & Onay & Silme) */}
      {!isRecording && activeAudioUrl && (
        <div className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <audio
            ref={audioPlayerRef}
            src={activeAudioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all duration-150 cursor-pointer"
                aria-label={isPlaying ? (lang === "en" ? "Pause" : "Durdur") : t.recordListening}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-200">{t.recordSuccess}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatTime(activeDuration)}
                </span>
              </div>
            </div>

            {/* Sil & Baştan Kaydet */}
            <button
              type="button"
              onClick={handleFullReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
              title={lang === "en" ? "Reset audio recording" : "Kaydı sil ve tekrar dene"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.recordRerecord}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
