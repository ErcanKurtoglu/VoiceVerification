import { z } from "zod";

// --- Tracking & Attribution Types ---
export interface TrackingData {
  uid?: string; // Katılımcı ID (örn: usr_9942)
  ref?: string; // Referans (örn: linkedin, email_blast, direct)
  source?: string; // Kaynak
  campaign?: string; // Kampanya adı
  audience?: string; // Hedef Kitle / Segment (örn: "Bakım Mühendisleri", "Satın Alma")
}

// --- Survey / Project Types ---
export interface SurveyConfig {
  id: string; // Unique Identifier (örn: "print-it-right")
  slug: string;
  title: string;
  tagline: string;
  description: string;
  targetAudience: string;
  estimatedMinutes: number;
  aiContext: string; // Mini AI için bağlam bilgisi
  tips?: string[]; // Platform kullanım ipuçları
  isActive?: boolean; // Anket aktiflik / pasiflik durumu (varsayılan: true)
  questions: Question[];
}

export type ProjectConfig = SurveyConfig;

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
  audioBase64?: string;
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
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

export type FeedbackData = z.infer<typeof FeedbackSchema>;

// --- Full Session Submission ---
export interface InterviewSession {
  id: string;
  projectId: string; // Survey ID
  startedAt: string;
  completedAt?: string;
  participant: ParticipantData;
  tracking?: TrackingData;
  responses: Record<string, QuestionResponse>;
  feedback?: FeedbackData;
  status: "in_progress" | "completed" | "abandoned";
}
