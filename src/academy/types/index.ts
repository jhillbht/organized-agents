// Academy Types and Interfaces

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objectives: string[];
  content: LessonContent;
  exercises: Exercise[];
  prerequisites: string[];
  nextLesson?: string;
  tags: string[];
}

export interface LessonContent {
  sections: ContentSection[];
  codeExamples: CodeExample[];
  resources: Resource[];
}

export interface ContentSection {
  id: string;
  type: 'text' | 'code' | 'video' | 'interactive';
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
  runnable: boolean;
}

export interface Exercise {
  id: string;
  type: 'code' | 'quiz' | 'fill-in' | 'drag-drop' | 'agent-config';
  title: string;
  description: string;
  difficulty: number; // 1-5
  points: number;
  content: ExerciseContent;
  validation: ValidationRule[];
  hints: string[];
  solution?: string;
}

export type ExerciseContent = 
  | CodeExerciseContent
  | QuizExerciseContent
  | FillInExerciseContent
  | DragDropExerciseContent
  | AgentConfigExerciseContent;

export interface CodeExerciseContent {
  type: 'code';
  starterCode: string;
  language: string;
  testCases: TestCase[];
  expectedOutput?: string;
}

export interface QuizExerciseContent {
  type: 'quiz';
  question: string;
  options: QuizOption[];
  multipleChoice: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface FillInExerciseContent {
  type: 'fill-in';
  template: string; // Contains {{blank}} placeholders
  blanks: FillInBlank[];
}

export interface FillInBlank {
  id: string;
  answer: string;
  alternatives?: string[];
}

export interface DragDropExerciseContent {
  type: 'drag-drop';
  items: DragItem[];
  targets: DropTarget[];
  correctMapping: Record<string, string>;
}

export interface DragItem {
  id: string;
  content: string;
  type: string;
}

export interface DropTarget {
  id: string;
  label: string;
  accepts: string[];
}

export interface AgentConfigExerciseContent {
  type: 'agent-config';
  scenario: string;
  availableAgents: string[];
  goalDescription: string;
  validationCriteria: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  hidden: boolean;
}

export interface ValidationRule {
  type: 'exact' | 'contains' | 'regex' | 'custom';
  value: string;
  message: string;
}

export interface Resource {
  id: string;
  type: 'documentation' | 'video' | 'article' | 'tool';
  title: string;
  url: string;
  description?: string;
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  progressPercentage: number;
  exercisesCompleted: string[];
  score: number;
  timeSpent: number; // in seconds
  attempts: number;
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
  submittedAt: Date;
  timeSpent: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'lesson' | 'exercise' | 'streak' | 'mastery' | 'special';
  requirement: AchievementRequirement;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'lessons_completed' | 'exercises_solved' | 'perfect_score' | 'streak_days' | 'custom';
  value: number;
  metadata?: Record<string, any>;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: LearningModule[];
  estimatedDuration: number; // in hours
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  lessons: string[]; // Lesson IDs
  order: number;
  icon: string;
}

export interface UserStats {
  userId: string;
  totalLessonsCompleted: number;
  totalExercisesSolved: number;
  totalPoints: number;
  totalTimeSpent: number; // in seconds
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
  achievementsUnlocked: number;
  averageScore: number;
}