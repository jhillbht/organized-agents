import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle,
  Clock,
  User,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ProjectState,
  AgentType,
  getAgentDisplayName 
} from "@/types/bmad";

interface StoryStatusProps {
  projectState: ProjectState;
  onStoryClick?: (storyName: string) => void;
  className?: string;
}

/**
 * StoryStatus component - Displays current story progress and details
 */
export const StoryStatus: React.FC<StoryStatusProps> = ({
  projectState,
  onStoryClick,
  className,
}) => {
  const activeStory = projectState.activeStory;
  const nextActions = projectState.nextActions.slice(0, 3); // Show up to 3 next actions
  
  const getStoryProgress = (): number => {
    // Calculate story progress based on completed actions vs total actions
    const totalActions = projectState.nextActions.length;
    const completedActions = projectState.workflowHistory.filter(
      event => event.eventType === 'StoryComplete' || 
               event.eventType === 'AgentHandoff'
    ).length;
    
    if (totalActions === 0) return 100;
    return Math.min((completedActions / totalActions) * 100, 100);
  };

  const getActiveAgent = (): AgentType | null => {
    const activeAction = projectState.nextActions.find(action => action.autoTrigger);
    return activeAction?.agent || null;
  };

  const getEstimatedCompletion = (): string => {
    const totalEstimatedMinutes = projectState.nextActions
      .filter(action => action.estimatedTime)
      .reduce((total, action) => {
        const timeStr = action.estimatedTime || "0";
        const minutes = parseInt(timeStr.replace(/\D/g, '')) || 0;
        return total + minutes;
      }, 0);

    if (totalEstimatedMinutes === 0) return "Unknown";
    
    const hours = Math.floor(totalEstimatedMinutes / 60);
    const minutes = totalEstimatedMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!activeStory) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-medium text-muted-foreground">No Active Story</h3>
              <p className="text-sm text-muted-foreground">
                Start a new story to begin development
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Active Story</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            In Progress
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Story Header */}
        <div 
          className={cn(
            "space-y-2",
            onStoryClick && "cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2"
          )}
          onClick={() => onStoryClick?.(activeStory)}
        >
          <h3 className="font-medium text-lg">{activeStory}</h3>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(getStoryProgress())}%</span>
            </div>
            <Progress value={getStoryProgress()} className="h-2" />
          </div>
        </div>

        {/* Active Agent */}
        {getActiveAgent() && (
          <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {getAgentDisplayName(getActiveAgent()!)} is working
              </p>
              <p className="text-xs text-muted-foreground">
                Currently active on this story
              </p>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </div>
        )}

        {/* Estimated Completion */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated completion</span>
          </div>
          <span className="font-medium">{getEstimatedCompletion()}</span>
        </div>

        {/* Next Actions */}
        {nextActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Next Actions ({nextActions.length})
            </h4>
            <div className="space-y-2">
              {nextActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {action.dependencies.length > 0 ? (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <div className="w-3 h-3 bg-muted rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{action.task}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getAgentDisplayName(action.agent)}
                      </Badge>
                      {action.estimatedTime && (
                        <span className="text-xs text-muted-foreground">
                          {action.estimatedTime}
                        </span>
                      )}
                    </div>
                    {action.dependencies.length > 0 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Waiting for: {action.dependencies.join(", ")}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Story Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center space-x-2 p-2 text-sm border rounded-lg hover:bg-muted/50"
            onClick={() => onStoryClick?.(activeStory)}
          >
            <BookOpen className="h-4 w-4" />
            <span>View Details</span>
          </motion.button>
        </div>
      </CardContent>
    </Card>
  );
};