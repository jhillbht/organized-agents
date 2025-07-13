// Academy Type Definitions

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number; // in minutes
  prerequisites: string[];
  tags: string[];
  orderIndex: number;
  isActive: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  orderIndex: number;
  estimatedDuration: number; // in minutes
  objectives: string[];
  prerequisites: string[];
  resources: LessonResource[];
  exercises: Exercise[];
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResource {
  id: string;
  type: 'link' | 'video' | 'document' | 'code';
  title: string;
  url: string;
  description?: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  orderIndex: number;
  language: string;
  timeLimit?: number; // in seconds
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden: boolean;
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completedAt?: string;
  score: number;
  timeSpent: number; // in seconds
  lastAccessedAt: string;
  exercisesCompleted: string[];
  exerciseScores: Record<string, number>;
}

export interface UserExerciseSubmission {
  id: string;
  userId: string;
  exerciseId: string;
  lessonId: string;
  submission: string;
  isCorrect: boolean;
  score: number;
  feedback?: string;
  hintsUsed: number;
  attemptNumber: number;
  timeSpent: number; // in seconds
  submittedAt: string;
}

export interface UserStats {
  userId: string;
  totalExperience: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  totalTimeSpent: number; // in seconds
  averageScore: number;
  lastActivityAt: string;
  achievementsUnlocked: string[];
  favoriteTopics: string[];
  skillLevels: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: AchievementCriteria;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface AchievementCriteria {
  type: 'lessons_completed' | 'exercises_completed' | 'streak_days' | 'total_xp' | 'perfect_scores' | 'time_spent' | 'modules_completed';
  value: number;
  additionalConditions?: Record<string, any>;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: string[]; // module IDs in order
  targetAudience: string;
  estimatedDuration: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  certificateAvailable: boolean;
}

export interface Certificate {
  id: string;
  userId: string;
  pathId: string;
  issuedAt: string;
  certificateUrl: string;
  verificationCode: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Component Props Types
export interface LessonViewerProps {
  lessonId: string;
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

export interface ExerciseValidatorProps {
  exercise: Exercise;
  onSubmit: (submission: string, isCorrect: boolean, score: number) => void;
  onHintRequest?: () => void;
}

export interface ProgressDashboardProps {
  userId?: string;
  onNavigateToLesson?: (lessonId: string) => void;
}

export interface ModuleBrowserProps {
  onSelectModule?: (module: LearningModule) => void;
  filterByCategory?: string;
  filterByDifficulty?: string;
}

// State Management Types
export interface AcademyState {
  currentUser: UserStats | null;
  currentLesson: Lesson | null;
  currentModule: LearningModule | null;
  modules: LearningModule[];
  lessons: Lesson[];
  achievements: Achievement[];
  userProgress: Record<string, UserLessonProgress>;
  isLoading: boolean;
  error: string | null;
}

// Utility Types
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';
export type ExerciseLanguage = 'javascript' | 'typescript' | 'python' | 'rust' | 'go' | 'java';
export type ResourceType = 'link' | 'video' | 'document' | 'code';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';