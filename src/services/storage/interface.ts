import { InterviewSession } from "@/types/interview";

export interface StorageService {
  saveSession(session: InterviewSession): Promise<void>;
  getAllSessions(): Promise<InterviewSession[]>;
  getSessionById(id: string): Promise<InterviewSession | null>;
}
