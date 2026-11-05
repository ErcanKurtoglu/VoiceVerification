/**
 * Anti-Garbage Modülü: Ses Kalitesi & Enerji Kontrolü
 * Katılımcının mikrofona konuşup konuşmadığını, kaydın çok kısa veya tamamen sessiz olup olmadığını tespit eder.
 */

export interface AudioQualityResult {
  isValid: boolean;
  reason?: string;
  avgRms: number;
  durationSec: number;
}

export const MIN_AUDIO_DURATION_SEC = 3; // En az 3 saniye olmalı
export const MIN_RMS_THRESHOLD = 0.015; // Sessizlik eşiği (RMS)

/**
 * Web Audio API AnalyserNode üzerinden anlık RMS (Root Mean Square) enerji seviyesini hesaplar.
 */
export function getAudioRMS(analyser: AnalyserNode): number {
  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(dataArray);

  let sumSquares = 0;
  for (let i = 0; i < bufferLength; i++) {
    sumSquares += dataArray[i] * dataArray[i];
  }
  return Math.sqrt(sumSquares / bufferLength);
}

/**
 * Kayıt tamamlandığında süreyi ve ortalama ses enerjisini doğrulayarak çöp kayıtları engeller.
 */
export function validateAudioRecording(
  durationSec: number,
  avgRms: number
): AudioQualityResult {
  if (durationSec < MIN_AUDIO_DURATION_SEC) {
    return {
      isValid: false,
      reason: `Kayıt çok kısa (${Math.round(durationSec)} sn). Lütfen fikrinizi en az ${MIN_AUDIO_DURATION_SEC} saniye mikrofona konuşarak ifade ediniz.`,
      avgRms,
      durationSec,
    };
  }

  // Eğer ortalama ses seviyesi gürültü/sessizlik tabanının altındaysa
  if (avgRms < MIN_RMS_THRESHOLD) {
    return {
      isValid: false,
      reason:
        "Mikrofondan yeterli ses algılanamadı. Lütfen mikrofonunuzun açık olduğundan ve mikrofona yakın konuştuğunuzdan emin olun.",
      avgRms,
      durationSec,
    };
  }

  return {
    isValid: true,
    avgRms,
    durationSec,
  };
}
