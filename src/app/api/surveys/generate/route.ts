import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIService } from "@/services/ai";

const GenerateSurveySchema = z.object({
  prompt: z
    .string()
    .min(20, "Prompt çok kısa. Lütfen geçerli bir araştırma veya guardrail metni giriniz."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = GenerateSurveySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Geçersiz istek parametreleri",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { prompt } = validation.data;
    const aiService = getAIService();
    const survey = await aiService.generateSurveyFromPrompt(prompt);

    return NextResponse.json({
      success: true,
      survey,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Anket üretilirken bir hata oluştu: " + err.message },
      { status: 500 }
    );
  }
}
