import { z } from "zod";

// --- Project Types ---
export interface ProjectConfig {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  estimatedMinutes: number;
  leadReward: string; // "Örn: 2026 Sektör Benchmark Raporu"
  aiContext: string; // Mini AI için bağlam bilgisi
  questions: Question[];
}

export interface Question {
  id: string;
  order: number;
  title: string;
  description: string;
  clarificationHint: string;
  maxDurationSec: number;
}

// --- Session & Participant Types ---
export const ParticipantSchema = z.object({
  fullName: z.string().min(2, "Lütfen adınızı ve soyadınızı giriniz."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  company: z.string().min(2, "Lütfen şirket veya kurum bilginizi giriniz."),
  title: z.string().min(2, "Lütfen unvanınızı veya rolünüzü giriniz."),
  linkedinUrl: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal("")),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "Devam edebilmek için araştırma ve ses işleme onayını vermelisiniz.",
  }),
  honeypot: z.string().max(0, "Bot aktivitesi tespit edildi.").optional(), // Anti-garbage honeypot
});

export type ParticipantData = z.infer<typeof ParticipantSchema>;

// --- Response Types ---
export interface QuestionResponse {
  questionId: string;
  audioBlob?: Blob;
  audioUrl?: string;
  durationSec?: number;
  textResponse?: string;
  mode: "audio" | "text";
  transcript?: string;
  sentiment?: "positive" | "neutral" | "negative" | "critical";
  summary?: string;
  isJunk?: boolean;
}

// --- Feedback Types ---
export const FeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

export type FeedbackData = z.infer<typeof FeedbackSchema>;

// --- Full Session Submission ---
export interface InterviewSession {
  id: string;
  projectId: string;
  startedAt: string;
  completedAt?: string;
  participant: ParticipantData;
  responses: Record<string, QuestionResponse>;
  feedback?: FeedbackData;
  status: "in_progress" | "completed" | "abandoned";
}
