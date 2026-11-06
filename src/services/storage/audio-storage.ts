import fs from "fs/promises";
import path from "path";

export interface AudioUploadParams {
  surveyId: string;
  sessionId: string;
  questionId: string;
  buffer: Buffer;
  mimeType: string;
}

export interface AudioUploadResult {
  publicUrl: string;
  storagePath: string;
  provider: "supabase" | "local";
}

export interface AudioStorageProvider {
  uploadAudio(params: AudioUploadParams): Promise<AudioUploadResult>;
}

/**
 * 1. Lokal Dosya Depolama Sağlayıcısı (Geliştirme & Sıfır Konfigürasyon Fallback)
 * Dosyaları /public/uploads/audio/{surveyId}/{sessionId}/{questionId}.webm hiyerarşisinde saklar.
 */
export class LocalAudioStorageProvider implements AudioStorageProvider {
  private baseDir = path.join(process.cwd(), "public", "uploads", "audio");

  async uploadAudio(params: AudioUploadParams): Promise<AudioUploadResult> {
    const ext = params.mimeType.includes("mp4")
      ? "mp4"
      : params.mimeType.includes("ogg")
      ? "ogg"
      : "webm";

    const targetDir = path.join(this.baseDir, params.surveyId, params.sessionId);
    await fs.mkdir(targetDir, { recursive: true });

    const fileName = `${params.questionId}.${ext}`;
    const filePath = path.join(/*turbopackIgnore: true*/ targetDir, fileName);

    await fs.writeFile(filePath, params.buffer);

    const publicUrl = `/uploads/audio/${params.surveyId}/${params.sessionId}/${fileName}`;
    const storagePath = `audio/${params.surveyId}/${params.sessionId}/${fileName}`;

    return {
      publicUrl,
      storagePath,
      provider: "local",
    };
  }
}

/**
 * 2. Supabase Storage Sağlayıcısı (Bulut & Kalıcı Ücretsiz Depolama)
 * Eğer SUPABASE_URL ve SUPABASE_KEY tanımlıysa devreye girer.
 */
export class SupabaseAudioStorageProvider implements AudioStorageProvider {
  private supabaseUrl: string;
  private supabaseKey: string;
  private bucket: string;

  constructor(supabaseUrl: string, supabaseKey: string, bucket = "voice-verification") {
    this.supabaseUrl = supabaseUrl.replace(/\/$/, "");
    this.supabaseKey = supabaseKey;
    this.bucket = bucket;
  }

  async uploadAudio(params: AudioUploadParams): Promise<AudioUploadResult> {
    const ext = params.mimeType.includes("mp4") ? "mp4" : "webm";
    const storagePath = `${params.surveyId}/${params.sessionId}/${params.questionId}.${ext}`;

    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${storagePath}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
        "Content-Type": params.mimeType,
        "x-upsert": "true",
      },
      body: new Uint8Array(params.buffer),
    });

    if (!res.ok) {
      throw new Error(`Supabase Storage yükleme hatası: ${await res.text()}`);
    }

    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${storagePath}`;

    return {
      publicUrl,
      storagePath,
      provider: "supabase",
    };
  }
}

let audioStorageInstance: AudioStorageProvider | null = null;

export function getAudioStorage(): AudioStorageProvider {
  if (audioStorageInstance) {
    return audioStorageInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    audioStorageInstance = new SupabaseAudioStorageProvider(supabaseUrl, supabaseKey);
  } else {
    // Bulut anahtarları yoksa sıfır maliyetli ve güvenli yerel depolama
    audioStorageInstance = new LocalAudioStorageProvider();
  }

  return audioStorageInstance;
}
