import fs from "fs/promises";
import path from "path";
import { StorageService } from "./interface";
import { InterviewSession } from "@/types/interview";

// Demo ve geliştirme ortamı için yerel dosya depolama
const DATA_FILE_PATH = path.join(process.cwd(), ".data_sessions.json");

export class LocalFileStorageService implements StorageService {
  private async ensureFile(): Promise<void> {
    try {
      await fs.access(DATA_FILE_PATH);
    } catch {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify([]), "utf-8");
    }
  }

  async getAllSessions(): Promise<InterviewSession[]> {
    await this.ensureFile();
    try {
      const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
      return JSON.parse(content || "[]");
    } catch {
      return [];
    }
  }

  async saveSession(session: InterviewSession): Promise<void> {
    await this.ensureFile();
    const sessions = await this.getAllSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(sessions, null, 2), "utf-8");
  }

  async getSessionById(id: string): Promise<InterviewSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find((s) => s.id === id) || null;
  }
}

let storageInstance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageInstance) {
    storageInstance = new LocalFileStorageService();
  }
  return storageInstance;
}
