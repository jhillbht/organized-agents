import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb,
  Book,
  Target,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  X,
  RefreshCw,
  Zap,
  Users,
  MessageSquare,
  Code,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  ContextualSuggestion,
  SmartRecommendation,
  LearningContext,
  BMadLearningProgress,
  BMadSkill,
  getBMadSkillDisplayName,
  getBMadSkillIcon
} from '@/types/bmad-education';
import { BMadProject, ProjectState } from '@/types/bmad';
import { BMadEducationAPI } from '@/lib/bmad-education-api';

interface ContextualLearningPanelProps {
  currentView: 'workflow' | 'communication' | 'dispatch' | 'creator' | 'projects';
  currentProject?: BMadProject;
  projectState?: ProjectState;
  userProgress: BMadLearningProgress;
  onSuggestionSelect: (suggestion: ContextualSuggestion) => void;
  onClose?: () => void;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

/**
 * ContextualLearningPanel - Provides intelligent learning suggestions based on current context
 */
export const ContextualLearningPanel: React.FC<ContextualLearningPanelProps> = ({
  currentView,
  currentProject,
  projectState,
  userProgress,
  onSuggestionSelect,
  onClose,
  className,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadContextualRecommendations();
  }, [currentView, currentProject?.id, projectState?.currentPhase]);

