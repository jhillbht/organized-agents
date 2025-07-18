import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2,
  Layers,
  Target,
  Users,
  MessageSquare,
  CheckCircle,
  Book,
  PlayCircle,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  BMadLesson, 
  BMadExercise, 
  BMadLearningProgress,
  TutorialResults
} from '@/types/bmad-education';
import { BMadProject, BMadPhase } from '@/types/bmad';
import { BMadEducationAPI } from '@/lib/bmad-education-api';
import { BMadExerciseRunner } from './BMadExerciseRunner';

interface ProjectBasedLearningProps {
  currentProject: BMadProject;
  userProgress: BMadLearningProgress;
  onLessonComplete: (lessonId: string) => void;
  onClose: () => void;
  className?: string;
}

interface LearningOpportunity {
  type: 'lesson' | 'exercise' | 'challenge';
  id: string;
  title: string;
  description: string;
  relevance: number; // 0-100
  estimatedTime: number;
  difficulty: string;
  phase?: BMadPhase;
  prerequisites: string[];
  projectSpecific: boolean;
}

/**
 * ProjectBasedLearning - Integrates BMAD education with real project work
 */
export const ProjectBasedLearning: React.FC<ProjectBasedLearningProps> = ({
  currentProject,
  userProgress,
  onLessonComplete,
  onClose,
  className
}) => {
  const [opportunities, setOpportunities] = useState<LearningOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LearningOpportunity | null>(null);
  const [currentExercise, setCurrentExercise] = useState<BMadExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectLessons, setProjectLessons] = useState<BMadLesson[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProjectBasedOpportunities();
  }, [currentProject, userProgress]);

  const loadProjectBasedOpportunities = async () => {
    try {
      setLoading(true);
      
      // Get lessons relevant to current project phase
      const phaseRelevantLessons = await BMadEducationAPI.getLessonsForPhase(
        currentProject.state.currentPhase
      );
      setProjectLessons(phaseRelevantLessons);

      // Generate learning opportunities based on project state
      const generatedOpportunities = await generateProjectOpportunities(
        currentProject,
        userProgress,
        phaseRelevantLessons
      );
      
      setOpportunities(generatedOpportunities);
    } catch (error) {
      console.error('Failed to load project-based opportunities:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load learning opportunities for this project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOpportunity = async (opportunity: LearningOpportunity) => {
    setSelectedOpportunity(opportunity);

    if (opportunity.type === 'exercise') {
      try {
        // Create project-specific exercise
        const exercise = await BMadEducationAPI.createProjectBasedExercise(
          currentProject,
          opportunity.id
        );
        setCurrentExercise(exercise);
      } catch (error) {
        console.error('Failed to create project exercise:', error);
        toast({
          title: "Exercise Creation Failed",
          description: "Could not create project-specific exercise",
          variant: "destructive"
        });
      }
    }
  };

  const handleExerciseComplete = async (results: TutorialResults) => {
    if (selectedOpportunity) {
      // Update learning progress
      onLessonComplete(selectedOpportunity.id);
      
      // Show completion feedback
      toast({
        title: "Exercise Completed!",
        description: `You scored ${results.score}% on the ${selectedOpportunity.title} exercise`,
        variant: "default"
      });

      // Return to opportunities view
      setSelectedOpportunity(null);
      setCurrentExercise(null);
      
      // Reload opportunities to reflect progress
      await loadProjectBasedOpportunities();
    }
  };

  const getPhaseIcon = (phase: BMadPhase) => {
    switch (phase) {
      case BMadPhase.Planning:
        return <Target className="h-4 w-4" />;
      case BMadPhase.StoryCreation:
        return <Book className="h-4 w-4" />;
      case BMadPhase.Development:
        return <Code2 className="h-4 w-4" />;
      case BMadPhase.QualityAssurance:
        return <CheckCircle className="h-4 w-4" />;
      case BMadPhase.Complete:
        return <Star className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (relevance >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (relevance >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If currently doing an exercise, show the exercise runner
  if (currentExercise && selectedOpportunity) {
    return (
      <BMadExerciseRunner
        exercise={currentExercise}
        currentProject={currentProject}
        userProgress={userProgress}
        onComplete={handleExerciseComplete}
        onExit={() => {
          setSelectedOpportunity(null);
          setCurrentExercise(null);
        }}
        className={className}
      />
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Project-Based Learning</CardTitle>
                <p className="text-gray-600">
                  Learn BMAD concepts through your actual project: <strong>{currentProject.name}</strong>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Project Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Layers className="h-5 w-5" />
            <span>Current Project Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {getPhaseIcon(currentProject.state.currentPhase)}
                <span className="font-medium">Current Phase:</span>
                <Badge variant="secondary">{currentProject.state.currentPhase}</Badge>
              </div>
              {currentProject.state.activeStory && (
                <div className="flex items-center space-x-2">
                  <Book className="h-4 w-4" />
                  <span className="font-medium">Active Story:</span>
                  <span className="text-sm">{currentProject.state.activeStory}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Team Size:</span>
                <span className="text-sm">{Object.keys(currentProject.state.agents).length} agents</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Progress:</span>
                <Progress 
                  value={(currentProject.state.totalStories > 0 ? 
                    (currentProject.state.completedStories / currentProject.state.totalStories) * 100 : 0)} 
                  className="flex-1" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Recent Activity:</span>
                <span className="text-sm text-green-600">Active development</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Learning Opportunities</span>
            <Badge variant="secondary">{opportunities.length} available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Learning Opportunities</h3>
              <p className="text-gray-500">
                All relevant lessons for the current project phase have been completed.
                Great work!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {opportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Opportunity Icon */}
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            {opportunity.type === 'lesson' && <Book className="h-5 w-5 text-blue-600" />}
                            {opportunity.type === 'exercise' && <PlayCircle className="h-5 w-5 text-blue-600" />}
                            {opportunity.type === 'challenge' && <Target className="h-5 w-5 text-blue-600" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-lg">{opportunity.title}</h4>
                              <Badge className={getRelevanceColor(opportunity.relevance)}>
                                {opportunity.relevance}% relevant
                              </Badge>
                              <Badge className={getDifficultyColor(opportunity.difficulty)}>
                                {opportunity.difficulty}
                              </Badge>
                              {opportunity.projectSpecific && (
                                <Badge variant="outline">
                                  <Code2 className="h-3 w-3 mr-1" />
                                  Project-specific
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">{opportunity.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{opportunity.estimatedTime} min</span>
                              </div>
                              {opportunity.phase && (
                                <div className="flex items-center space-x-1">
                                  {getPhaseIcon(opportunity.phase)}
                                  <span>{opportunity.phase}</span>
                                </div>
                              )}
                              {opportunity.prerequisites.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{opportunity.prerequisites.length} prerequisite(s)</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex-shrink-0">
                            <Button 
                              onClick={() => handleStartOpportunity(opportunity)}
                              className="w-24"
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {userProgress.completedLessons.length}
              </p>
              <p className="text-xs text-gray-600">Lessons Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {userProgress.projectsCompleted}
              </p>
              <p className="text-xs text-gray-600">Projects Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {userProgress.totalWorkflowCycles}
              </p>
              <p className="text-xs text-gray-600">Workflow Cycles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(userProgress.totalLearningTime / 60)}h
              </p>
              <p className="text-xs text-gray-600">Learning Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Generate learning opportunities based on project state and user progress
 */
async function generateProjectOpportunities(
  project: BMadProject,
  userProgress: BMadLearningProgress,
  lessons: BMadLesson[]
): Promise<LearningOpportunity[]> {
  const opportunities: LearningOpportunity[] = [];
  const currentPhase = project.state.currentPhase;

  // Add phase-specific lessons
  const phaseRelevantLessons = lessons.filter(lesson => 
    lesson.phase === currentPhase || lesson.phase === 'general'
  );

  for (const lesson of phaseRelevantLessons) {
    if (!userProgress.completedLessons.includes(lesson.id)) {
      // Check if prerequisites are met
      const prerequisitesMet = lesson.prerequisites.every(prereq =>
        userProgress.completedLessons.includes(prereq)
      );

      if (prerequisitesMet) {
        opportunities.push({
          type: 'lesson',
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          relevance: calculateRelevance(lesson, project),
          estimatedTime: lesson.estimatedDuration,
          difficulty: lesson.difficulty,
          phase: lesson.phase === 'general' ? undefined : lesson.phase as BMadPhase,
          prerequisites: lesson.prerequisites,
          projectSpecific: lesson.realProjectIntegration
        });

        // Add exercises for this lesson
        for (const exercise of lesson.exercises) {
          opportunities.push({
            type: 'exercise',
            id: exercise.id,
            title: exercise.title,
            description: exercise.description,
            relevance: calculateExerciseRelevance(exercise, project),
            estimatedTime: exercise.estimatedTime,
            difficulty: exercise.difficulty,
            prerequisites: [lesson.id],
            projectSpecific: exercise.realProjectRequired
          });
        }
      }
    }
  }

  // Add project-specific challenges based on current state
  if (project.state.currentPhase === BMadPhase.Development && project.state.activeStory) {
    opportunities.push({
      type: 'challenge',
      id: 'active-story-challenge',
      title: 'Active Story Development Challenge',
      description: `Apply BMAD development practices to your current story: ${project.state.activeStory}`,
      relevance: 95,
      estimatedTime: 30,
      difficulty: 'intermediate',
      phase: BMadPhase.Development,
      prerequisites: ['project-setup'],
      projectSpecific: true
    });
  }

  // Sort by relevance (highest first)
  opportunities.sort((a, b) => b.relevance - a.relevance);

  return opportunities.slice(0, 10); // Limit to top 10 opportunities
}

function calculateRelevance(lesson: BMadLesson, project: BMadProject): number {
  let relevance = 50; // Base relevance

  // Phase matching
  if (lesson.phase === project.state.currentPhase) {
    relevance += 30;
  } else if (lesson.phase === 'general') {
    relevance += 15;
  }

  // Project integration bonus
  if (lesson.realProjectIntegration) {
    relevance += 20;
  }

  // Recent activity bonus
  if (project.state.activeStory && lesson.tags.some(tag => 
    ['development', 'story', 'workflow'].includes(tag)
  )) {
    relevance += 15;
  }

  return Math.min(100, relevance);
}

function calculateExerciseRelevance(exercise: BMadExercise, project: BMadProject): number {
  let relevance = 60; // Base relevance for exercises

  // Exercise type matching
  if (exercise.type === 'workflow-simulation' && project.state.totalStories > 0) {
    relevance += 25;
  }
  if (exercise.type === 'agent-dispatch' && Object.keys(project.state.agents).length > 1) {
    relevance += 20;
  }
  if (exercise.type === 'project-setup' && project.state.totalStories === 0) {
    relevance += 30;
  }

  // Real project requirement bonus
  if (exercise.realProjectRequired) {
    relevance += 15;
  }

  return Math.min(100, relevance);
}