import { invoke } from '@tauri-apps/api/core';
import { 
  BMadLesson, 
  BMadLearningProgress, 
  BMadAchievement,
  BMadEducationStats,
  ContextualSuggestion,
  LearningContext,
  SmartRecommendation,
  TutorialResults,
  BMadAssessment,
  LearningPath,
  BMadExercise
} from '@/types/bmad-education';
import { BMadProject, ProjectState, BMadPhase, AgentType } from '@/types/bmad';

/**
 * BMAD Education API - Extends the existing education system with BMAD-specific features
 */
export class BMadEducationAPI {
  
  // ===== LESSON MANAGEMENT =====
  
  /**
   * Get all BMAD lessons with progress information
   */
  static async getBMadLessons(): Promise<BMadLesson[]> {
    try {
      return await invoke('get_bmad_lessons');
    } catch (error) {
      console.error('Failed to get BMAD lessons:', error);
      return this.getDefaultLessons(); // Fallback to hardcoded lessons
    }
  }

  /**
   * Get lessons relevant to a specific BMAD phase
   */
  static async getLessonsForPhase(phase: BMadPhase): Promise<BMadLesson[]> {
    const allLessons = await this.getBMadLessons();
    return allLessons.filter(lesson => 
      lesson.phase === phase || lesson.phase === 'general'
    );
  }

  /**
   * Get contextual lesson recommendations based on project state
   */
  static async getContextualLessons(
    projectState: ProjectState
  ): Promise<BMadLesson[]> {
    try {
      return await invoke('get_contextual_bmad_lessons', { projectState });
    } catch (error) {
      console.error('Failed to get contextual lessons:', error);
      // Fallback: return lessons for current phase
      return this.getLessonsForPhase(projectState.currentPhase);
    }
  }

  // ===== PROGRESS TRACKING =====

  /**
   * Get user's BMAD learning progress
   */
  static async getBMadProgress(): Promise<BMadLearningProgress> {
    try {
      return await invoke('get_bmad_learning_progress');
    } catch (error) {
      console.error('Failed to get BMAD progress:', error);
      return this.getDefaultProgress();
    }
  }

  /**
   * Update lesson completion
   */
  static async completeBMadLesson(
    lessonId: string, 
    score: number, 
    timeSpent: number
  ): Promise<void> {
    try {
      await invoke('complete_bmad_lesson', { 
        lessonId, 
        score, 
        timeSpent 
      });
    } catch (error) {
      console.error('Failed to complete BMAD lesson:', error);
      throw error;
    }
  }

  /**
   * Update exercise completion
   */
  static async completeBMadExercise(
    exerciseId: string, 
    results: TutorialResults
  ): Promise<void> {
    try {
      await invoke('complete_bmad_exercise', { 
        exerciseId, 
        results 
      });
    } catch (error) {
      console.error('Failed to complete BMAD exercise:', error);
      throw error;
    }
  }

  // ===== CONTEXT-AWARE LEARNING =====

  /**
   * Get smart recommendations based on current context
   */
  static async getSmartRecommendations(
    context: LearningContext
  ): Promise<SmartRecommendation> {
    try {
      return await invoke('get_smart_learning_recommendations', { context });
    } catch (error) {
      console.error('Failed to get smart recommendations:', error);
      return this.generateFallbackRecommendations(context);
    }
  }

  /**
   * Get just-in-time learning suggestions for current view
   */
  static async getContextualSuggestions(
    currentView: string,
    projectState?: ProjectState
  ): Promise<ContextualSuggestion[]> {
    try {
      return await invoke('get_contextual_suggestions', { 
        currentView, 
        projectState 
      });
    } catch (error) {
      console.error('Failed to get contextual suggestions:', error);
      return this.getDefaultSuggestions(currentView);
    }
  }

  // ===== PROJECT-BASED LEARNING =====

  /**
   * Create project-based exercise using real project data
   */
  static async createProjectBasedExercise(
    project: BMadProject, 
    lessonId: string
  ): Promise<BMadExercise> {
    try {
      return await invoke('create_project_based_exercise', { 
        project, 
        lessonId 
      });
    } catch (error) {
      console.error('Failed to create project-based exercise:', error);
      throw error;
    }
  }

