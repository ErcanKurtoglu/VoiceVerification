"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  getAudioRMS,
  validateAudioRecording,
  AudioQualityResult,
} from "@/features/anti-garbage/audio-energy";

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  permissionStatus: "idle" | "requesting" | "granted" | "denied";
  errorMessage: string | null;
  currentRms: number;
  analyserNode: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioQualityResult | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder(maxDurationSec: number = 180): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentRms, setCurrentRms] = useState(0);

  // Closure tuzaklarını engellemek için ref'ler
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const durationRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rmsIntervalRef = useRef<number | null>(null);
  const rmsHistoryRef = useRef<number[]>([]);
  const peakRmsRef = useRef<number>(0);

  // Kaynakları temizleme
  const cleanup = useCallback(() => {
    isRecordingRef.current = false;
    isPausedRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (rmsIntervalRef.current) {
      cancelAnimationFrame(rmsIntervalRef.current);
      rmsIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanup, audioUrl]);

  const stopRecording = useCallback(async (): Promise<AudioQualityResult | null> => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return null;
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current!;

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const finalUrl = URL.createObjectURL(finalBlob);

        const history = rmsHistoryRef.current;
        const avgRms =
          history.length > 0
            ? history.reduce((a, b) => a + b, 0) / history.length
            : 0.02; // Varsayılan sağlıklı değer
        const peakRms = peakRmsRef.current || 0.05;

        // Anti-Garbage: Kalite ve Süre Doğrulaması
        const qualityResult = validateAudioRecording(
          durationRef.current,
          peakRms,
          avgRms,
          finalBlob.size
        );

        if (!qualityResult.isValid) {
          setErrorMessage(qualityResult.reason || "Kayıt doğrulanamadı.");
          setAudioBlob(null);
          setAudioUrl(null);
          URL.revokeObjectURL(finalUrl);
        } else {
          setAudioBlob(finalBlob);
          setAudioUrl(finalUrl);
          setErrorMessage(null);
        }

        setIsRecording(false);
        setIsPaused(false);
        isRecordingRef.current = false;
        isPausedRef.current = false;
        cleanup();
        resolve(qualityResult);
      };

      recorder.stop();
    });
  }, [cleanup]);

  // Maksimum süreye ulaşınca otomatik durdurma
  useEffect(() => {
    if (duration >= maxDurationSec && isRecording) {
      stopRecording();
    }
  }, [duration, maxDurationSec, isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    rmsHistoryRef.current = [];
    peakRmsRef.current = 0;
    setDuration(0);
    durationRef.current = 0;

    try {
      setPermissionStatus("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setPermissionStatus("granted");

      // Web Audio API & Analyser kurulumu
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Desteklenen MIME türünü belirleme
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // 100ms dilimler

      // Ref'leri hemen aktif et (Closure bug'ını çözer)
      isRecordingRef.current = true;
      isPausedRef.current = false;
      setIsRecording(true);
      setIsPaused(false);

      // Süre sayacı
      timerIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration((prev) => prev + 1);
      }, 1000);

      // RMS Ses Enerjisi Takibi (Canlı Görselleştirme & Anti-Garbage)
      const monitorRMS = () => {
        if (analyserRef.current && isRecordingRef.current && !isPausedRef.current) {
          const rms = getAudioRMS(analyserRef.current);
          setCurrentRms(rms);
          rmsHistoryRef.current.push(rms);
          if (rms > peakRmsRef.current) {
            peakRmsRef.current = rms;
          }
        }
        if (isRecordingRef.current) {
          rmsIntervalRef.current = requestAnimationFrame(monitorRMS);
        }
      };
      rmsIntervalRef.current = requestAnimationFrame(monitorRMS);
    } catch (err: unknown) {
      setPermissionStatus("denied");
      const error = err as Error;
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setErrorMessage(
          "Mikrofon erişim izni reddedildi. Lütfen tarayıcı adres çubuğundaki kilit simgesinden mikrofon iznini etkinleştirin veya 'Yazarak Yanıtla' seçeneğini kullanın."
        );
      } else {
        setErrorMessage("Mikrofon başlatılamadı: " + error.message);
      }
      cleanup();
    }
  }, [audioUrl, cleanup]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      isPausedRef.current = true;
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      isPausedRef.current = false;
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    durationRef.current = 0;
    setIsRecording(false);
    setIsPaused(false);
    isRecordingRef.current = false;
    isPausedRef.current = false;
    setErrorMessage(null);
    cleanup();
  }, [audioUrl, cleanup, isRecording]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    permissionStatus,
    errorMessage,
    currentRms,
    analyserNode: analyserRef.current,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
