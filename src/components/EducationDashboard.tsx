import React, { useEffect, useState } from 'react';
import { educationApi, SessionWithProgress } from '@/lib/education';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lock, PlayCircle, CheckCircle, Clock, Trophy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function EducationDashboard() {
  const [sessions, setSessions] = useState<SessionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionWithProgress | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { toast } = useToast();
  
  const LOVABLE_DEV_URL = 'https://agent-journey-academy.lovable.app';

  useEffect(() => {
    loadSessions();
    initializeEducationSystem();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Journey Academy</h2>
          <p className="text-muted-foreground">
            Master AI agent coordination through progressive learning sessions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.open(LOVABLE_DEV_URL, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Academy Portal
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowResetDialog(true)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {sessions.filter(s => s.progress?.status === 'completed').length} of {sessions.length} sessions completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateTotalProgress()} className="h-4" />
          <div className="mt-4 flex items-center justify-between text-sm">
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