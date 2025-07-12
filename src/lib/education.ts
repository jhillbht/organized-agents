import { invoke } from '@tauri-apps/api/core';

export interface Session {
  id: string;
  title: string;
  description: string;
  order_index: number;
  difficulty: string;
  estimated_duration: number;
  prerequisites: string[];
}

export interface UserProgress {
  session_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  score?: number;
  attempts: number;
}

export interface SessionWithProgress {
  session: Session;
  progress?: UserProgress;
}

export const educationApi = {
  async getSessions(): Promise<SessionWithProgress[]> {
    return await invoke('get_education_sessions');
  },

  async startSession(sessionId: string): Promise<void> {
    return await invoke('start_education_session', { sessionId });
  },

  async completeSession(sessionId: string, score: number): Promise<void> {
    return await invoke('complete_education_session', { sessionId, score });
  },

  async resetProgress(): Promise<void> {
    return await invoke('reset_education_progress');
  },

  async initializeSystem(): Promise<void> {
    return await invoke('initialize_education_system');
  }
};