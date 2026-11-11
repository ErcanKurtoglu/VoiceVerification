import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIService } from "@/services/ai";

const ClarifyQuestionSchema = z.object({
  surveyTitle: z.string().optional(),
  questionTitle: z.string().min(2, "Soru başlığı en az 2 karakter olmalıdır."),
  currentDescription: z.string().optional(),
  lang: z.enum(["tr", "en"]).optional().default("tr"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ClarifyQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Geçersiz parametreler",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { surveyTitle, questionTitle, currentDescription, lang } = validation.data;
    const aiService = getAIService();
    const result = await aiService.clarifyQuestionSpec({
      surveyTitle,
      questionTitle,
      currentDescription,
      lang,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "AI soru kapsamı üretilirken bir hata oluştu: " + err.message },
      { status: 500 }
    );
  }
}
