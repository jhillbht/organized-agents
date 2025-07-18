import { BMadPhase, BMadProject, ProjectState, AgentType } from './bmad';

// BMAD Education System Types

export interface BMadLesson {
  id: string;
  title: string;
  description: string;
  phase: BMadPhase | 'general'; // 'general' for lessons that apply to all phases
  content: LessonContent;
  exercises: BMadExercise[];
  prerequisites: string[];
  realProjectIntegration: boolean;
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  order_index: number;
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  keyTakeaways: string[];
  additionalResources: Resource[];
}

export interface LessonSection {
  title: string;
  content: string;
  type: 'text' | 'code' | 'video' | 'interactive' | 'exercise';
  metadata?: Record<string, any>;
}

export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'video' | 'article' | 'tool' | 'template';
}

export interface BMadExercise {
  id: string;
  title: string;
  type: 'workflow-simulation' | 'agent-dispatch' | 'communication' | 'project-setup' | 'quality-gates' | 'troubleshooting';
  description: string;
  instructions: string[];
  completionCriteria: string[];
  hints: string[];
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  realProjectRequired: boolean;
  mockData?: any; // For exercises that can work without real projects
}

export interface BMadLearningProgress {
  completedLessons: string[];
  achievements: BMadAchievement[];
  skillLevels: Record<BMadSkill, number>; // 0-100 proficiency score
  projectsCompleted: number;
  totalWorkflowCycles: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastActive: string;
  totalLearningTime: number; // in minutes
  streakDays: number;
}

export interface BMadAchievement {
  id: string;
  title: string;
  description: string;
  type: 'workflow-completion' | 'agent-mastery' | 'project-milestone' | 'communication-excellence' | 'learning-streak' | 'methodology-expert';
  criteria: AchievementCriteria;
  badge: string; // emoji or icon identifier
  points: number;
  unlockedAt?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'score' | 'time' | 'completion';
  target: number;
  metric: string; // what to measure
  description: string;
}

export enum BMadSkill {
  ProjectSetup = 'ProjectSetup',
  WorkflowManagement = 'WorkflowManagement',
  AgentCoordination = 'AgentCoordination',
  Communication = 'Communication',
  QualityAssurance = 'QualityAssurance',
  ProblemSolving = 'ProblemSolving',
  ProcessOptimization = 'ProcessOptimization',
  TeamLeadership = 'TeamLeadership',
}

export interface TutorialResults {
  exerciseId: string;
  completed: boolean;
  score: number; // 0-100
  timeSpent: number; // in seconds
  hintsUsed: number;
  errors: TutorialError[];
  feedback: string;
}

export interface TutorialError {
  step: number;
  error: string;
  correction: string;
  timestamp: string;
}

export interface ContextualSuggestion {
  type: 'lesson' | 'exercise' | 'resource' | 'tip';
  title: string;
  description: string;
  relevanceScore: number; // 0-100
  reason: string; // why this suggestion is relevant
  lessonId?: string;
  exerciseId?: string;
  resourceUrl?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'all';
  estimatedDuration: number; // total minutes
  lessons: string[]; // lesson IDs in order
  prerequisites: string[];
  outcomes: string[]; // what learners will achieve
}

// Interactive Tutorial Types
export interface InteractiveTutorialStep {
  id: string;
  title: string;
  description: string;
  type: 'explanation' | 'action' | 'verification' | 'reflection';
  content: string;
  action?: TutorialAction;
  verification?: TutorialVerification;
  nextSteps: string[]; // IDs of possible next steps
}

export interface TutorialAction {
  type: 'click' | 'input' | 'navigate' | 'create' | 'dispatch';
  target: string; // CSS selector or component identifier
  expectedValue?: string;
  instructions: string;
}

export interface TutorialVerification {
  type: 'ui-state' | 'data-state' | 'user-input' | 'time-based';
  condition: string;
  successMessage: string;
  failureMessage: string;
  retryAllowed: boolean;
}

// Context-Aware Learning Types
export interface LearningContext {
  currentProject?: BMadProject;
  projectState?: ProjectState;
  userProgress: BMadLearningProgress;
  recentErrors: string[];
  currentView: 'workflow' | 'communication' | 'dispatch' | 'creator' | 'projects';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  learningSession: {
    startTime: string;
    duration: number; // minutes so far
    lessonsCompleted: number;
    focusLevel: number; // 0-100 estimated focus
  };
}

