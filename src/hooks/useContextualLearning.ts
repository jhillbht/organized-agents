import { useState, useEffect, useCallback } from 'react';
import { 
  ContextualSuggestion,
  SmartRecommendation,
  LearningContext,
  BMadLearningProgress
} from '@/types/bmad-education';
import { BMadProject, ProjectState } from '@/types/bmad';
import { BMadEducationAPI } from '@/lib/bmad-education-api';

interface UseContextualLearningProps {
  currentView: 'workflow' | 'communication' | 'dispatch' | 'creator' | 'projects';
  currentProject?: BMadProject;
  projectState?: ProjectState;
  userProgress: BMadLearningProgress;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseContextualLearningReturn {
  recommendations: SmartRecommendation | null;
  suggestions: ContextualSuggestion[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshRecommendations: () => Promise<void>;
  trackUserActivity: (activity: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  acceptSuggestion: (suggestion: ContextualSuggestion) => void;
}

/**
 * Custom hook for managing contextual learning recommendations
 */
export const useContextualLearning = ({
  currentView,
  currentProject,
  projectState,
  userProgress,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes default
}: UseContextualLearningProps): UseContextualLearningReturn => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [userActivity, setUserActivity] = useState<string[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Generate learning context from current state
  const generateLearningContext = useCallback((): LearningContext => {
    const now = new Date();
    const sessionStartTime = lastUpdate || now;
    
    return {
      currentProject,
      projectState,
      userProgress,
      recentErrors: [], // TODO: Integrate with error tracking system
      currentView,
      timeOfDay: getTimeOfDay(now),
      learningSession: {
        startTime: sessionStartTime.toISOString(),
        duration: Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000),
        lessonsCompleted: 0, // TODO: Track session-specific completions
        focusLevel: estimateFocusLevel(now, userActivity)
      }
    };
  }, [currentView, currentProject, projectState, userProgress, lastUpdate, userActivity]);

  // Load contextual recommendations
  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const context = generateLearningContext();
      const smartRecs = await BMadEducationAPI.getSmartRecommendations(context);
      
      // Filter out dismissed suggestions
      const filteredSuggestions = smartRecs.suggestions.filter(
        suggestion => !dismissedSuggestions.has(getSuggestionKey(suggestion))
      );

      setRecommendations({
        ...smartRecs,
        suggestions: filteredSuggestions
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load contextual recommendations:', err);
      setError('Failed to load learning recommendations');
      
      // Set fallback recommendations
      setRecommendations(generateFallbackRecommendations(currentView));
    } finally {
      setLoading(false);
    }
  }, [generateLearningContext, dismissedSuggestions, currentView]);

  // Auto-refresh recommendations
  useEffect(() => {
    loadRecommendations();

    if (autoRefresh) {
      const interval = setInterval(loadRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadRecommendations, autoRefresh, refreshInterval]);

  // Refresh when context changes significantly
  useEffect(() => {
    const significantChange = 
      currentProject?.id !== recommendations?.suggestions[0]?.lessonId ||
      projectState?.currentPhase !== getLastKnownPhase() ||
      currentView !== getLastKnownView();

    if (significantChange && !loading) {
      loadRecommendations();
    }
  }, [currentView, currentProject?.id, projectState?.currentPhase, loadRecommendations, loading]);

  // Track user activity for focus estimation
  const trackUserActivity = useCallback((activity: string) => {
    setUserActivity(prev => {
      const newActivity = [...prev, `${new Date().toISOString()}:${activity}`];
      // Keep only last 10 activities
      return newActivity.slice(-10);
    });
  }, []);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    
    // Remove from current recommendations
    setRecommendations(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        suggestions: prev.suggestions.filter(
          suggestion => getSuggestionKey(suggestion) !== suggestionId
        )
      };
    });
  }, []);

  // Accept/act on a suggestion
  const acceptSuggestion = useCallback((suggestion: ContextualSuggestion) => {
    // Track acceptance for future recommendation improvement
    trackUserActivity(`accepted_suggestion:${suggestion.type}:${suggestion.title}`);
    
    // Optionally remove from current suggestions
    dismissSuggestion(getSuggestionKey(suggestion));
  }, [trackUserActivity, dismissSuggestion]);

  // Manual refresh function
  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    suggestions: recommendations?.suggestions || [],
    loading,
    error,
    lastUpdate,
    refreshRecommendations,
    trackUserActivity,
    dismissSuggestion,
    acceptSuggestion
  };
};

