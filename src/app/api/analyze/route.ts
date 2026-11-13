import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/services/ai";
import { getStorageService } from "@/services/storage/local-storage-provider";
import { InterviewSession } from "@/types/interview";
import { getSurveyByIdAsync, PRINT_IT_RIGHT_SURVEY } from "@/surveys";

// Vercel Serverless Function maksimum çalışma süresi (60 saniye)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ai = getAIService();
    const storage = getStorageService();

    // 1. TEKİL SORU YENİDEN DEŞİFRE İŞLEMİ (Admin Panelden veya İhtiyaç Anında Tetiklenen)
    if (body.action === "retranscribe") {
      const { sessionId, questionId } = body;
      if (!sessionId || !questionId) {
        return NextResponse.json(
          { error: "sessionId ve questionId parametreleri zorunludur" },
          { status: 400 }
        );
      }

      const session = await storage.getSessionById(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 404 });
      }

      const resp = session.responses[questionId];
      if (!resp || !resp.audioUrl) {
        return NextResponse.json(
          { error: "Bu soruya ait ses kaydı URL'si bulunamadı" },
          { status: 400 }
        );
      }

      const survey = await getSurveyByIdAsync(session.projectId);
      const q =
        survey.questions.find((x) => x.id === questionId) ||
        PRINT_IT_RIGHT_SURVEY.questions.find((x) => x.id === questionId);
      const qTitle = q ? q.title : "Genel Soru";

      const audioRes = await fetch(resp.audioUrl);
      if (!audioRes.ok) {
        return NextResponse.json(
          { error: `Ses dosyası indirilemedi (HTTP ${audioRes.status})` },
          { status: 502 }
        );
      }

      const arrayBuffer = await audioRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const ctHeader = audioRes.headers.get("content-type");
      const cleanMime = (ctHeader || "audio/webm").split(";")[0].trim().toLowerCase();

      const result = await ai.transcribeAudioOrText({
        questionTitle: qTitle,
        audioBase64: base64,
        mimeType: cleanMime,
      });

      resp.transcript = result.transcript;
      resp.isJunk = result.isJunk;

      await storage.saveSession(session);

      return NextResponse.json({
        success: true,
        sessionId,
        questionId,
        transcript: result.transcript,
        isJunk: result.isJunk,
      });
    }

    // 2. TÜM ANKET OTURUMU DEŞİFRE & KAYIT İŞLEMİ
    const session: InterviewSession = body.session;

    if (!session || !session.participant) {
      return NextResponse.json({ error: "Geçersiz oturum verisi" }, { status: 400 });
    }

    // Dinamik Survey Yapısı: İlgili anketin sorularını yükleme
    const survey = await getSurveyByIdAsync(session.projectId);
    const questionsMap = new Map(survey.questions.map((q) => [q.id, q]));

    // Ön Güvenlik Kaydı: Transkripsiyon uzun sürse bile oturum ve audioUrl'ler asla kaybolmasın
    const initialSnapshot: InterviewSession = {
      ...session,
      responses: Object.fromEntries(
        Object.entries(session.responses).map(([k, v]) => {
          const copy = { ...v };
          delete copy.audioBase64;
          return [k, copy];
        })
      ),
    };
    await storage.saveSession(initialSnapshot);

    // Soruları 5'erli gruplar halinde paralel işleme (9 soru = 2 hızlı tur ~5 sn)
    const entries = Object.entries(session.responses);
    const CHUNK_SIZE = 5;

    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      const chunk = entries.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async ([qId, resp]) => {
          const q = questionsMap.get(qId) || PRINT_IT_RIGHT_SURVEY.questions.find((x) => x.id === qId);
          const qTitle = q ? q.title : "Genel Soru";

          try {
            let base64 = resp.audioBase64;
            let mimeType = "audio/webm";

            // İstemci belleğinden base64 gelmemişse ses URL'sinden indir
            if (!base64 && resp.audioUrl) {
              try {
                const audioRes = await fetch(resp.audioUrl);
                if (audioRes.ok) {
                  const arrayBuffer = await audioRes.arrayBuffer();
                  base64 = Buffer.from(arrayBuffer).toString("base64");
                  const ct = audioRes.headers.get("content-type");
                  if (ct) mimeType = ct.split(";")[0].trim().toLowerCase();
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

            // Bulut veritabanını şişirmemek için geçici base64'ü temizle
            delete resp.audioBase64;
          } catch (err) {
            console.error(`Transkripsiyon hatası (Soru: ${qId}):`, err);
          }
        })
      );
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