export interface SmartRecommendation {
  suggestions: ContextualSuggestion[];
  learningPath?: LearningPath;
  justInTimeTips: string[];
  skillGaps: {
    skill: BMadSkill;
    currentLevel: number;
    targetLevel: number;
    recommendedActions: string[];
  }[];
}

// Assessment Types
export interface BMadAssessment {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'practical' | 'scenario' | 'certification';
  questions: AssessmentQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // minutes
  attempts: number; // allowed attempts
  prerequisites: string[];
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'practical' | 'scenario';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Helper types for UI components
export interface BMadEducationDashboardProps {
  currentProject?: BMadProject;
  bmadProgress: BMadLearningProgress;
  onStartBMadLesson: (lesson: BMadLesson) => void;
  onProjectBasedLearning: (project: BMadProject) => void;
  onContextualHelp: () => void;
}

export interface InteractiveTutorialProps {
  lesson: BMadLesson;
  currentProject?: BMadProject;
  onComplete: (results: TutorialResults) => void;
  onProgress: (step: number, total: number) => void;
  onExit: () => void;
}

export interface ContextualHelpProps {
  currentView: 'workflow' | 'communication' | 'dispatch' | 'creator' | 'projects';
  projectState?: ProjectState;
  userProgress: BMadLearningProgress;
  onLessonSuggestion: (lesson: BMadLesson) => void;
  onQuickTip: (tip: string) => void;
}

// API Response Types
export interface BMadEducationStats {
  totalLessonsCompleted: number;
  totalExercisesCompleted: number;
  averageScore: number;
  learningStreak: number;
  skillProficiency: Record<BMadSkill, number>;
  timeSpentLearning: number; // total minutes
  achievementsUnlocked: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Constants for lesson categories
export const BMAD_LESSON_CATEGORIES = {
  FUNDAMENTALS: 'fundamentals',
  PROJECT_MANAGEMENT: 'project-management',
  AGENT_COORDINATION: 'agent-coordination',
  COMMUNICATION: 'communication',
  QUALITY_ASSURANCE: 'quality-assurance',
  ADVANCED_TECHNIQUES: 'advanced-techniques',
  TROUBLESHOOTING: 'troubleshooting',
} as const;

export const BMAD_EXERCISE_TYPES = {
  WORKFLOW_SIMULATION: 'workflow-simulation',
  AGENT_DISPATCH: 'agent-dispatch',
  COMMUNICATION: 'communication',
  PROJECT_SETUP: 'project-setup',
  QUALITY_GATES: 'quality-gates',
  TROUBLESHOOTING: 'troubleshooting',
} as const;

// Helper functions for education system
export const getBMadSkillDisplayName = (skill: BMadSkill): string => {
  switch (skill) {
    case BMadSkill.ProjectSetup: return 'Project Setup';
    case BMadSkill.WorkflowManagement: return 'Workflow Management';
    case BMadSkill.AgentCoordination: return 'Agent Coordination';
    case BMadSkill.Communication: return 'Communication';
    case BMadSkill.QualityAssurance: return 'Quality Assurance';
    case BMadSkill.ProblemSolving: return 'Problem Solving';
    case BMadSkill.ProcessOptimization: return 'Process Optimization';
    case BMadSkill.TeamLeadership: return 'Team Leadership';
  }
};

export const getBMadSkillIcon = (skill: BMadSkill): string => {
  switch (skill) {
    case BMadSkill.ProjectSetup: return '🎯';
    case BMadSkill.WorkflowManagement: return '⚡';
    case BMadSkill.AgentCoordination: return '🤝';
    case BMadSkill.Communication: return '💬';
    case BMadSkill.QualityAssurance: return '✅';
    case BMadSkill.ProblemSolving: return '🧩';
    case BMadSkill.ProcessOptimization: return '🔧';
    case BMadSkill.TeamLeadership: return '👑';
  }
};

export const getAchievementRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800';
    case 'uncommon': return 'bg-green-100 text-green-800';
    case 'rare': return 'bg-blue-100 text-blue-800';
    case 'legendary': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};