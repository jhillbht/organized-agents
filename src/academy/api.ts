// Academy API Client

import { invoke } from '@tauri-apps/api/core';
import type { 
  Lesson, 
  LearningModule, 
  UserLessonProgress, 
  UserExerciseSubmission, 
  UserStats, 
  Achievement 
} from './types';

export const academyApi = {
  // Module Management
  async getModules(): Promise<LearningModule[]> {
    return await invoke('get_academy_modules');
  },

  // Lesson Management
  async getLessons(moduleId?: string): Promise<Lesson[]> {
    return await invoke('get_academy_lessons', { moduleId });
  },

  async getLessonWithProgress(lessonId: string, userId: string = 'default'): Promise<{
    lesson: Lesson;
    progress?: UserLessonProgress;
    exercises: any[];
  }> {
    return await invoke('get_lesson_with_progress', { lessonId, userId });
  },

  async startLesson(lessonId: string, userId: string = 'default'): Promise<void> {
    return await invoke('start_academy_lesson', { lessonId, userId });
  },

  async completeLesson(
    lessonId: string, 
    userId: string = 'default', 
    score: number = 100,
    timeSpent: number = 0
  ): Promise<{ success: boolean; achievements_unlocked: string[] }> {
    return await invoke('complete_academy_lesson', { 
      lessonId, 
      userId, 
      score, 
      timeSpent 
    });
  },

  // Exercise Management
  async submitExercise(
    exerciseId: string,
    lessonId: string,
    submission: string,
    userId: string = 'default',
    timeSpent: number = 0
  ): Promise<{
    is_correct: boolean;
    score: number;
    feedback?: string;
    hints_available: boolean;
  }> {
    return await invoke('submit_exercise_solution', {
      exerciseId,
      lessonId,
      userId,
      submission,
      timeSpent,
    });
  },

  // User Progress & Stats
  async getUserStats(userId: string = 'default'): Promise<UserStats> {
    return await invoke('get_user_academy_stats', { userId });
  },

  async getUserAchievements(userId: string = 'default'): Promise<Achievement[]> {
    return await invoke('get_user_achievements', { userId });
  },

  // System
  async initializeSystem(): Promise<void> {
    return await invoke('initialize_academy_system');
  },
};

// Utility functions for the frontend
export const academyUtils = {
  calculateLevelFromExperience(experience: number): number {
    return Math.floor(experience / 100) + 1;
  },

  calculateExperienceForNextLevel(currentLevel: number): number {
    return currentLevel * 100;
  },

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  formatTimeSpent(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  },

  getDifficultyBadgeColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  getRarityColor(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  },

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  },

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '⏳';
      case 'not-started': return '⭕';
      default: return '❓';
    }
  },

  parseMarkdown(content: string): string {
    // Basic markdown parsing for lesson content
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  },

  generateUserId(): string {
    // Generate a simple user ID based on device/session
    // In a real app, this would come from authentication
    const stored = localStorage.getItem('academy_user_id');
    if (stored) return stored;
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('academy_user_id', newId);
    return newId;
  },
};