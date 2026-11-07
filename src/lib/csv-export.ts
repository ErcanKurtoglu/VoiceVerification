import type { InterviewSession, SurveyConfig } from "../types/interview";

export interface CSVExportOptions {
  sessions: InterviewSession[];
  surveysList: SurveyConfig[];
  exportSurveyId?: string; // specific survey id or "all"
  exportAudience?: string; // specific audience or "all"
  exportOnlyValid?: boolean;
}

/**
 * Escapes a cell value for CSV output:
 * - Converts null/undefined to empty quoted string
 * - Replaces CRLF and LF with a single space to avoid broken row lines
 * - Escapes inner double quotes with double-quotes (" -> "")
 * - Wraps the final output in double quotes
 */
export function escapeCSVCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/\r\n/g, " ").replace(/[\r\n]/g, " ");
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Resolves survey config by matching id or slug with alias fallback.
 */
export function getSurveyForSession(
  projectId: string,
  surveysList: SurveyConfig[]
): SurveyConfig | undefined {
  return surveysList.find(
    (s) =>
      s.id === projectId ||
      s.slug === projectId ||
      (s.id === "print-it-right-v1" && projectId === "food-production-equipment-v2") ||
      (s.id === "food-production-equipment-v2" && projectId === "print-it-right-v1")
  );
}

/**
 * Generates an RFC-compliant, UTF-8 BOM encoded CSV string.
 * Guarantees every row has the exact same column count as the header row.
 */
export function generateSurveyCSV({
  sessions,
  surveysList,
  exportSurveyId = "all",
  exportAudience = "all",
  exportOnlyValid = false,
}: CSVExportOptions): {
  csvContent: string;
  fileName: string;
  headerCount: number;
  rowCount: number;
} {
  // 1. Filtreleme
  let filtered = [...sessions];

  if (exportSurveyId !== "all") {
    filtered = filtered.filter(
      (s) =>
        s.projectId === exportSurveyId ||
        (exportSurveyId === "print-it-right-v1" && s.projectId === "food-production-equipment-v2") ||
        (exportSurveyId === "food-production-equipment-v2" && s.projectId === "print-it-right-v1")
    );
  }

  if (exportAudience !== "all") {
    filtered = filtered.filter((s) => s.tracking?.audience === exportAudience);
  }

  if (exportOnlyValid) {
    filtered = filtered.filter((s) => s.aiSanity?.isJunk !== true);
  }

  const matchedSingleSurvey =
    exportSurveyId !== "all"
      ? getSurveyForSession(exportSurveyId, surveysList)
      : null;

  // Soru sütun adedi hesabı
  let maxQuestions = matchedSingleSurvey?.questions?.length || 3;
  filtered.forEach((s) => {
    const respCount = Object.keys(s.responses || {}).length;
    if (respCount > maxQuestions) maxQuestions = respCount;
  });

  // Header oluşturma
  const baseHeaders = [
    "Oturum ID",
    "Anket ID",
    "Anket Adı",
    "Katılımcı",
    "E-posta",
    "Şirket",
    "Unvan",
    "Hedef Kitle / Segment",
    "UID",
    "Deneyim Puanı",
    "Beğenilen Özellikler (Etiketler)",
    "Geri Bildirim Notu / Önerisi",
    "Tarih",
  ];

  const questionHeaders = Array.from({ length: maxQuestions }, (_, i) => {
    if (matchedSingleSurvey?.questions?.[i]?.title) {
      return `Soru ${i + 1} (${matchedSingleSurvey.questions[i].title}): Deşifre`;
    }
    return `Soru ${i + 1} Deşifre`;
  });

  const rawHeaders = [...baseHeaders, ...questionHeaders];
  // CRITICAL: Every single header MUST be quoted via escapeCSVCell to avoid commas in titles splitting columns!
  const escapedHeaders = rawHeaders.map(escapeCSVCell).join(",");

  // Rows oluşturma
  const rows = filtered.map((s) => {
    const matchedSurvey =
      matchedSingleSurvey || getSurveyForSession(s.projectId, surveysList);
    const responsesList = Object.values(s.responses || {});

    const questionCols = Array.from({ length: maxQuestions }, (_, i) => {
      let resp: any = undefined;
      if (matchedSurvey?.questions && matchedSurvey.questions[i]) {
        const qId = matchedSurvey.questions[i].id;
        resp = s.responses?.[qId];
      }
      if (!resp) {
        resp = responsesList[i];
      }
      const text = resp?.transcript || resp?.textResponse || "";
      return escapeCSVCell(text);
    });

    const feedbackTags = (s.feedback?.tags || []).join("; ");
    const feedbackNotes = s.feedback?.notes || "";
    const audienceSegment = s.tracking?.audience || "Genel";
    const surveyTitle = matchedSurvey?.title || s.projectId;

    const rowCells = [
      escapeCSVCell(s.id),
      escapeCSVCell(s.projectId),
      escapeCSVCell(surveyTitle),
      escapeCSVCell(s.participant.fullName),
      escapeCSVCell(s.participant.email),
      escapeCSVCell(s.participant.company),
      escapeCSVCell(s.participant.title),
      escapeCSVCell(audienceSegment),
      escapeCSVCell(s.tracking?.uid || ""),
      escapeCSVCell(
        s.feedback?.rating && s.feedback.rating > 0
          ? `${s.feedback.rating}.0`
          : "Seçim Yapılmadı"
      ),
      escapeCSVCell(feedbackTags || "Seçilmedi"),
      escapeCSVCell(feedbackNotes || "İletilmedi"),
      escapeCSVCell(new Date(s.startedAt).toLocaleString("tr-TR")),
      ...questionCols,
    ];

    return rowCells.join(",");
  });

  let fileName = "voice_verification";
  if (matchedSingleSurvey) {
    fileName += `_${matchedSingleSurvey.slug || matchedSingleSurvey.id}`;
  } else {
    fileName += "_all_surveys";
  }
  if (exportAudience !== "all") {
    const cleanAud = exportAudience.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    fileName += `_${cleanAud}`;
  }
  fileName += `_${Date.now()}.csv`;

  const csvContent = "\uFEFF" + [escapedHeaders, ...rows].join("\n");

  return {
    csvContent,
    fileName,
    headerCount: rawHeaders.length,
    rowCount: rows.length,
  };
}
