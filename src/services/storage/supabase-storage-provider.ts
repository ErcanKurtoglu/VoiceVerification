import { StorageService } from "./interface";
import { InterviewSession } from "@/types/interview";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase-client";
import { LocalFileStorageService } from "./local-storage-provider";

export class SupabaseStorageService implements StorageService {
  private fallbackService = new LocalFileStorageService();

  async getAllSessions(): Promise<InterviewSession[]> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return this.fallbackService.getAllSessions();
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("survey_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[SupabaseStorage] Listeleme hatası:", error);
        return this.fallbackService.getAllSessions();
      }

      return (data || []).map((row) => ({
        id: row.session_id,
        projectId: row.survey_id,
        participant: {
          fullName: row.participant_name || "",
          email: row.participant_email || "",
          company: row.participant_company || "",
          title: row.participant_role || "",
          consentGiven: true,
          honeypot: "",
        },
        tracking: row.tracking_data || {},
        responses: row.responses || {},
        feedback: row.feedback || {},
        startedAt: row.created_at || new Date().toISOString(),
        completedAt: row.updated_at || new Date().toISOString(),
        status: (row.is_completed ? "completed" : "in_progress") as "completed" | "in_progress",
      }));
    } catch (err) {
      console.error("[SupabaseStorage] Beklenmeyen hata:", err);
      return this.fallbackService.getAllSessions();
    }
  }

  async saveSession(session: InterviewSession): Promise<void> {
    // 1. Yerel yedeğe yazmayı dene (Vercel serverless salt okunur dosya sisteminde hata fırlatmamalı)
    try {
      await this.fallbackService.saveSession(session);
    } catch (e) {
      console.warn("[SupabaseStorage] Yerel dosya sistemine yazılamadı (sunucusuz ortam):", (e as Error).message);
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return;
    }

    try {
      const payload = {
        session_id: session.id,
        survey_id: session.projectId,
        participant_name: session.participant.fullName,
        participant_email: session.participant.email,
        participant_company: session.participant.company,
        participant_role: session.participant.title,
        tracking_data: session.tracking || {},
        responses: session.responses || {},
        feedback: session.feedback || {},
        is_completed: session.status === "completed",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("survey_submissions")
        .upsert(payload, { onConflict: "session_id" });

      if (error) {
        console.error("[SupabaseStorage] Kayıt hatası:", error);
      }
    } catch (err) {
      console.error("[SupabaseStorage] Kayıt sırasında hata:", err);
    }
  }

  async getSessionById(id: string): Promise<InterviewSession | null> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return this.fallbackService.getSessionById(id);
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("survey_submissions")
        .select("*")
        .eq("session_id", id)
        .single();

      if (error || !data) {
        return this.fallbackService.getSessionById(id);
      }

      return {
        id: data.session_id,
        projectId: data.survey_id,
        participant: {
          fullName: data.participant_name || "",
          email: data.participant_email || "",
          company: data.participant_company || "",
          title: data.participant_role || "",
          consentGiven: true,
          honeypot: "",
        },
        tracking: data.tracking_data || {},
        responses: data.responses || {},
        feedback: data.feedback || {},
        startedAt: data.created_at || new Date().toISOString(),
        completedAt: data.updated_at || new Date().toISOString(),
        status: (data.is_completed ? "completed" : "in_progress") as "completed" | "in_progress",
      };
    } catch {
      return this.fallbackService.getSessionById(id);
    }
  }
}
