import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/services/ai";
import { getStorageService } from "@/services/storage/local-storage-provider";
import { InterviewSession } from "@/types/interview";
import { DEFAULT_PROJECT } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session: InterviewSession = body.session;

    if (!session || !session.participant) {
      return NextResponse.json({ error: "Geçersiz oturum verisi" }, { status: 400 });
    }

    const ai = getAIService();
    const storage = getStorageService();

    // Yanıtları AI ile zenginleştirme (Transkripsiyon & Analiz)
    const questionsMap = new Map(DEFAULT_PROJECT.questions.map((q) => [q.id, q]));

    for (const [qId, resp] of Object.entries(session.responses)) {
      const q = questionsMap.get(qId);
      const qTitle = q ? q.title : "Genel Soru";

      try {
        const analysis = await ai.analyzeAudioOrTextResponse({
          questionTitle: qTitle,
          userTextResponse: resp.textResponse,
        });

        resp.transcript = analysis.transcript;
        resp.sentiment = analysis.sentiment;
        resp.summary = analysis.summary;
        resp.isJunk = analysis.isJunk;
      } catch (err) {
        console.error(`AI analiz hatası (Soru: ${qId}):`, err);
      }
    }

    // Depolama katmanına kaydetme
    await storage.saveSession(session);

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "İşlem sırasında sunucu hatası oluştu: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const storage = getStorageService();
    const sessions = await storage.getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
