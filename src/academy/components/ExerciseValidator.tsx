import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Target,
  Award,
  RefreshCw,
  Lightbulb,
  Code,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExerciseValidatorProps {
  exercise: Exercise;
  userCode: string;
  onValidationComplete?: (result: ValidationResult) => void;
  onRetry?: () => void;
  className?: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  testCases: TestCase[];
  hints?: string[];
  timeLimit?: number; // in seconds
  xpReward: number;
}

interface TestCase {
  id: string;
  description: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean; // Some test cases are hidden from students
  weight?: number; // Relative importance of this test case
}

interface ValidationResult {
  success: boolean;
  score: number; // 0-100
  passedTests: number;
  totalTests: number;
  testResults: TestResult[];
  feedback: string;
  hints?: string[];
  executionTime: number;
  xpAwarded: number;
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: any;
  error?: string;
  executionTime: number;
}

/**
 * Comprehensive exercise validation system with test execution and feedback
 */
export const ExerciseValidator: React.FC<ExerciseValidatorProps> = ({
  exercise,
  userCode,
  onValidationComplete,
  onRetry,
  className
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [showHints, setShowHints] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Start timer when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const executeCode = async (code: string, input: any): Promise<{ output: any; error?: string; executionTime: number }> => {
    // Simulate code execution - in a real implementation this would run in a sandboxed environment
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      setTimeout(() => {
        try {
          // Mock execution logic - replace with actual code execution
          const executionTime = Date.now() - startTime;
          
          // Simple simulation - in practice this would be much more sophisticated
          if (code.includes('function') && code.includes('return')) {
            resolve({
              output: `Mock output for input: ${JSON.stringify(input)}`,
              executionTime
            });
          } else {
            resolve({
              output: null,
              error: 'Function not properly defined',
              executionTime
            });
          }
        } catch (error) {
          resolve({
            output: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: Date.now() - startTime
          });
        }
      }, Math.random() * 500 + 100); // Simulate execution time
    });
  };

  const validateExercise = async () => {
    if (!userCode.trim()) {
      return;
    }

    setIsValidating(true);
    setCurrentTestIndex(0);
    setValidationResult(null);

    const testResults: TestResult[] = [];
    let passedTests = 0;
    const totalExecutionTime = Date.now();

    try {
      // Run all test cases
      for (let i = 0; i < exercise.testCases.length; i++) {
        const testCase = exercise.testCases[i];
        setCurrentTestIndex(i);

        const execution = await executeCode(userCode, testCase.input);
        
        const passed = !execution.error && execution.output === testCase.expectedOutput;
        if (passed) passedTests++;

        testResults.push({
          testCase,
          passed,
          actualOutput: execution.output,
          error: execution.error,
          executionTime: execution.executionTime
        });

        // Add delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const score = Math.round((passedTests / exercise.testCases.length) * 100);
      const totalTime = Date.now() - totalExecutionTime;
      
      // Calculate XP based on score, difficulty, and time
      let xpMultiplier = 1;
      if (exercise.difficulty === 'intermediate') xpMultiplier = 1.5;
      if (exercise.difficulty === 'advanced') xpMultiplier = 2;
      
      // Time bonus (if completed within time limit)
      if (exercise.timeLimit && timeElapsed <= exercise.timeLimit) {
        xpMultiplier *= 1.2;
      }

      const xpAwarded = Math.round(exercise.xpReward * (score / 100) * xpMultiplier);

      const result: ValidationResult = {
        success: passedTests === exercise.testCases.length,
        score,
        passedTests,
        totalTests: exercise.testCases.length,
        testResults,
        feedback: generateFeedback(score, passedTests, exercise.testCases.length),
        hints: score < 50 ? exercise.hints : undefined,
        executionTime: totalTime,
        xpAwarded
      };

      setValidationResult(result);
      onValidationComplete?.(result);

    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
      setCurrentTestIndex(-1);
    }
  };

  const generateFeedback = (score: number, passed: number, total: number): string => {
    if (score === 100) {
      return "🎉 Perfect! You've completed all test cases successfully!";
    } else if (score >= 80) {
      return `Great job! You passed ${passed} out of ${total} tests. Just a few tweaks needed.`;
    } else if (score >= 60) {
      return `Good progress! You passed ${passed} out of ${total} tests. Review the failing cases and try again.`;
    } else if (score >= 40) {
      return `You're on the right track! ${passed} out of ${total} tests passed. Consider checking the hints.`;
    } else {
      return `Keep trying! Only ${passed} out of ${total} tests passed. Review the problem description and consider using the hints.`;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Exercise Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{exercise.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
              <Badge variant="outline">
                <Code className="h-3 w-3 mr-1" />
                {exercise.language}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {exercise.testCases.length} test cases
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {exercise.xpReward} XP
              </div>
              {exercise.timeLimit && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time limit: {exercise.timeLimit}s
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Time: {formatTime(timeElapsed)}
              </div>
              {exercise.timeLimit && (
                <div className={cn(
                  "text-sm",
                  timeElapsed > exercise.timeLimit ? "text-red-600" : "text-green-600"
                )}>
                  {timeElapsed > exercise.timeLimit ? "Overtime" : "On time"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={validateExercise}
          disabled={isValidating || !userCode.trim()}
          className="gap-2"
        >
          {isValidating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Tests
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {exercise.hints && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              {showHints ? 'Hide' : 'Show'} Hints
            </Button>
          )}
          
          {validationResult && !validationResult.success && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>

      {/* Hints */}
      <AnimatePresence>
        {showHints && exercise.hints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Hints</span>
                </div>
                <ul className="space-y-2">
                  {exercise.hints.map((hint, index) => (
                    <li key={index} className="text-sm text-blue-700">
                      • {hint}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Progress */}
      <AnimatePresence>
        {isValidating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">Running test cases...</span>
                </div>
                <Progress 
                  value={currentTestIndex >= 0 ? ((currentTestIndex + 1) / exercise.testCases.length) * 100 : 0} 
                  className="mb-2"
                />
                <div className="text-xs text-muted-foreground">
                  {currentTestIndex >= 0 && `Testing case ${currentTestIndex + 1} of ${exercise.testCases.length}`}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Results */}
      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={cn(
              "border-2",
              validationResult.success 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            )}>
              <CardContent className="p-4">
                {/* Result Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {validationResult.success ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <div className={cn(
                        "text-lg font-semibold",
                        validationResult.success ? "text-green-800" : "text-red-800"
                      )}>
                        {validationResult.success ? "All Tests Passed!" : "Some Tests Failed"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score: {validationResult.score}% ({validationResult.passedTests}/{validationResult.totalTests} tests)
                      </div>
                    </div>
                  </div>
                  
                  {validationResult.xpAwarded > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        +{validationResult.xpAwarded} XP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed in {Math.round(validationResult.executionTime)}ms
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="p-3 rounded-lg bg-white border mb-4">
                  <p className="text-sm">{validationResult.feedback}</p>
                </div>

                {/* Test Results */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Test Results:</div>
                  {validationResult.testResults.map((result, index) => (
                    <div 
                      key={result.testCase.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        result.passed 
                          ? "bg-green-50 border-green-200" 
                          : "bg-red-50 border-red-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            Test {index + 1}: {result.testCase.description}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.executionTime}ms
                        </div>
                      </div>
                      
                      {!result.passed && (
                        <div className="ml-6 space-y-1 text-xs">
                          <div>
                            <span className="font-medium">Expected:</span> {JSON.stringify(result.testCase.expectedOutput)}
                          </div>
                          <div>
                            <span className="font-medium">Actual:</span> {JSON.stringify(result.actualOutput)}
                          </div>
                          {result.error && (
                            <div className="text-red-600">
                              <span className="font-medium">Error:</span> {result.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Additional Hints for Failed Tests */}
                {validationResult.hints && validationResult.hints.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Suggestions</span>
                    </div>
                    <ul className="space-y-1">
                      {validationResult.hints.map((hint, index) => (
                        <li key={index} className="text-sm text-yellow-700">
                          • {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};