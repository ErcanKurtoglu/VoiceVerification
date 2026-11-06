import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/services/ai";
import { getStorageService } from "@/services/storage/local-storage-provider";
import { InterviewSession } from "@/types/interview";
import { getSurveyByIdAsync, PRINT_IT_RIGHT_SURVEY } from "@/surveys";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session: InterviewSession = body.session;

    if (!session || !session.participant) {
      return NextResponse.json({ error: "Geçersiz oturum verisi" }, { status: 400 });
    }

    const ai = getAIService();
    const storage = getStorageService();

    // Dinamik Survey Yapısı: İlgili anketin sorularını yükleme
    const survey = await getSurveyByIdAsync(session.projectId);
    const questionsMap = new Map(survey.questions.map((q) => [q.id, q]));

    for (const [qId, resp] of Object.entries(session.responses)) {
      const q = questionsMap.get(qId) || PRINT_IT_RIGHT_SURVEY.questions.find((x) => x.id === qId);
      const qTitle = q ? q.title : "Genel Soru";

      try {
        let base64 = resp.audioBase64;
        let mimeType = "audio/webm";

        // Eğer doğrudan istemci belleğinden base64 gelmemişse ve geçmiş oturum gibi audioUrl varsa oradan al
        if (!base64 && resp.audioUrl) {
          try {
            const audioRes = await fetch(resp.audioUrl);
            if (audioRes.ok) {
              const arrayBuffer = await audioRes.arrayBuffer();
              base64 = Buffer.from(arrayBuffer).toString("base64");
              const ct = audioRes.headers.get("content-type");
              if (ct) mimeType = ct;
            }
          } catch (audioErr) {
            console.error(`Ses indirme hatası (Soru: ${qId}):`, audioErr);
          }
        }

        if (base64) {
          const result = await ai.transcribeAudioOrText({
            questionTitle: qTitle,
            audioBase64: base64,
            mimeType,
          });

          resp.transcript = result.transcript;
          resp.isJunk = result.isJunk;
        } else if (resp.textResponse) {
          resp.transcript = resp.textResponse.trim();
          resp.isJunk = false;
        }

        // Bulut veritabanını şişirmemek için geçici base64'ü sil; yalnızca hafif ve saf deşifre metnini sakla
        delete resp.audioBase64;
      } catch (err) {
        console.error(`Transkripsiyon hatası (Soru: ${qId}):`, err);
      }
    }

    // Depolama katmanına kaydetme (Oturum + Tracking bilgisiyle)
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
