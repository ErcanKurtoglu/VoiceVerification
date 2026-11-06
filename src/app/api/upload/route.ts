import { NextRequest, NextResponse } from "next/server";
import { getAudioStorage } from "@/services/storage/audio-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const surveyId = (formData.get("surveyId") as string) || "general";
    const sessionId = (formData.get("sessionId") as string) || "anonymous";
    const questionId = (formData.get("questionId") as string) || "q1";
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Ses dosyası bulunamadı." }, { status: 400 });
    }

    // Güvenlik & Dosya Boyut Denetimi (Maks 10 MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 10 MB sınırını aşıyor." },
        { status: 413 }
      );
    }

    const mimeType = audioFile.type || "audio/webm";
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getAudioStorage();
    const uploadResult = await storage.uploadAudio({
      surveyId,
      sessionId,
      questionId,
      buffer,
      mimeType,
    });

    return NextResponse.json({
      success: true,
      audioUrl: uploadResult.publicUrl,
      storagePath: uploadResult.storagePath,
      provider: uploadResult.provider,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Ses yedekleme sırasında hata oluştu: " + err.message },
      { status: 500 }
    );
  }
}
