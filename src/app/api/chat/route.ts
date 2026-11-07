import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIService } from "@/services/ai";

const ChatRequestSchema = z.object({
  questionTitle: z.string().min(1),
  questionDescription: z.string().min(1),
  questionHint: z.string().optional(),
  userQuery: z.string().min(1).max(500, "Mesajınız 500 karakteri geçemez."),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  projectContext: z.string(),
  lang: z.enum(["tr", "en"]).optional().default("tr"),
  participantRole: z.string().optional(),
  participantCompany: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz istek parametreleri", details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      questionTitle,
      questionDescription,
      questionHint,
      userQuery,
      conversationHistory,
      projectContext,
      lang,
      participantRole,
      participantCompany,
    } = validation.data;

    // DoS & Abuse Koruması: Bir soru için maksimum 6-10 tur konuşma izni
    if (conversationHistory.length >= 10) {
      const quotaMsg =
        lang === "en"
          ? "You have reached the question clarification limit for this step. Please proceed by recording your response or typing in the text box."
          : "Bu soru için soru sorma sınırına ulaştınız. Lütfen soruyu yanıtlamak için mikrofona konuşun veya metin kutusunu kullanın.";
      return NextResponse.json({ reply: quotaMsg }, { status: 200 });
    }

    const ai = getAIService();
    const reply = await ai.chatClarification({
      questionTitle,
      questionDescription,
      questionHint,
      userQuery,
      conversationHistory,
      projectContext,
      lang,
      participantRole,
      participantCompany,
    });

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "AI yanıt oluştururken bir hata oluştu: " + err.message },
      { status: 500 }
    );
  }
}
