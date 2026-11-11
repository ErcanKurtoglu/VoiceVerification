import {
  AIService,
  ChatMessage,
  TranscribeResult,
  GeneratedSurveyResult,
  GeneratedQuestion,
  ClarifyQuestionInput,
  ClarifyQuestionOutput,
} from "./interface";
import { GeminiAIService } from "./gemini";

interface AzureOpenAIOptions {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion?: string;
  geminiFallbackKey?: string;
}

export class AzureOpenAIAIService implements AIService {
  private apiKey: string;
  private endpoint: string;
  private deployment: string;
  private apiVersion: string;
  private geminiService?: GeminiAIService;

  constructor(options: AzureOpenAIOptions) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint.replace(/\/$/, "");
    this.deployment = options.deployment;
    this.apiVersion = options.apiVersion || "2024-08-01-preview";

    if (options.geminiFallbackKey) {
      this.geminiService = new GeminiAIService(options.geminiFallbackKey);
    }
  }

  private getChatCompletionsUrl(): string {
    return `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
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
      : isEn
        ? "Industrial Manufacturing & Maintenance Professional"
        : "Endüstriyel Üretim ve Bakım Uzmanı";

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
      4. STRICT PROHIBITIONS:
         - NEVER answer the survey question on the participant's behalf or propose what their answer should be.
         - NEVER ask follow-up questions, probes, or new questions back to the participant.
         - NEVER lead the participant or claim the research hypothesis is proven.
         - NEVER give binding engineering, repair, material-selection, food-safety, regulatory, hygiene, or certification advice. If asked for technical safety advice, state clearly:
           ${
             isEn
               ? '"This survey cannot determine technical suitability, material choice, or food safety. Please consult a certified professional. I can only clarify what the survey question is asking."'
               : '"Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği belirleyemez. Lütfen yetkili bir uzmana danışınız. Yalnızca sorunun kapsamını açıklayabilirim."'
           }
         - NEVER request or repeat personal, company, or confidential identifiers.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...params.conversationHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: params.userQuery },
    ];

    try {
      const res = await fetch(this.getChatCompletionsUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: 0.5,
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[AzureOpenAI] Chat request failed:", res.status, errorText);
        throw new Error(`Azure OpenAI chat error: ${res.status}`);
      }

      const data = await res.json();
      return (
        data.choices?.[0]?.message?.content?.trim() ||
        (isEn
          ? "Could not clarify your question. Please try again."
          : "Sorunuzu yanıtlayamadım, lütfen tekrar deneyiniz.")
      );
    } catch (err) {
      console.error("[AzureOpenAI] Chat exception:", err);
      if (this.geminiService) {
        console.log("[AzureOpenAI] Falling back to Gemini for chat...");
        return this.geminiService.chatClarification(params);
      }
      return isEn
        ? "A connection error occurred. Please try asking again."
        : "Bağlantı hatası oluştu. Lütfen tekrar sorunuz.";
    }
  }

  async transcribeAudioOrText(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    // 1. Yazılı yanıt doğrudan transkript kabul edilir
    if (params.userTextResponse && !params.audioBase64) {
      return {
        transcript: params.userTextResponse.trim(),
        isJunk: false,
      };
    }

    // 2. Ses kaydı varsa ve Gemini servisi tanımlıysa doğrudan Gemini multimodal dinleme ile deşifre et
    if (this.geminiService && params.audioBase64) {
      return this.geminiService.transcribeAudioOrText(params);
    }

    // 3. Fallback
    return {
      transcript: params.userTextResponse || "Ses kaydı başarıyla alındı ve arşivlendi.",
      isJunk: false,
    };
  }

  async generateSurveyFromPrompt(rawPrompt: string): Promise<GeneratedSurveyResult> {
    const systemPrompt = `
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
      5. Output format must be strictly pure JSON.
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

    try {
      const res = await fetch(this.getChatCompletionsUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        throw new Error(`Azure OpenAI survey generator failed: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      const questions: GeneratedQuestion[] = (parsed.questions || []).map((q: any) => {
        let maxSec = Number(q.maxDurationSec) || 60;
        const validIncrements = [30, 60, 90, 120, 150, 180];
        if (!validIncrements.includes(maxSec)) {
          maxSec = validIncrements.find((inc) => inc >= maxSec) || 180;
        }

        return {
          title: q.title || "İsimsiz Soru",
          titleEn: q.titleEn,
          description: q.description || "",
          descriptionEn: q.descriptionEn,
          clarificationHint: q.clarificationHint || "",
          clarificationHintEn: q.clarificationHintEn,
          maxDurationSec: maxSec,
        };
      });

      const totalMaxSpeakingSeconds = questions.reduce(
        (sum, q) => sum + q.maxDurationSec,
        0
      );
      const estimatedMinutes = Math.max(1, Math.ceil(totalMaxSpeakingSeconds / 60));

      return {
        title: parsed.title || "Yeni Araştırma Anketi",
        titleEn: parsed.titleEn,
        tagline: parsed.tagline || "Saha Deneyimi & Doğrulama",
        taglineEn: parsed.taglineEn,
        description: parsed.description || "",
        descriptionEn: parsed.descriptionEn,
        caseAnchor: parsed.caseAnchor || "Vaka Odağı: Belirlediğiniz somut parça / olay",
        caseAnchorEn: parsed.caseAnchorEn || "Case Focus: Specific part event / incident",
        aiContext: rawPrompt,
        aiContextEn: rawPrompt,
        questions,
        totalMaxSpeakingSeconds,
        estimatedMinutes,
      };
    } catch (err) {
      console.error("[AzureOpenAI] Survey generation exception:", err);
      if (this.geminiService) {
        console.log("[AzureOpenAI] Falling back to Gemini for survey generation...");
        return this.geminiService.generateSurveyFromPrompt(rawPrompt);
      }
      throw err;
    }
  }

  async clarifyQuestionSpec(params: ClarifyQuestionInput): Promise<ClarifyQuestionOutput> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

    const systemPrompt = `
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
    `;

    const userPrompt = `
      Survey Title: ${params.surveyTitle || "Industrial Equipment Research"}
      Question Title: ${params.questionTitle}
      Current Description: ${params.currentDescription || "None"}
    `;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        throw new Error(`Azure OpenAI clarifyQuestionSpec failed: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      return {
        description: parsed.description || "Lütfen sahadaki somut deneyiminizi sade bir dille özetleyiniz.",
        descriptionEn: parsed.descriptionEn || "Please describe your real-world experience in plain terms.",
        clarificationHint: parsed.clarificationHint || "Bu soruda tek bir somut olaya odaklanabilirsiniz. Kesin model kodu veya gizli detaylar vermenize gerek yoktur.",
        clarificationHintEn: parsed.clarificationHintEn || "Focus on one specific event. Proprietary part numbers or drawings are not required.",
        suggestedDurationSec: Number(parsed.suggestedDurationSec) === 30 ? 30 : 60,
      };
    } catch (err) {
      console.error("[AzureOpenAI] clarifyQuestionSpec exception:", err);
      if (this.geminiService) {
        console.log("[AzureOpenAI] Falling back to Gemini for clarifyQuestionSpec...");
        return this.geminiService.clarifyQuestionSpec(params);
      }
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
