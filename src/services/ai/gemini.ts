import { GoogleGenAI } from "@google/genai";
import {
  AIService,
  ChatMessage,
  TranscribeResult,
  GeneratedSurveyResult,
  ClarifyQuestionInput,
  ClarifyQuestionOutput,
} from "./interface";

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
    participantRole?: string;
    participantCompany?: string;
  }): Promise<string> {
    const isEn = params.lang === "en";
    const participantInfo = params.participantRole
      ? `${params.participantRole}${params.participantCompany ? ` at ${params.participantCompany}` : ""}`
      : isEn ? "Industrial Manufacturing & Maintenance Professional" : "Endüstriyel Üretim ve Bakım Uzmanı";

    const systemPrompt = `
      You are a professional research copilot assisting a domain expert (${participantInfo}) during a customer discovery survey for the research project "Print It Right: Food-Safe Parts On Demand".
      The participant is an expert in their field. Your role is to clarify the purpose, scope, and technical context of the current question, not to answer the survey for them or steer their response.

      === CRITICAL LANGUAGE REQUIREMENT ===
      The participant has selected the interview language: ${isEn ? "ENGLISH" : "TURKISH"}.
      You MUST write your entire response STRICTLY and completely in ${isEn ? "English" : "Turkish"}.
      Do not switch languages under any circumstance.

      === PARTICIPANT CONTEXT ===
      Declared Role & Profile: ${participantInfo}

      === CURRENT QUESTION CONTEXT ===
      Question Title: ${params.questionTitle}
      Question Description & Scope: ${params.questionDescription}
      ${params.questionHint ? `Clarification Hint: ${params.questionHint}` : ""}

      === PROJECT CONTEXT & RESEARCH RULES ===
      ${params.projectContext}

      === HOW TO CLARIFY EFFECTIVELY & PROFESSIONALLY ===
      1. Domain-Grounded Clarification:
         - Speak with engineering respect, using clear, industry-appropriate technical vocabulary (e.g., line stoppages, wear parts, guide rails, nozzle gaskets, CIP/SIP washdowns, OEM lead times, material certificates).
         - Explain the core intent of the question directly in 1-2 concise paragraphs.
      2. Hypothetical Examples:
         - To help the participant understand what kind of experience is being asked about, you MAY provide neutral, hypothetical examples from food processing machinery (e.g., a cracked plastic guide star on a bottling conveyor, a worn food-grade silicone seal on a dosing valve, a broken scraper blade, or a delayed OEM bracket).
         - Always clarify that these are merely illustrative examples, and they should answer according to their own real-world event.
      3. Uncertainty & Estimates:
         - Remind participants that rough estimations, partial knowledge, or stating "bilmiyorum / I don't know" is completely valid and valuable for research.
      4. Role-Perspective Interpretation (Job/Function Guidance):
         - When the participant asks how someone in their role/position (${participantInfo}) should interpret, approach, or answer the question (e.g., "Benim görevimdeki biri bu soruyu nasıl yorumlayabilir?"):
           a) Explicitly reassure them: they do NOT need to describe steps or decisions outside their firsthand responsibilities or authority. Stating "bu soru benim rolüme hitap etmiyor / this question does not directly apply to my role" or "bilmiyorum / I don't know" is completely valid and welcomed.
           b) Suggest how they can frame the question through their professional lens:
              - Sourcing/Purchasing: focus on requests received, supplier quotations, lead times, purchase order approvals, or delivery tracking.
              - Maintenance/Technician: focus on physical part symptoms, breakdown detection, line stoppage time, workshop repairs, or fitting.
              - Quality/Hygiene/Food-Safety: focus on food-contact zones, hygiene audits, chemical washdowns (CIP/SIP), or material compliance documents.
              - Operations/Plant Management: focus on overall production throughput, operator handovers, and line impact.
           c) NEVER invent facts for the participant; only provide a neutral lens through which they can reflect on their own work experience.
      5. STRICT PROHIBITIONS:
         - NEVER answer the survey question on the participant's behalf or propose what their answer should be.
         - NEVER ask follow-up questions, probes, or new questions back to the participant.
         - NEVER lead the participant or claim the research hypothesis is proven.
         - NEVER give binding engineering, repair, material-selection, food-safety, regulatory, hygiene, or certification advice. If asked for technical safety advice, state clearly:
           ${isEn 
             ? '"This survey cannot determine technical suitability, material choice, or food safety. Please consult a certified professional. I can only clarify what the survey question is asking."' 
             : '"Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği belirleyemez. Lütfen yetkili bir uzmana danışınız. Yalnızca sorunun kapsamını açıklayabilirim."'}
         - NEVER request or repeat personal, company, or confidential identifiers.
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
        "caseAnchor": "string (Turkish, e.g. Vaka Odağı: Belirlediğiniz somut parça / olay)",
        "caseAnchorEn": "string (English, e.g. Case Focus: Specific part event / incident)",
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
      caseAnchor?: string;
      caseAnchorEn?: string;
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
      caseAnchor: parsed.caseAnchor?.trim() || undefined,
      caseAnchorEn: parsed.caseAnchorEn?.trim() || undefined,
      aiContext: rawPrompt.trim(),
      questions: sanitizedQuestions,
      totalMaxSpeakingSeconds,
      estimatedMinutes,
    };
  }

  async clarifyQuestionSpec(params: ClarifyQuestionInput): Promise<ClarifyQuestionOutput> {
    const prompt = `
      You are an expert qualitative B2B research methodology copilot and AI prompt architect for "Print It Right" and industrial manufacturing discovery surveys.
      The user provides a question title (and optionally the current description and survey context).
      Your task is to generate:
      1. A professional, clear question description ("description" in Turkish, "descriptionEn" in English) that clearly defines the scope and what the participant is expected to reflect on.
      2. An in-depth AI Assistant Clarification Hint ("clarificationHint" in Turkish, "clarificationHintEn" in English):
         - Grounded, neutral hypothetical examples from industrial/manufacturing equipment (e.g. guide rails, nozzle gaskets, CIP washdowns, bearings, lead times, purchase orders).
         - Scope boundaries (e.g. "proprietary serial numbers or confidential drawings are not needed").
         - Validation that rough estimates or partial memory are welcome.
      3. Suggested duration in seconds ("suggestedDurationSec": 30 or 60).

      Output MUST be valid JSON adhering strictly to:
      {
        "description": "...",
        "descriptionEn": "...",
        "clarificationHint": "...",
        "clarificationHintEn": "...",
        "suggestedDurationSec": 60
      }

      Input details:
      Survey Title: ${params.surveyTitle || "Industrial Equipment Research"}
      Question Title: ${params.questionTitle}
      Current Description: ${params.currentDescription || "None"}
    `;

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || "{}";
      const parsed = JSON.parse(text);

      return {
        description: parsed.description || "Lütfen sahadaki somut deneyiminizi sade bir dille özetleyiniz.",
        descriptionEn: parsed.descriptionEn || "Please describe your real-world experience in plain terms.",
        clarificationHint: parsed.clarificationHint || "Bu soruda tek bir somut olaya odaklanabilirsiniz. Kesin model kodu veya gizli detaylar vermenize gerek yoktur.",
        clarificationHintEn: parsed.clarificationHintEn || "Focus on one specific event. Proprietary part numbers or drawings are not required.",
        suggestedDurationSec: Number(parsed.suggestedDurationSec) === 30 ? 30 : 60,
      };
    } catch (err) {
      console.error("[Gemini] clarifyQuestionSpec error:", err);
      return {
        description: params.currentDescription?.trim()
          ? params.currentDescription.trim()
          : `${params.questionTitle} konusunda sahadaki somut deneyiminizi, sürecin nasıl işlediğini ve karşılaştığınız durumları sade bir dille özetler misiniz?`,
        descriptionEn: `Could you describe your concrete on-site experience regarding ${params.questionTitle}?`,
        clarificationHint: `Bu soruda tek bir somut olaya odaklanın. Süreçteki rolünüzü, atılan adımları veya karşılaşılan engelleri düşünebilirsiniz. Gizli şirket detayları vermenize gerek yoktur.`,
        clarificationHintEn: `Focus on one specific real-world incident. Exact part numbers or confidential details are not needed.`,
        suggestedDurationSec: 60,
      };
    }
  }
}

