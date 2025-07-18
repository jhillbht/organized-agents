import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ProjectState,
  AgentType,
  AgentStatusType,
  AgentRecommendation,
  getAgentDisplayName,
  getAgentStatusColor 
} from "@/types/bmad";

interface AgentQueueProps {
  projectState: ProjectState;
  recommendations?: AgentRecommendation[];
  onDispatchAgent?: (agent: AgentType) => void;
  onViewAgent?: (agent: AgentType) => void;
  className?: string;
}

/**
 * AgentQueue component - Displays agent statuses and recommendations
 */
export const AgentQueue: React.FC<AgentQueueProps> = ({
  projectState,
  recommendations = [],
  onDispatchAgent,
  onViewAgent,
  className,
}) => {
  // Convert agent statuses object to array for easier processing
  const agentStatusArray = Object.entries(projectState.agents).map(([key, status]) => ({
    agent: key.charAt(0).toUpperCase() + key.slice(1) as AgentType,
    ...status
  }));

  const activeAgents = agentStatusArray.filter(agent => agent.status === AgentStatusType.Active);
  const waitingAgents = agentStatusArray.filter(agent => agent.status === AgentStatusType.Waiting);
  const blockedAgents = agentStatusArray.filter(agent => agent.status === AgentStatusType.Blocked);

  const getAgentInitials = (agent: AgentType): string => {
    return getAgentDisplayName(agent)
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getStatusIcon = (status: AgentStatusType) => {
    switch (status) {
      case AgentStatusType.Active:
        return <Play className="h-3 w-3 text-green-500" />;
      case AgentStatusType.Waiting:
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case AgentStatusType.Blocked:
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case AgentStatusType.Idle:
        return <Pause className="h-3 w-3 text-gray-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return "Unknown";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Play className="h-4 w-4 text-green-500" />
                <span>Active Agents</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {activeAgents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAgents.map((agent, index) => (
              <motion.div
                key={agent.agent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => onViewAgent?.(agent.agent)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-green-100 text-green-700">
                    {getAgentInitials(agent.agent)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">
                      {getAgentDisplayName(agent.agent)}
                    </p>
                    {getStatusIcon(agent.status)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.currentTask || "Working on current phase"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {formatTimeAgo(agent.lastActivity)}
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
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agent Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Recommended Actions</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {recommendations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations
              .sort((a, b) => b.priority - a.priority)
              .slice(0, 3)
              .map((recommendation, index) => (
                <motion.div
                  key={`${recommendation.agent}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getAgentInitials(recommendation.agent)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">
                            {getAgentDisplayName(recommendation.agent)}
                          </p>
                          <Badge 
                            variant={recommendation.priority >= 7 ? "destructive" : 
                                   recommendation.priority >= 5 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            P{recommendation.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {recommendation.reason}
                        </p>
                        {recommendation.estimatedTime && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {recommendation.estimatedTime}
                            </span>
                          </div>
                        )}
                        {recommendation.prerequisites.length > 0 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Requires: {recommendation.prerequisites.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {onDispatchAgent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => onDispatchAgent(recommendation.agent)}
                      >
                        Dispatch
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Queue Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Queue Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Waiting</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {waitingAgents.length}
              </p>
              {waitingAgents.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Avg wait: {waitingAgents[0]?.estimatedStart || "Unknown"}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {blockedAgents.length}
              </p>
              {blockedAgents.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Needs attention
                </p>
              )}
            </div>
          </div>

          {/* Blocked Agents Details */}
          {blockedAgents.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-red-600">Blocked Agents</h4>
              {blockedAgents.map((agent) => (
                <div 
                  key={agent.agent}
                  className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getAgentDisplayName(agent.agent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {agent.currentTask || "Blocked by dependencies"}
                    </p>
                  </div>
                  {onViewAgent && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => onViewAgent(agent.agent)}
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};