  /**
   * Validate real project integration for learning
   */
  static async validateProjectForLearning(
    project: BMadProject
  ): Promise<boolean> {
    try {
      return await invoke('validate_project_for_learning', { project });
    } catch (error) {
      console.error('Failed to validate project for learning:', error);
      return false;
    }
  }

  // ===== ACHIEVEMENTS & GAMIFICATION =====

  /**
   * Get user achievements
   */
  static async getBMadAchievements(): Promise<BMadAchievement[]> {
    try {
      return await invoke('get_bmad_achievements');
    } catch (error) {
      console.error('Failed to get BMAD achievements:', error);
      return [];
    }
  }

  /**
   * Check for new achievements based on recent activity
   */
  static async checkForNewAchievements(): Promise<BMadAchievement[]> {
    try {
      return await invoke('check_new_bmad_achievements');
    } catch (error) {
      console.error('Failed to check for new achievements:', error);
      return [];
    }
  }

  /**
   * Get education statistics
   */
  static async getBMadEducationStats(): Promise<BMadEducationStats> {
    try {
      return await invoke('get_bmad_education_stats');
    } catch (error) {
      console.error('Failed to get BMAD education stats:', error);
      return this.getDefaultStats();
    }
  }

  // ===== ASSESSMENT & CERTIFICATION =====

  /**
   * Get available assessments
   */
  static async getBMadAssessments(): Promise<BMadAssessment[]> {
    try {
      return await invoke('get_bmad_assessments');
    } catch (error) {
      console.error('Failed to get BMAD assessments:', error);
      return [];
    }
  }