  const loadContextualRecommendations = async () => {
    try {
      setLoading(true);
      
      const context: LearningContext = {
        currentProject,
        projectState,
        userProgress,
        recentErrors: [], // TODO: Track recent errors from user activity
        currentView,
        timeOfDay: getTimeOfDay(),
        learningSession: {
          startTime: new Date().toISOString(),
          duration: 0,
          lessonsCompleted: 0,
          focusLevel: estimateFocusLevel()
        }
      };

      const smartRecs = await BMadEducationAPI.getSmartRecommendations(context);
      setRecommendations(smartRecs);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load contextual recommendations:', error);
      // Set fallback recommendations
      setRecommendations(generateFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const estimateFocusLevel = (): number => {
    // Simple focus estimation based on time of day and recent activity
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) return 85; // Morning peak
    if (hour >= 14 && hour <= 16) return 75; // Afternoon
    if (hour >= 20 || hour <= 7) return 45; // Late/early
    return 65; // Default
  };

  const generateFallbackRecommendations = (): SmartRecommendation => {
    const suggestions: ContextualSuggestion[] = [];

    // View-specific suggestions
    switch (currentView) {
      case 'workflow':
        suggestions.push({
          type: 'lesson',
          title: 'Workflow Management',
          description: 'Master the BMAD 5-phase workflow',
          relevanceScore: 90,
          reason: 'You are currently viewing the workflow interface',
          lessonId: 'workflow-management'
        });
        break;
      case 'dispatch':
        suggestions.push({
          type: 'lesson',
          title: 'Agent Coordination',
          description: 'Learn effective agent dispatch strategies',
          relevanceScore: 85,
          reason: 'You are working with the agent dispatcher',
          lessonId: 'agent-coordination'
        });
        break;
      case 'communication':
        suggestions.push({
          type: 'lesson',
          title: 'Communication Best Practices',
          description: 'Improve team communication in BMAD projects',
          relevanceScore: 80,
          reason: 'You are using the communication board',
          lessonId: 'communication-best-practices'
        });
        break;
    }

    return {
      suggestions,
      justInTimeTips: [
        'Use phase indicators to track your workflow progress',
        'Check agent recommendations for optimal next steps',
        'Review communication board regularly for team updates'
      ],
      skillGaps: []
    };
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <Book className="h-4 w-4" />;
      case 'exercise':
        return <Target className="h-4 w-4" />;
      case 'resource':
        return <Star className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'workflow':
        return <TrendingUp className="h-4 w-4" />;
      case 'dispatch':
        return <Users className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'creator':
        return <Code className="h-4 w-4" />;
      case 'projects':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatLastUpdate = () => {
    const diffMs = Date.now() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins === 0) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return lastUpdate.toLocaleTimeString();
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("fixed bottom-4 right-4 z-50", className)}
      >
        <Card className="w-64 shadow-lg border-2 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Learning Suggestions</p>
                  <p className="text-xs text-gray-500">
                    {recommendations?.suggestions.length || 0} recommendations
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onToggleMinimize}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={cn("w-80 bg-white border-l shadow-lg", className)}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Learning Assistant</h3>
                <p className="text-xs text-gray-600">Smart recommendations for you</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => loadContextualRecommendations()}>
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              </Button>
              {onToggleMinimize && (
                <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              {onClose && (
                <Button size="sm" variant="ghost" onClick={onClose}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Context */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                {getViewIcon(currentView)}
                <span className="font-medium text-sm">Current Context</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>View:</span>
                  <Badge variant="secondary" className="text-xs">{currentView}</Badge>
                </div>
                {currentProject && (
                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span className="font-medium">{currentProject.name}</span>
                  </div>
                )}
                {projectState && (
                  <div className="flex justify-between">
                    <span>Phase:</span>
                    <Badge variant="outline" className="text-xs">{projectState.currentPhase}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="text-gray-500">{formatLastUpdate()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Analyzing your context...</p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && !loading && (
            <>
              {/* Smart Suggestions */}
              {recommendations.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Smart Suggestions</span>
                  </h4>
                  <AnimatePresence>
                    {recommendations.suggestions.slice(0, 3).map((suggestion, index) => (
                      <motion.div
                        key={suggestion.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
                              onClick={() => onSuggestionSelect(suggestion)}>
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-2">
                              <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1 mb-1">
                                  <h5 className="font-medium text-sm truncate">{suggestion.title}</h5>
                                  <Badge className={getRelevanceColor(suggestion.relevanceScore)} style={{ fontSize: '10px' }}>
                                    {suggestion.relevanceScore}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                                <p className="text-xs text-blue-600 italic">{suggestion.reason}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Just-in-Time Tips */}
              {recommendations.justInTimeTips.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-1">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Quick Tips</span>
                  </h4>
                  <div className="space-y-2">
                    {recommendations.justInTimeTips.slice(0, 2).map((tip, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Gaps */}
              {recommendations.skillGaps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Skill Development</span>
                  </h4>
                  <div className="space-y-3">
                    {recommendations.skillGaps.slice(0, 2).map((gap, index) => (
                      <Card key={gap.skill} className="bg-green-50 border-green-200">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getBMadSkillIcon(gap.skill)}</span>
                            <span className="font-medium text-sm">{getBMadSkillDisplayName(gap.skill)}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Current: {gap.currentLevel}%</span>
                              <span>Target: {gap.targetLevel}%</span>
                            </div>
                            <Progress 
                              value={gap.currentLevel} 
                              className="h-1" 
                            />
                            <div className="space-y-1">
                              {gap.recommendedActions.slice(0, 2).map((action, i) => (
                                <p key={i} className="text-xs text-green-700">• {action}</p>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Learning Stats */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-3 flex items-center space-x-1">
                <Star className="h-4 w-4 text-purple-500" />
                <span>Your Progress</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-purple-600">{userProgress.completedLessons.length}</p>
                  <p className="text-xs text-purple-700">Lessons</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{userProgress.achievements.length}</p>
                  <p className="text-xs text-purple-700">Achievements</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{userProgress.streakDays}</p>
                  <p className="text-xs text-purple-700">Day Streak</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{userProgress.masteryLevel}</p>
                  <p className="text-xs text-purple-700">Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Recommendations State */}
          {recommendations && recommendations.suggestions.length === 0 && !loading && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">All Caught Up!</h4>
                <p className="text-sm text-gray-600">
                  No new recommendations for your current context.
                  Keep up the great work!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};