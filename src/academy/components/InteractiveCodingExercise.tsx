import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Play, 
  CheckCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodePlayground } from './CodePlayground';
import { ExerciseValidator } from './ExerciseValidator';
import { cn } from '@/lib/utils';

interface InteractiveCodingExerciseProps {
  lesson: CodingLesson;
  onComplete?: (result: CompletionResult) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

interface CodingLesson {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  theory: string; // Markdown content
  starterCode: string;
  language: 'javascript' | 'typescript' | 'python' | 'rust';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercise: Exercise;
  estimatedTime: number; // in minutes
  prerequisites?: string[];
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  testCases: TestCase[];
  hints?: string[];
  timeLimit?: number;
  xpReward: number;
}

interface TestCase {
  id: string;
  description: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean;
  weight?: number;
}

interface CompletionResult {
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  xpEarned: number;
  attempts: number;
}

interface ValidationResult {
  success: boolean;
  score: number;
  passedTests: number;
  totalTests: number;
  testResults: any[];
  feedback: string;
  hints?: string[];
  executionTime: number;
  xpAwarded: number;
}

/**
 * Complete interactive coding exercise with theory, practice, and validation
 */
export const InteractiveCodingExercise: React.FC<InteractiveCodingExerciseProps> = ({
  lesson,
  onComplete,
  onNext,
  onPrevious,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');
  const [userCode, setUserCode] = useState(lesson.starterCode);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const handleCodeChange = useCallback((code: string) => {
    setUserCode(code);
  }, []);

  const handleCodeExecution = useCallback(async (code: string) => {
    // Mock code execution - in production this would run in a sandboxed environment
    return new Promise<{ success: boolean; output: string; error?: string; executionTime: number }>((resolve) => {
      setTimeout(() => {
        try {
          // Simple simulation
          if (code.includes('function') || code.includes('def ') || code.includes('fn ')) {
            resolve({
              success: true,
              output: 'Code executed successfully!\nOutput: [Mock execution result]',
              executionTime: Math.random() * 100 + 50
            });
          } else {
            resolve({
              success: false,
              output: '',
              error: 'No function definition found',
              executionTime: 25
            });
          }
        } catch (error) {
          resolve({
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: 10
          });
        }
      }, Math.random() * 500 + 100);
    });
  }, []);

  const handleValidationComplete = useCallback((result: ValidationResult) => {
    setValidationResult(result);
    setAttempts(prev => prev + 1);

    if (result.success && !isCompleted) {
      setIsCompleted(true);
      
      const completionResult: CompletionResult = {
        lessonId: lesson.id,
        completed: true,
        score: result.score,
        timeSpent: Math.round((Date.now() - startTime) / 1000 / 60), // in minutes
        xpEarned: result.xpAwarded,
        attempts: attempts + 1
      };

      onComplete?.(completionResult);
    }
  }, [lesson.id, startTime, attempts, isCompleted, onComplete]);

  const handleRetry = useCallback(() => {
    setValidationResult(null);
    setActiveTab('practice');
  }, []);

  const handleReset = useCallback(() => {
    setUserCode(lesson.starterCode);
    setValidationResult(null);
    setIsCompleted(false);
    setAttempts(0);
  }, [lesson.starterCode]);

  const renderTheory = () => (
    <div className="space-y-6">
      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Learning Objectives
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lesson.learningObjectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Prerequisites</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lesson.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="outline">
                  {prereq}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theory Content */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Theory
          </h3>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {/* In a real implementation, this would render markdown */}
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: lesson.theory }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ready to Practice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-green-800">Ready to Practice?</h4>
              <p className="text-sm text-green-700">
                Now that you've learned the theory, let's put it into practice!
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('practice')}
              className="gap-2"
              size="lg"
            >
              <Code className="h-4 w-4" />
              Start Coding
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPractice = () => (
    <div className="space-y-6">
      {/* Exercise Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              Coding Exercise: {lesson.exercise.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {lesson.language.toUpperCase()}
              </Badge>
              <Badge className={cn(
                lesson.difficulty === 'beginner' && 'bg-green-100 text-green-800',
                lesson.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-800',
                lesson.difficulty === 'advanced' && 'bg-red-100 text-red-800'
              )}>
                {lesson.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {lesson.exercise.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>⏱️ Est. time: {lesson.estimatedTime} min</span>
            <span>🎯 {lesson.exercise.testCases.length} test cases</span>
            <span>⭐ {lesson.exercise.xpReward} XP</span>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <CodePlayground
        initialCode={userCode}
        language={lesson.language}
        onCodeChange={handleCodeChange}
        onExecute={handleCodeExecution}
        className="min-h-[400px]"
      />

      {/* Exercise Validator */}
      <ExerciseValidator
        exercise={lesson.exercise}
        userCode={userCode}
        onValidationComplete={handleValidationComplete}
        onRetry={handleRetry}
      />

      {/* Success State */}
      {isCompleted && validationResult?.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-2xl font-bold text-green-800">Congratulations!</h3>
                  <p className="text-green-700">
                    You've successfully completed this coding exercise!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-800">Score</div>
                    <div className="text-lg font-bold text-green-600">{validationResult.score}%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-800">XP Earned</div>
                    <div className="text-lg font-bold text-purple-600">+{validationResult.xpAwarded}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-800">Attempts</div>
                    <div className="text-lg font-bold text-blue-600">{attempts}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          )}
          <Badge variant="outline">
            {lesson.language.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="theory" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Theory
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2">
            <Code className="h-4 w-4" />
            Practice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theory" className="mt-6">
          {renderTheory()}
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          {renderPractice()}
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'theory' && (
            <Button onClick={() => setActiveTab('practice')} className="gap-2">
              Start Coding
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          
          {isCompleted && onNext && (
            <Button onClick={onNext} className="gap-2">
              Next Lesson
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};