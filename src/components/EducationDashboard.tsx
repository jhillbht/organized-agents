import React, { useEffect, useState } from 'react';
import { educationApi, SessionWithProgress } from '@/lib/education';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lock, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Trophy, 
  ExternalLink, 
  RefreshCw,
  Book,
  Target,
  Users,
  Lightbulb,
  Star,
  TrendingUp,
  Code,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BMadEducationAPI } from '@/lib/bmad-education-api';
import { 
  BMadLesson, 
  BMadLearningProgress, 
  BMadEducationStats,
  getBMadSkillDisplayName,
  getBMadSkillIcon 
} from '@/types/bmad-education';
import { BMadProject } from '@/types/bmad';
import { BMAD_CORE_LESSONS } from '@/data/bmad-lessons';
import { InteractiveTutorial } from '@/components/Education/InteractiveTutorial';
import { ProjectBasedLearning } from '@/components/Education/ProjectBasedLearning';
import { ContextualLearningPanel } from '@/components/Education/ContextualLearningPanel';
import { useContextualLearning } from '@/hooks/useContextualLearning';

interface EducationDashboardProps {
  currentProject?: BMadProject;
  onProjectSelect?: (project: BMadProject) => void;
  className?: string;
}

export function EducationDashboard({ 
  currentProject, 
  onProjectSelect,
  className 
}: EducationDashboardProps = {}) {
  // Existing lovable.dev state
  const [sessions, setSessions] = useState<SessionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionWithProgress | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // BMAD education state
  const [bmadLessons, setBmadLessons] = useState<BMadLesson[]>([]);
  const [bmadProgress, setBmadProgress] = useState<BMadLearningProgress | null>(null);
  const [bmadStats, setBmadStats] = useState<BMadEducationStats | null>(null);
  const [bmadLoading, setBmadLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<BMadLesson | null>(null);
  const [showProjectLearning, setShowProjectLearning] = useState(false);
  const [showContextualPanel, setShowContextualPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bmad' | 'academy'>('overview');

  const { toast } = useToast();
  
  const LOVABLE_DEV_URL = 'https://agent-journey-academy.lovable.app';

  // Contextual learning hook
  const {
    suggestions,
    refreshRecommendations,
    acceptSuggestion
  } = useContextualLearning({
    currentView: 'projects', // Since this is the education dashboard
    currentProject,
    projectState: currentProject?.state,
    userProgress: bmadProgress || {
      completedLessons: [],
      achievements: [],
      skillLevels: {},
      projectsCompleted: 0,
      totalWorkflowCycles: 0,
      masteryLevel: 'beginner',
      lastActive: new Date().toISOString(),
      totalLearningTime: 0,
      streakDays: 0
    }
  });

  useEffect(() => {
    loadSessions();
    initializeEducationSystem();
    loadBMadEducation();
  }, []);

  useEffect(() => {
    if (currentProject) {
      loadBMadEducation();
    }
  }, [currentProject?.id]);

  const initializeEducationSystem = async () => {
    try {
      await educationApi.initializeSystem();
    } catch (error) {
      console.error('Failed to initialize education system:', error);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await educationApi.getSessions();
      setSessions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load education sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBMadEducation = async () => {
    try {
      setBmadLoading(true);
      
      // Load BMAD lessons (fallback to local data if API fails)
      try {
        const lessons = await BMadEducationAPI.getBMadLessons();
        setBmadLessons(lessons);
      } catch (error) {
        console.log('Using fallback BMAD lessons');
        setBmadLessons(BMAD_CORE_LESSONS);
      }

      // Load user progress
      const progress = await BMadEducationAPI.getBMadProgress();
      setBmadProgress(progress);

      // Load education stats
      const stats = await BMadEducationAPI.getBMadEducationStats();
      setBmadStats(stats);

    } catch (error) {
      console.error('Failed to load BMAD education:', error);
      // Set defaults
      setBmadLessons(BMAD_CORE_LESSONS);
      setBmadProgress({
        completedLessons: [],
        achievements: [],
        skillLevels: {},
        projectsCompleted: 0,
        totalWorkflowCycles: 0,
        masteryLevel: 'beginner',
        lastActive: new Date().toISOString(),
        totalLearningTime: 0,
        streakDays: 0
      });
    } finally {
      setBmadLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      await educationApi.startSession(sessionId);
      await loadSessions();
      
      // Open lovable.dev with session ID
      window.open(`${LOVABLE_DEV_URL}/session/${sessionId}`, '_blank');
      
      toast({
        title: 'Session Started',
        description: 'The session has been opened in a new tab',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive',
      });
    }
  };

  const handleSessionComplete = async (sessionId: string, score: number) => {
    try {
      await educationApi.completeSession(sessionId, score);
      await loadSessions();
      
      toast({
        title: 'Congratulations!',
        description: 'You have completed this session successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        variant: 'destructive',
      });
    }
  };

  const resetProgress = async () => {
    try {
      await educationApi.resetProgress();
      await loadSessions();
      setShowResetDialog(false);
      
      toast({
        title: 'Progress Reset',
        description: 'Your learning progress has been reset',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset progress',
        variant: 'destructive',
      });
    }
  };

  // BMAD lesson handlers
  const handleStartBMadLesson = (lesson: BMadLesson) => {
    setSelectedLesson(lesson);
  };

  const handleBMadLessonComplete = async (lessonId: string) => {
    // Refresh BMAD progress
    await loadBMadEducation();
    setSelectedLesson(null);
    
    toast({
      title: 'Lesson Completed!',
      description: 'Great job! Your progress has been updated.',
    });
  };

  const handleProjectBasedLearning = () => {
    if (!currentProject) {
      toast({
        title: 'Project Required',
        description: 'Please select an active project to use project-based learning',
        variant: 'destructive',
      });
      return;
    }
    setShowProjectLearning(true);
  };

  const handleContextualHelp = () => {
    setShowContextualPanel(!showContextualPanel);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'available':
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Lock className="w-5 h-5 text-gray-300" />;
    }
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

  const calculateTotalProgress = () => {
    const completed = sessions.filter(s => s.progress?.status === 'completed').length;
    return sessions.length > 0 ? (completed / sessions.length) * 100 : 0;
  };

  // Show individual components when active
  if (selectedLesson && bmadProgress) {
    return (
      <InteractiveTutorial
        lesson={selectedLesson}
        currentProject={currentProject}
        userProgress={bmadProgress}
        onComplete={handleBMadLessonComplete}
        onExit={() => setSelectedLesson(null)}
        className={className}
      />
    );
  }

  if (showProjectLearning && currentProject && bmadProgress) {
    return (
      <ProjectBasedLearning
        currentProject={currentProject}
        userProgress={bmadProgress}
        onLessonComplete={handleBMadLessonComplete}
        onClose={() => setShowProjectLearning(false)}
        className={className}
      />
    );
  }

  if (loading || bmadLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning Center</h2>
          <p className="text-muted-foreground">
            Master BMAD methodology and AI agent coordination
          </p>
        </div>
        <div className="flex items-center gap-2">
          {suggestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleContextualHelp}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Smart Suggestions ({suggestions.length})
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              loadSessions();
              loadBMadEducation();
              refreshRecommendations();
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bmad" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            BMAD Learning
          </TabsTrigger>
          <TabsTrigger value="academy" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Academy Portal
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {bmadProgress?.completedLessons.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">BMAD Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {bmadProgress?.achievements.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {bmadProgress?.projectsCompleted || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round((bmadProgress?.totalLearningTime || 0) / 60)}h
                    </p>
                    <p className="text-xs text-muted-foreground">Learning Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button onClick={() => setActiveTab('bmad')} className="h-auto p-4">
                  <div className="text-center">
                    <Book className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Start Learning</div>
                    <div className="text-xs opacity-70">Begin with fundamentals</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleProjectBasedLearning}
                  className="h-auto p-4"
                  disabled={!currentProject}
                >
                  <div className="text-center">
                    <Code className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Project Learning</div>
                    <div className="text-xs opacity-70">Learn with real projects</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => window.open(LOVABLE_DEV_URL, '_blank')}
                  className="h-auto p-4"
                >
                  <div className="text-center">
                    <ExternalLink className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Academy Portal</div>
                    <div className="text-xs opacity-70">Advanced courses</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          {bmadProgress && Object.keys(bmadProgress.skillLevels).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(bmadProgress.skillLevels).slice(0, 4).map(([skill, level]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{getBMadSkillIcon(skill as any)}</span>
                          <span>{getBMadSkillDisplayName(skill as any)}</span>
                        </div>
                        <span className="font-medium">{level}%</span>
                      </div>
                      <Progress value={level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BMAD Learning Tab */}
        <TabsContent value="bmad" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bmadLessons.map((lesson) => {
              const isCompleted = bmadProgress?.completedLessons.includes(lesson.id);
              const prerequisitesMet = lesson.prerequisites.every(prereq =>
                bmadProgress?.completedLessons.includes(prereq)
              );
              const isLocked = !prerequisitesMet;

              return (
                <Card
                  key={lesson.id}
                  className={`transition-all ${
                    isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
                  }`}
                  onClick={() => !isLocked && handleStartBMadLesson(lesson)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-300" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-blue-500" />
                        )}
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(lesson.difficulty)}>
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.estimatedDuration} minutes</span>
                      </div>
                      
                      {lesson.prerequisites.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Prerequisites: {lesson.prerequisites.length} lesson(s)
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {lesson.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {!isLocked && !isCompleted && (
                        <Button size="sm" className="w-full">
                          Start Lesson
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Academy Portal Tab */}
        <TabsContent value="academy" className="space-y-6">
          {/* Academy Portal Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Agent Journey Academy Portal
              </CardTitle>
              <CardDescription>
                Advanced interactive courses and assessments hosted on lovable.dev
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => window.open(LOVABLE_DEV_URL, '_blank')}
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Academy Portal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetDialog(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Progress
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Academy Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Academy Progress</CardTitle>
              <CardDescription>
                {sessions.filter(s => s.progress?.status === 'completed').length} of {sessions.length} sessions completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={calculateTotalProgress()} className="h-4 mb-4" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>{Math.round(calculateTotalProgress())}% Complete</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{sessions.filter(s => s.progress?.status === 'completed').length} Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4 text-blue-500" />
                    <span>{sessions.filter(s => s.progress?.status === 'in_progress').length} In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-gray-300" />
                    <span>{sessions.filter(s => !s.progress || s.progress.status === 'locked').length} Locked</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academy Sessions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const isLocked = !session.progress || session.progress.status === 'locked';
              const isAvailable = session.progress?.status === 'available';
              const isInProgress = session.progress?.status === 'in_progress';
              const isCompleted = session.progress?.status === 'completed';

              return (
                <Card
                  key={session.session.id}
                  className={`transition-all ${
                    isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
                  }`}
                  onClick={() => !isLocked && setSelectedSession(session)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.progress?.status)}
                        <CardTitle className="text-lg">{session.session.title}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(session.session.difficulty)}>
                        {session.session.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{session.session.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{session.session.estimated_duration} minutes</span>
                      </div>
                      
                      {session.progress && (
                        <div className="space-y-1">
                          {isCompleted && session.progress.score && (
                            <div className="flex items-center justify-between text-sm">
                              <span>Score</span>
                              <span className="font-semibold">{session.progress.score}%</span>
                            </div>
                          )}
                          {session.progress.attempts > 0 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Attempts</span>
                              <span>{session.progress.attempts}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {(isAvailable || isInProgress) && (
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startSession(session.session.id);
                          }}
                        >
                          {isInProgress ? 'Continue Session' : 'Start Session'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contextual Learning Panel */}
      {showContextualPanel && bmadProgress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="flex-1" onClick={() => setShowContextualPanel(false)} />
          <ContextualLearningPanel
            currentView="projects"
            currentProject={currentProject}
            projectState={currentProject?.state}
            userProgress={bmadProgress}
            onSuggestionSelect={(suggestion) => {
              acceptSuggestion(suggestion);
              if (suggestion.lessonId) {
                const lesson = bmadLessons.find(l => l.id === suggestion.lessonId);
                if (lesson) {
                  handleStartBMadLesson(lesson);
                }
              }
              setShowContextualPanel(false);
            }}
            onClose={() => setShowContextualPanel(false)}
          />
        </div>
      )}

      {/* Dialogs */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedSession.session.title}</DialogTitle>
              <DialogDescription>{selectedSession.session.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge className={getDifficultyColor(selectedSession.session.difficulty)}>
                  {selectedSession.session.difficulty}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedSession.session.estimated_duration} minutes</span>
                </div>
              </div>

              {selectedSession.session.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedSession.session.prerequisites.map((prereq) => (
                      <li key={prereq}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  This session will open in the Agent Journey Academy portal at lovable.dev. 
                  Complete the interactive exercises and assessments to unlock the next session.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Cancel
              </Button>
              <Button onClick={() => startSession(selectedSession.session.id)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Academy Portal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Progress</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all your learning progress? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetProgress}>
              Reset Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}