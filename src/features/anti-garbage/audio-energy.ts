/**
 * Anti-Garbage Modülü: Ses Kalitesi & Enerji Kontrolü
 * Katılımcının mikrofona konuşup konuşmadığını, kaydın çok kısa veya tamamen sessiz olup olmadığını tespit eder.
 */

export interface AudioQualityResult {
  isValid: boolean;
  reason?: string;
  peakRms: number;
  avgRms: number;
  durationSec: number;
  fileSizeBytes?: number;
}

export const MIN_AUDIO_DURATION_SEC = 2; // En az 2 saniye olmalı (daha kullanıcı dostu)
export const MIN_PEAK_RMS_THRESHOLD = 0.003; // Konuşma anında en az bir kez erişilmesi gereken minimum mikrofon enerjisi

/**
 * Web Audio API AnalyserNode üzerinden anlık RMS (Root Mean Square) enerji seviyesini hesaplar.
 */
export function getAudioRMS(analyser: AnalyserNode): number {
  try {
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sumSquares / bufferLength);
  } catch {
    return 0.01;
  }
}

/**
 * Kayıt tamamlandığında süreyi ve ses enerjisini doğrulayarak çöp/sessiz kayıtları engeller.
 */
export function validateAudioRecording(
  durationSec: number,
  peakRms: number,
  avgRms: number,
  fileSizeBytes: number = 0
): AudioQualityResult {
  if (durationSec < MIN_AUDIO_DURATION_SEC) {
    return {
      isValid: false,
      reason: `Kayıt çok kısa (${Math.round(durationSec)} sn). Lütfen fikrinizi en az ${MIN_AUDIO_DURATION_SEC} saniye mikrofona konuşarak ifade ediniz.`,
      peakRms,
      avgRms,
      durationSec,
      fileSizeBytes,
    };
  }

  // Eğer dosya boşsa (0 bayt veya sadece header)
  if (fileSizeBytes > 0 && fileSizeBytes < 256) {
    return {
      isValid: false,
      reason: "Ses dosyası kaydedilemedi. Lütfen mikrofonunuzu kontrol ediniz.",
      peakRms,
      avgRms,
      durationSec,
      fileSizeBytes,
    };
  }

  // Eğer ses seviyesi peak olarak bile mutlak sessizlik tabanındaysa (ve mikrofon takılı değilse)
  if (peakRms < MIN_PEAK_RMS_THRESHOLD && fileSizeBytes < 1000) {
    return {
      isValid: false,
      reason:
        "Mikrofondan yeterli ses algılanamadı. Lütfen mikrofonunuzun açık olduğundan ve mikrofona yakın konuştuğunuzdan emin olun.",
      peakRms,
      avgRms,
      durationSec,
      fileSizeBytes,
    };
  }

  return {
    isValid: true,
    peakRms,
    avgRms,
    durationSec,
    fileSizeBytes,
  };
}
