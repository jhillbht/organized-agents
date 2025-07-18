import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BookOpen,
  Code,
  Users,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  BMadExercise, 
  TutorialResults, 
  TutorialError,
  BMadLearningProgress 
} from '@/types/bmad-education';
import { BMadProject } from '@/types/bmad';
import { BMadEducationAPI } from '@/lib/bmad-education-api';

interface BMadExerciseRunnerProps {
  exercise: BMadExercise;
  currentProject?: BMadProject;
  userProgress: BMadLearningProgress;
  onComplete: (results: TutorialResults) => void;
  onExit: () => void;
  className?: string;
}

interface ExerciseSession {
  startTime: Date;
  currentStep: number;
  hintsUsed: number;
  errors: TutorialError[];
  userActions: string[];
  isCompleted: boolean;
}

/**
 * BMadExerciseRunner - Executes BMAD exercises with real project integration
 */
export const BMadExerciseRunner: React.FC<BMadExerciseRunnerProps> = ({
  exercise,
  currentProject,
  userProgress,
  onComplete,
  onExit,
  className
}) => {
  const [session, setSession] = useState<ExerciseSession>({
    startTime: new Date(),
    currentStep: 0,
    hintsUsed: 0,
    errors: [],
    userActions: [],
    isCompleted: false
  });
  const [showHint, setShowHint] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const progressPercentage = (session.currentStep / exercise.instructions.length) * 100;

  useEffect(() => {
    // Initialize exercise based on type and project availability
    if (exercise.realProjectRequired && !currentProject) {
      toast({
        title: "Project Required",
        description: "This exercise requires an active BMAD project to complete",
        variant: "destructive"
      });
    }
  }, [exercise, currentProject]);

  const handleStepComplete = async () => {
    setIsValidating(true);
    
    try {
      // Validate step completion based on exercise type
      const stepValid = await validateExerciseStep(
        exercise.type,
        session.currentStep,
        userInput,
        currentProject
      );

      if (stepValid.success) {
        const newStep = session.currentStep + 1;
        
        if (newStep >= exercise.instructions.length) {
          // Exercise completed
          await handleExerciseComplete();
        } else {
          // Move to next step
          setSession(prev => ({
            ...prev,
            currentStep: newStep,
            userActions: [...prev.userActions, userInput]
          }));
          setUserInput('');
          setValidationResult(null);
        }
      } else {
        // Step failed validation
        const error: TutorialError = {
          step: session.currentStep,
          error: stepValid.message,
          correction: stepValid.suggestion || '',
          timestamp: new Date().toISOString()
        };

        setSession(prev => ({
          ...prev,
          errors: [...prev.errors, error]
        }));

        setValidationResult({
          success: false,
          message: stepValid.message
        });
      }
    } catch (error) {
      console.error('Exercise validation failed:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate exercise step. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExerciseComplete = async () => {
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);
    const score = calculateExerciseScore();

    const results: TutorialResults = {
      exerciseId: exercise.id,
      completed: true,
      score,
      timeSpent,
      hintsUsed: session.hintsUsed,
      errors: session.errors,
      feedback: generateFeedback(score, session.errors.length, session.hintsUsed)
    };

    setSession(prev => ({ ...prev, isCompleted: true }));

    try {
      await BMadEducationAPI.completeBMadExercise(exercise.id, results);
      onComplete(results);
    } catch (error) {
      console.error('Failed to save exercise completion:', error);
      // Still call onComplete to update UI
      onComplete(results);
    }
  };

  const calculateExerciseScore = (): number => {
    const baseScore = 100;
    const errorPenalty = session.errors.length * 10;
    const hintPenalty = session.hintsUsed * 5;
    const timePenalty = Math.max(0, 
      Math.round((new Date().getTime() - session.startTime.getTime()) / 60000) - exercise.estimatedTime
    ) * 2;

    return Math.max(0, baseScore - errorPenalty - hintPenalty - timePenalty);
  };

  const generateFeedback = (score: number, errors: number, hints: number): string => {
    if (score >= 90) {
      return "Excellent work! You've mastered this BMAD concept with minimal assistance.";
    } else if (score >= 75) {
      return "Good job! You understand the core concepts. Consider reviewing areas where you needed hints.";
    } else if (score >= 60) {
      return "You're making progress! Focus on understanding the methodology better and practice more.";
    } else {
      return "Keep learning! This is a complex topic. Review the lesson content and try similar exercises.";
    }
  };

  const useHint = () => {
    setSession(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    setShowHint(true);
    
    toast({
      title: "Hint Used",
      description: "Hint usage affects your final score",
      variant: "default"
    });
  };

  const resetExercise = () => {
    setSession({
      startTime: new Date(),
      currentStep: 0,
      hintsUsed: 0,
      errors: [],
      userActions: [],
      isCompleted: false
    });
    setUserInput('');
    setValidationResult(null);
    setShowHint(false);
  };

  const getCurrentInstruction = () => {
    return exercise.instructions[session.currentStep] || '';
  };

  const getCurrentCompletionCriteria = () => {
    return exercise.completionCriteria[session.currentStep] || 
           exercise.completionCriteria[0] || 
           'Complete the current step';
  };

  const getCurrentHint = () => {
    return exercise.hints[session.currentStep] || 
           exercise.hints[0] || 
           'Follow the instructions carefully and use BMAD methodology principles';
  };

  const getExerciseIcon = () => {
    switch (exercise.type) {
      case 'workflow-simulation':
        return <Target className="h-5 w-5" />;
      case 'agent-dispatch':
        return <Users className="h-5 w-5" />;
      case 'communication':
        return <BookOpen className="h-5 w-5" />;
      case 'project-setup':
        return <Code className="h-5 w-5" />;
      case 'quality-gates':
        return <CheckCircle className="h-5 w-5" />;
      case 'troubleshooting':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (session.isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("space-y-6", className)}
      >
        <Card>
          <CardContent className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Exercise Completed!</h3>
            <p className="text-gray-600 mb-4">
              You've successfully completed the {exercise.title} exercise
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={onExit}>
                Continue Learning
              </Button>
              <Button variant="outline" onClick={resetExercise}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getExerciseIcon()}
              <div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                <p className="text-gray-600">{exercise.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor()}>
                {exercise.difficulty}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {exercise.estimatedTime}m
              </Badge>
              {exercise.realProjectRequired && (
                <Badge variant="secondary">
                  <Code className="h-3 w-3 mr-1" />
                  Project
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {session.currentStep + 1} of {exercise.instructions.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Step {session.currentStep + 1}: Current Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <p className="text-gray-700">{getCurrentInstruction()}</p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium mb-2">Success Criteria:</h4>
            <p className="text-gray-700">{getCurrentCompletionCriteria()}</p>
          </div>

          {/* Project Context */}
          {currentProject && exercise.realProjectRequired && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium mb-2">Project Context:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Project:</strong> {currentProject.name}</p>
                <p><strong>Phase:</strong> {currentProject.state.currentPhase}</p>
                {currentProject.state.activeStory && (
                  <p><strong>Active Story:</strong> {currentProject.state.activeStory}</p>
                )}
              </div>
            </div>
          )}

          {/* User Input Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Your Response/Action:
            </label>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe what you did or provide your answer..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Validation Result */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-3 rounded-lg border",
                  validationResult.success 
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                )}
              >
                <div className="flex items-center space-x-2">
                  {validationResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{validationResult.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint Section */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Hint:</h4>
                    <p className="text-sm text-yellow-700">{getCurrentHint()}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={useHint}
                disabled={showHint}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({session.hintsUsed} used)
              </Button>
              <Button variant="outline" size="sm" onClick={onExit}>
                Exit Exercise
              </Button>
            </div>
            
            <Button 
              onClick={handleStepComplete}
              disabled={!userInput.trim() || isValidating}
            >
              {isValidating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {session.currentStep === exercise.instructions.length - 1 ? 'Complete' : 'Next Step'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{session.hintsUsed}</p>
              <p className="text-xs text-gray-600">Hints Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{session.errors.length}</p>
              <p className="text-xs text-gray-600">Errors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((Date.now() - session.startTime.getTime()) / 60000)}
              </p>
              <p className="text-xs text-gray-600">Minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Validate exercise step completion based on type and context
 */
async function validateExerciseStep(
  exerciseType: string,
  stepIndex: number,
  userInput: string,
  project?: BMadProject
): Promise<{ success: boolean; message: string; suggestion?: string }> {
  // Basic validation - ensure user provided input
  if (!userInput.trim()) {
    return {
      success: false,
      message: "Please provide a response before continuing",
      suggestion: "Describe what you did or provide your answer"
    };
  }

  // Exercise-type specific validation
  switch (exerciseType) {
    case 'workflow-simulation':
      return validateWorkflowStep(stepIndex, userInput, project);
    case 'agent-dispatch':
      return validateAgentDispatchStep(stepIndex, userInput, project);
    case 'project-setup':
      return validateProjectSetupStep(stepIndex, userInput);
    case 'communication':
      return validateCommunicationStep(stepIndex, userInput);
    case 'quality-gates':
      return validateQualityGatesStep(stepIndex, userInput);
    default:
      return { success: true, message: "Step completed successfully" };
  }
}

function validateWorkflowStep(stepIndex: number, userInput: string, project?: BMadProject) {
  // Check for BMAD workflow concepts
  const workflowTerms = ['planning', 'story', 'development', 'qa', 'complete', 'phase', 'transition'];
  const hasWorkflowTerms = workflowTerms.some(term => 
    userInput.toLowerCase().includes(term)
  );

  if (!hasWorkflowTerms) {
    return {
      success: false,
      message: "Your response should reference BMAD workflow concepts",
      suggestion: "Mention phases, transitions, or workflow elements"
    };
  }

  return { success: true, message: "Good understanding of workflow concepts!" };
}

function validateAgentDispatchStep(stepIndex: number, userInput: string, project?: BMadProject) {
  // Check for agent-related terms
  const agentTerms = ['agent', 'dispatch', 'orchestrator', 'handoff', 'coordination'];
  const hasAgentTerms = agentTerms.some(term => 
    userInput.toLowerCase().includes(term)
  );

  if (!hasAgentTerms) {
    return {
      success: false,
      message: "Your response should discuss agent coordination concepts",
      suggestion: "Mention agents, dispatch, or coordination strategies"
    };
  }

  return { success: true, message: "Excellent agent coordination understanding!" };
}

function validateProjectSetupStep(stepIndex: number, userInput: string) {
  // Check for setup-related terms
  const setupTerms = ['project', 'setup', 'configuration', 'bmad', 'directory', 'structure'];
  const hasSetupTerms = setupTerms.some(term => 
    userInput.toLowerCase().includes(term)
  );

  if (!hasSetupTerms) {
    return {
      success: false,
      message: "Your response should reference project setup concepts",
      suggestion: "Discuss project structure, configuration, or setup steps"
    };
  }

  return { success: true, message: "Great understanding of project setup!" };
}

function validateCommunicationStep(stepIndex: number, userInput: string) {
  // Check for communication terms
  const commTerms = ['message', 'communication', 'handoff', 'update', 'status', 'team'];
  const hasCommTerms = commTerms.some(term => 
    userInput.toLowerCase().includes(term)
  );

  if (!hasCommTerms) {
    return {
      success: false,
      message: "Your response should address communication aspects",
      suggestion: "Discuss messages, updates, or team communication"
    };
  }

  return { success: true, message: "Strong communication skills demonstrated!" };
}

function validateQualityGatesStep(stepIndex: number, userInput: string) {
  // Check for quality terms
  const qualityTerms = ['quality', 'test', 'review', 'gate', 'standards', 'validation'];
  const hasQualityTerms = qualityTerms.some(term => 
    userInput.toLowerCase().includes(term)
  );

  if (!hasQualityTerms) {
    return {
      success: false,
      message: "Your response should discuss quality assurance concepts",
      suggestion: "Mention testing, reviews, or quality standards"
    };
  }

  return { success: true, message: "Excellent quality awareness!" };
}