// Helper functions

function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function estimateFocusLevel(now: Date, userActivity: string[]): number {
  const hour = now.getHours();
  let focusScore = 50; // Base score

  // Time-based adjustment
  if (hour >= 9 && hour <= 11) focusScore += 25; // Morning peak
  else if (hour >= 14 && hour <= 16) focusScore += 15; // Afternoon
  else if (hour >= 20 || hour <= 7) focusScore -= 20; // Late/early

  // Activity-based adjustment
  const recentActivity = userActivity.slice(-5); // Last 5 activities
  const activityDensity = recentActivity.length / 5; // 0-1
  focusScore += activityDensity * 15;

  // Check for rapid successive activities (might indicate rushed/unfocused work)
  if (recentActivity.length >= 3) {
    const timestamps = recentActivity.map(activity => new Date(activity.split(':')[0]));
    const avgInterval = timestamps.reduce((sum, timestamp, i) => {
      if (i === 0) return sum;
      return sum + (timestamp.getTime() - timestamps[i - 1].getTime());
    }, 0) / (timestamps.length - 1);

    if (avgInterval < 30000) { // Less than 30 seconds between activities
      focusScore -= 10; // Might be rushing
    }
  }

  return Math.max(0, Math.min(100, focusScore));
}

function getSuggestionKey(suggestion: ContextualSuggestion): string {
  return `${suggestion.type}:${suggestion.title}`;
}

function getLastKnownPhase(): string | undefined {
  // TODO: Implement persistence for tracking context changes
  return undefined;
}

function getLastKnownView(): string | undefined {
  // TODO: Implement persistence for tracking context changes
  return undefined;
}

function generateFallbackRecommendations(currentView: string): SmartRecommendation {
  const suggestions: ContextualSuggestion[] = [];

  switch (currentView) {
    case 'workflow':
      suggestions.push({
        type: 'lesson',
        title: 'Workflow Management',
        description: 'Master the BMAD 5-phase workflow',
        relevanceScore: 85,
        reason: 'You are currently managing project workflows',
        lessonId: 'workflow-management'
      });
      break;
    case 'dispatch':
      suggestions.push({
        type: 'lesson',
        title: 'Agent Coordination',
        description: 'Learn effective agent dispatch strategies',
        relevanceScore: 90,
        reason: 'You are actively dispatching agents',
        lessonId: 'agent-coordination'
      });
      break;
    case 'communication':
      suggestions.push({
        type: 'lesson',
        title: 'Communication Best Practices',
        description: 'Improve team communication efficiency',
        relevanceScore: 80,
        reason: 'You are managing team communications',
        lessonId: 'communication-best-practices'
      });
      break;
    case 'creator':
      suggestions.push({
        type: 'lesson',
        title: 'Project Setup',
        description: 'Learn to create effective BMAD projects',
        relevanceScore: 95,
        reason: 'You are setting up a new project',
        lessonId: 'project-setup'
      });
      break;
    case 'projects':
      suggestions.push({
        type: 'tip',
        title: 'Project Overview',
        description: 'Review your project health and progress',
        relevanceScore: 70,
        reason: 'You are reviewing project status'
      });
      break;
  }

  return {
    suggestions,
    justInTimeTips: [
      'Keep your workflow phases organized and track progress regularly',
      'Use agent recommendations to optimize team coordination',
      'Regular communication prevents project bottlenecks'
    ],
    skillGaps: []
  };
}

// Export types for external use
export type {
  UseContextualLearningProps,
  UseContextualLearningReturn
};