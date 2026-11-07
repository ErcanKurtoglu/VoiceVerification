import { GoogleGenAI } from "@google/genai";
import { AIService, ChatMessage, TranscribeResult, GeneratedSurveyResult } from "./interface";

export class GeminiAIService implements AIService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    questionHint?: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
    lang?: "tr" | "en";
  }): Promise<string> {
    const isEn = params.lang === "en";
    const systemPrompt = `
      You are a neutral assistant that helps a participant understand the survey's topic, terms, and current question.
      The participant is the source of information about their own experience. Your role is to clarify, not to answer the survey for them or steer their response.

      === CRITICAL LANGUAGE REQUIREMENT ===
      The participant has selected the interview language: ${isEn ? "ENGLISH" : "TURKISH"}.
      You MUST write your entire response STRICTLY and completely in ${isEn ? "English" : "Turkish"}.
      Do not switch languages under any circumstance.

      === PROJECT CONTEXT & SYSTEM RULES ===
      ${params.projectContext}

      === CURRENT QUESTION CONTEXT ===
      Question Title: ${params.questionTitle}
      Question Description & Scope: ${params.questionDescription}
      ${params.questionHint ? `Clarification Hint: ${params.questionHint}` : ""}

      === STRICT GUARDRAILS & RESPONSE POLICIES ===
      1. Neutral clarification: Explain terms in plain language using the approved context. Clarify what the question asks and what it leaves out.
      2. Uncertainty: Remind participants that their own real experience, an estimate, or "I don't know" / "bilmiyorum" is completely acceptable.
      3. PROHIBITIONS:
         - NEVER answer the survey question on the participant's behalf or propose what they should say.
         - NEVER ask follow-up questions, probes, or new questions.
         - NEVER lead the participant or validate the research hypothesis.
         - NEVER give engineering, repair, material-selection, food-safety, regulatory, hygiene, or certification advice. If asked for technical advice, state clearly:
           "This survey cannot determine technical suitability or safety. Please consult a qualified professional. I can clarify what the survey question is asking." (in Turkish: "Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği belirleyemez. Lütfen yetkili bir uzmana danışınız. Yalnızca sorunun kapsamını açıklayabilirim.")
         - NEVER request or repeat personal, company, or confidential identifiers.
      4. Style: Calm, clear, respectful, and concise (1-2 short paragraphs).
    `;

    const contents = [
      ...params.conversationHistory.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: params.userQuery }],
      },
    ];

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    return (
      response.text ||
      (isEn
        ? "Could not clarify your question. Please try again."
        : "Sorunuzu yanıtlayamadım, lütfen tekrar deneyiniz.")
    );
  }

  async transcribeAudioOrText(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    // Eğer katılımcı zaten metin olarak yazdıysa doğrudan metni transkript kabul et
    if (params.userTextResponse && !params.audioBase64) {
      return {
        transcript: params.userTextResponse.trim(),
        isJunk: false,
      };
    }

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (params.audioBase64 && params.mimeType) {
      parts.push({
        inlineData: {
          mimeType: params.mimeType,
          data: params.audioBase64,
        },
      });
      parts.push({
        text: `Listen to this audio recording and transcribe the participant's spoken words verbatim without omitting any technical or domain terms, into properly punctuated text in the language spoken (Turkish or English).`,
      });
    }

    const prompt = `
      Lütfen çıktıyı sadece şu saf JSON formatında ver:
      {
        "transcript": "Exact verbatim transcription in the spoken language (Turkish or English)",
        "isJunk": boolean (eğer kayıt sadece anlamsız gürültü, küfür veya fısıltı ise true, anlamlı bir konuşma ise false)
      }
    `;

    parts.push({ text: prompt });

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Yüksek doğruluklu deşifre için düşük sıcaklık
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        transcript: parsed.transcript || "",
        isJunk: Boolean(parsed.isJunk),
      };
    } catch {
      return {
        transcript: response.text || "",
        isJunk: false,
      };
    }
  }

  async generateSurveyFromPrompt(rawPrompt: string): Promise<GeneratedSurveyResult> {
    const systemInstruction = `
      You are an expert research survey architect.
      The user provides a full specification containing System Prompts, Guardrails, and Research Context for a discovery survey.

      Your task:
      Extract and construct a production-ready, BILINGUAL (Turkish and English) survey configuration following these STRICT rules:
      1. Survey Title: Provide both Turkish ("title") and English ("titleEn").
      2. Tagline: Provide short subtitle or banner tagline (2-5 words) in Turkish ("tagline") and English ("taglineEn").
      3. Description: Plain-language summary of the research topic in Turkish ("description") and English ("descriptionEn").
      4. Segment-specific Questions (3 to 5 questions):
         - For each question provide both Turkish and English:
           - "title" & "titleEn"
           - "description" & "descriptionEn"
           - "clarificationHint" & "clarificationHintEn"
         - DO NOT create or include eligibility/intake questions (country, job role, company are entered beforehand by researchers).
         - DO NOT create follow-up questions or sub-probes. If related details are needed, combine them into the main survey question and define the scope in its description.
         - Speaking-time estimate (maxDurationSec): Estimate a maximum participant speaking time for each question based on cognitive demand.
           MUST USE ONLY 30-SECOND INCREMENTS: 30, 60, 90, 120, 150, or 180 seconds.
           Round UP to the next 30-second increment when needed (e.g., if ~45s needed, use 60s; if ~75s needed, use 90s). Never use fractional minutes or non-30-second values.
      5. Output format must be strictly JSON matching the specified bilingual schema.
    `;

    const userPrompt = `
      Analyze the following prompt and generate the structured bilingual survey configuration in JSON:

      """
      ${rawPrompt}
      """

      Return ONLY valid JSON matching this structure:
      {
        "title": "string (Turkish)",
        "titleEn": "string (English)",
        "tagline": "string (Turkish)",
        "taglineEn": "string (English)",
        "description": "string (Turkish)",
        "descriptionEn": "string (English)",
        "questions": [
          {
            "title": "string (Turkish)",
            "titleEn": "string (English)",
            "description": "string (Turkish)",
            "descriptionEn": "string (English)",
            "clarificationHint": "string (Turkish)",
            "clarificationHintEn": "string (English)",
            "maxDurationSec": number (strictly 30, 60, 90, 120, 150, or 180)
          }
        ]
      }
    `;

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    let parsed: {
      title?: string;
      titleEn?: string;
      tagline?: string;
      taglineEn?: string;
      description?: string;
      descriptionEn?: string;
      questions?: Array<{
        title: string;
        titleEn?: string;
        description: string;
        descriptionEn?: string;
        clarificationHint?: string;
        clarificationHintEn?: string;
        maxDurationSec?: number;
      }>;
    } = {};

    try {
      parsed = JSON.parse(response.text || "{}");
    } catch {
      // Fallback regex in case response is surrounded by code blocks
      const cleanJson = (response.text || "")
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
      parsed = JSON.parse(cleanJson);
    }

    const title = parsed.title?.trim() || "Müşteri Doğrulama Araştırması";
    const titleEn = parsed.titleEn?.trim() || "Customer Discovery & Validation Survey";
    const tagline = parsed.tagline?.trim() || "Saha Deneyimi & Problem Doğrulama";
    const taglineEn = parsed.taglineEn?.trim() || "Field Experience & Validation";
    const description = parsed.description?.trim() || "Katılımcıların saha deneyimlerini inceleyen araştırma.";
    const descriptionEn = parsed.descriptionEn?.trim() || "Exploring participants' field experiences and operational challenges.";

    // Normalize and sanitize questions according to the strict 30-second increment rules
    const rawQuestions = Array.isArray(parsed.questions) && parsed.questions.length > 0
      ? parsed.questions
      : [
          {
            title: "Saha Deneyimi & Problem Tespiti",
            titleEn: "Field Experience & Problem Identification",
            description: "Son 1 yılda sahada karşılaştığınız en kritik operasyonel aksaklığı ve süreci anlatabilir misiniz?",
            descriptionEn: "Over the past 12 months, can you describe the most critical operational breakdown and the response process?",
            clarificationHint: "Yaşanan somut olayı, gecikme süresini ve alternatif çözümleri düşünebilirsiniz.",
            clarificationHintEn: "Consider the specific event, downtime duration, and alternative solutions attempted.",
            maxDurationSec: 90,
          },
        ];

    const sanitizedQuestions = rawQuestions.map((q) => {
      // Enforce 30-second increments: round up to nearest multiple of 30, clamp between 30 and 180
      const rawSec = Number(q.maxDurationSec) || 90;
      let rounded = Math.ceil(rawSec / 30) * 30;
      if (rounded < 30) rounded = 30;
      if (rounded > 180) rounded = 180;

      return {
        title: q.title?.trim() || "Araştırma Sorusu",
        titleEn: q.titleEn?.trim() || "Research Question",
        description: q.description?.trim() || "Lütfen deneyiminizi paylaşınız.",
        descriptionEn: q.descriptionEn?.trim() || "Please share your direct experience.",
        clarificationHint: q.clarificationHint?.trim() || "Soruyu yanıtlarken somut deneyimlerinizi aktarabilirsiniz.",
        clarificationHintEn: q.clarificationHintEn?.trim() || "You may refer to specific events and operational impacts.",
        maxDurationSec: rounded,
      };
    });

    // Exact arithmetic sum of the included questions only
    const totalMaxSpeakingSeconds = sanitizedQuestions.reduce((acc, q) => acc + q.maxDurationSec, 0);
    const estimatedMinutes = Math.ceil(totalMaxSpeakingSeconds / 60);

    return {
      title,
      titleEn,
      tagline,
      taglineEn,
      description,
      descriptionEn,
      aiContext: rawPrompt.trim(),
      questions: sanitizedQuestions,
      totalMaxSpeakingSeconds,
      estimatedMinutes,
    };
  }
}