  /**
   * Submit assessment results
   */
  static async submitAssessment(
    assessmentId: string, 
    answers: Record<string, any>
  ): Promise<{ score: number; passed: boolean; feedback: string }> {
    try {
      return await invoke('submit_bmad_assessment', { 
        assessmentId, 
        answers 
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      throw error;
    }
  }

  // ===== LEARNING PATHS =====

  /**
   * Get recommended learning paths
   */
  static async getLearningPaths(): Promise<LearningPath[]> {
    try {
      return await invoke('get_bmad_learning_paths');
    } catch (error) {
      console.error('Failed to get learning paths:', error);
      return this.getDefaultLearningPaths();
    }
  }

  /**
   * Start a learning path
   */
  static async startLearningPath(pathId: string): Promise<void> {
    try {
      await invoke('start_bmad_learning_path', { pathId });
    } catch (error) {
      console.error('Failed to start learning path:', error);
      throw error;
    }
  }

  // ===== FALLBACK DATA METHODS =====

  /**
   * Default lessons when backend is not available
   */
  private static getDefaultLessons(): BMadLesson[] {
    return [
      {
        id: 'bmad-fundamentals',
        title: 'BMAD Fundamentals',
        description: 'Understanding the 5-phase Breakthrough Method for Agile AI-Driven Development',
        phase: 'general',
        content: {
          introduction: 'Learn the core principles of BMAD methodology and how it transforms AI-driven development.',
          sections: [
            {
              title: 'What is BMAD?',
              content: 'BMAD is a structured methodology for coordinating AI agents in development workflows.',
              type: 'text'
            },
            {
              title: 'The 5 Phases',
              content: 'Planning → Story Creation → Development → Quality Assurance → Complete',
              type: 'text'
            }
          ],
          summary: 'BMAD provides structure and coordination for AI-driven development.',
          keyTakeaways: [
            'BMAD has 5 distinct phases',
            'Each phase has specific agent roles',
            'File-based coordination enables persistence'
          ],
          additionalResources: []
        },
        exercises: [],
        prerequisites: [],
        realProjectIntegration: false,
        estimatedDuration: 30,
        difficulty: 'beginner',
        tags: ['fundamentals', 'methodology'],
        order_index: 1
      },
      {
        id: 'project-setup',
        title: 'Project Setup',
        description: 'Creating and configuring BMAD projects for optimal workflow management',
        phase: 'general',
        content: {
          introduction: 'Learn how to set up BMAD projects with proper structure and configuration.',
          sections: [
            {
              title: 'Creating a BMAD Project',
              content: 'Use the project creator wizard to set up your workspace.',
              type: 'interactive'
            },
            {
              title: 'Directory Structure',
              content: 'Understanding the .bmad/ directory and its contents.',
              type: 'text'
            }
          ],
          summary: 'Proper project setup is crucial for BMAD success.',
          keyTakeaways: [
            '.bmad/ directory contains all coordination files',
            'state.yaml tracks project progress',
            'communications/ folder manages agent messages'
          ],
          additionalResources: []
        },
        exercises: [],
        prerequisites: ['bmad-fundamentals'],
        realProjectIntegration: true,
        estimatedDuration: 20,
        difficulty: 'beginner',
        tags: ['setup', 'project-management'],
        order_index: 2
      }
    ];
  }

  /**
   * Default progress when backend is not available
   */
  private static getDefaultProgress(): BMadLearningProgress {
    return {
      completedLessons: [],
      achievements: [],
      skillLevels: {
        ProjectSetup: 0,
        WorkflowManagement: 0,
        AgentCoordination: 0,
        Communication: 0,
        QualityAssurance: 0,
        ProblemSolving: 0,
        ProcessOptimization: 0,
        TeamLeadership: 0,
      },
      projectsCompleted: 0,
      totalWorkflowCycles: 0,
      masteryLevel: 'beginner',
      lastActive: new Date().toISOString(),
      totalLearningTime: 0,
      streakDays: 0
    };
  }

  /**
   * Default education stats
   */
  private static getDefaultStats(): BMadEducationStats {
    return {
      totalLessonsCompleted: 0,
      totalExercisesCompleted: 0,
      averageScore: 0,
      learningStreak: 0,
      skillProficiency: {
        ProjectSetup: 0,
        WorkflowManagement: 0,
        AgentCoordination: 0,
        Communication: 0,
        QualityAssurance: 0,
        ProblemSolving: 0,
        ProcessOptimization: 0,
        TeamLeadership: 0,
      },
      timeSpentLearning: 0,
      achievementsUnlocked: 0,
      masteryLevel: 'beginner'
    };
  }

  /**
   * Generate fallback recommendations
   */
  private static generateFallbackRecommendations(context: LearningContext): SmartRecommendation {
    const suggestions: ContextualSuggestion[] = [];
    
    // Add suggestions based on current view
    if (context.currentView === 'workflow') {
      suggestions.push({
        type: 'lesson',
        title: 'Workflow Management',
        description: 'Learn to effectively manage BMAD workflow phases',
        relevanceScore: 85,
        reason: 'You are currently viewing the workflow interface',
        lessonId: 'workflow-management'
      });
    }

    return {
      suggestions,
      justInTimeTips: [
        'Use the phase indicators to track workflow progress',
        'Check agent recommendations for next steps',
        'Review communication board for team updates'
      ],
      skillGaps: []
    };
  }

  /**
   * Default contextual suggestions
   */
  private static getDefaultSuggestions(currentView: string): ContextualSuggestion[] {
    const suggestions = [
      {
        type: 'tip' as const,
        title: 'Quick Start',
        description: 'Create your first BMAD project to begin learning',
        relevanceScore: 90,
        reason: 'Getting started with hands-on experience'
      }
    ];

    if (currentView === 'workflow') {
      suggestions.push({
        type: 'lesson' as const,
        title: 'Workflow Management',
        description: 'Master the 5-phase BMAD workflow',
        relevanceScore: 95,
        reason: 'Currently viewing workflow interface'
      });
    }

    return suggestions;
  }

  /**
   * Default learning paths
   */
  private static getDefaultLearningPaths(): LearningPath[] {
    return [
      {
        id: 'bmad-beginner',
        title: 'BMAD Beginner Path',
        description: 'Start your journey with BMAD methodology fundamentals',
        targetAudience: 'beginner',
        estimatedDuration: 120,
        lessons: ['bmad-fundamentals', 'project-setup', 'basic-workflow'],
        prerequisites: [],
        outcomes: [
          'Understand BMAD methodology',
          'Set up BMAD projects',
          'Complete basic workflows'
        ]
      }
    ];
  }
}

// Error handling utility for BMAD education
export class BMadEducationError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'BMadEducationError';
  }
}

// Helper function to handle BMAD education errors consistently
export const handleBMadEducationError = (error: unknown): BMadEducationError => {
  if (error instanceof Error) {
    return new BMadEducationError(error.message);
  }
  
  if (typeof error === 'string') {
    return new BMadEducationError(error);
  }
  
  return new BMadEducationError('An unknown education error occurred');
};