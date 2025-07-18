import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap,
  User,
  Clock,
  AlertTriangle,
  Send,
  PlayCircle,
  Pause,
  RotateCcw,
  CheckCircle,
  Users,
  Target,
  ArrowRight,
  Info,
  Code,
  ExternalLink,
  Settings,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { BMadAPI, handleBMadError } from "@/lib/bmad-api";
import { 
  BMadProject,
  AgentRecommendation,
  AgentType,
  AgentStatusType,
  MessageType,
  getAgentDisplayName
} from "@/types/bmad";

interface AgentDispatcherProps {
  project: BMadProject;
  recommendations?: AgentRecommendation[];
  onDispatch?: (agent: AgentType, customMessage?: string) => void;
  onRecommendationsUpdate?: (recommendations: AgentRecommendation[]) => void;
  className?: string;
}

interface DispatchDialog {
  isOpen: boolean;
  agent: AgentType | null;
  recommendation: AgentRecommendation | null;
  customMessage: string;
  isManualOverride?: boolean;
}

interface ManualDispatchDialog {
  isOpen: boolean;
  selectedAgent: AgentType | null;
  customMessage: string;
}

/**
 * AgentDispatcher component - Manages agent recommendations and dispatching
 */
export const AgentDispatcher: React.FC<AgentDispatcherProps> = ({
  project,
  recommendations = [],
  onDispatch,
  onRecommendationsUpdate,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [dispatchDialog, setDispatchDialog] = useState<DispatchDialog>({
    isOpen: false,
    agent: null,
    recommendation: null,
    customMessage: "",
    isManualOverride: false
  });
  const [manualDispatchDialog, setManualDispatchDialog] = useState<ManualDispatchDialog>({
    isOpen: false,
    selectedAgent: null,
    customMessage: ""
  });
  const [localRecommendations, setLocalRecommendations] = useState<AgentRecommendation[]>(recommendations);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
  const [availableIDEs, setAvailableIDEs] = useState<string[]>([]);
  const [ideLoading, setIdeLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recommendations.length === 0) {
      loadRecommendations();
    } else {
      setLocalRecommendations(recommendations);
    }
    loadAvailableIDEs();
  }, [project.id, project.state.currentPhase]);

  useEffect(() => {
    setLocalRecommendations(recommendations);
  }, [recommendations]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const recs = await BMadAPI.getAgentRecommendations(project.id);
      setLocalRecommendations(recs);
      onRecommendationsUpdate?.(recs);
      
      // Show toast for high priority recommendations
      const urgentRecs = recs.filter(r => r.priority >= 8);
      if (urgentRecs.length > 0) {
        toast({
          title: `${urgentRecs.length} High Priority Recommendation${urgentRecs.length > 1 ? 's' : ''}`,
          description: `${urgentRecs[0].agent.replace(/([A-Z])/g, ' $1').trim()} needs attention`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast({
        title: "Failed to Load Recommendations",
        description: "Unable to get agent recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableIDEs = async () => {
    try {
      const ides = await BMadAPI.detectInstalledIdes();
      setAvailableIDEs(ides);
    } catch (error) {
      console.error('Failed to load available IDEs:', error);
    }
  };

  const handleLaunchIDE = async (agent: AgentType, storyContext?: string) => {
    try {
      setIdeLoading(true);
      
      // Get recommended IDE for agent
      const recommendedIDE = await BMadAPI.getAgentIdeRecommendation(project.id, agent);
      const ideToLaunch = recommendedIDE || availableIDEs[0];
      
      if (!ideToLaunch) {
        toast({
          title: "No IDE Available",
          description: "No suitable IDE found for this agent",
          variant: "destructive",
        });
        return;
      }
      
      await BMadAPI.launchIdeWithContext(project.id, ideToLaunch, storyContext);
      
      toast({
        title: "IDE Launched",
        description: `Opened ${ideToLaunch} with project context for ${getAgentDisplayName(agent)}`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Failed to Launch IDE",
        description: bmadError.message,
        variant: "destructive",
      });
    } finally {
      setIdeLoading(false);
    }
  };

  const generateSmartMessage = (recommendation: AgentRecommendation): string => {
    const agentName = getAgentDisplayName(recommendation.agent);
    const currentPhase = project.state.currentPhase;
    const activeStory = project.state.activeStory;
    
    let contextualMessage = `**${agentName} Assignment**\n\n`;
    contextualMessage += `**Current Phase:** ${currentPhase}\n`;
    if (activeStory) {
      contextualMessage += `**Active Story:** ${activeStory}\n`;
    }
    contextualMessage += `**Priority:** ${recommendation.priority}/10\n\n`;
    
    contextualMessage += `**Task:** ${recommendation.reason}\n\n`;
    
    if (recommendation.prerequisites.length > 0) {
      contextualMessage += `**Prerequisites:**\n`;
      recommendation.prerequisites.forEach(prereq => {
        contextualMessage += `- ${prereq}\n`;
      });
      contextualMessage += '\n';
    }
    
    if (recommendation.estimatedTime) {
      contextualMessage += `**Estimated Time:** ${recommendation.estimatedTime}\n\n`;
    }
    
    contextualMessage += `**Context:** Project is in ${currentPhase} phase. Please proceed with the assigned task and update your status accordingly. Reach out to the team if you encounter any blockers.\n\n`;
    contextualMessage += `**Next Steps:** Complete this task and notify the BMAD Orchestrator when finished for the next phase coordination.`;
    
    return contextualMessage;
  };

  const handleDispatchClick = (recommendation: AgentRecommendation) => {
    setDispatchDialog({
      isOpen: true,
      agent: recommendation.agent,
      recommendation,
      customMessage: generateSmartMessage(recommendation)
    });
  };

  const executeDispatch = async () => {
    if (!dispatchDialog.agent || !dispatchDialog.recommendation) return;

    try {
      setLoading(true);
      
      // Send message to agent with context
      await BMadAPI.sendAgentMessage(
        project.id,
        AgentType.BMadOrchestrator,
        dispatchDialog.agent,
        dispatchDialog.customMessage,
        MessageType.Handoff
      );

      // Call the onDispatch callback
      onDispatch?.(dispatchDialog.agent, dispatchDialog.customMessage);

      // Close dialog
      setDispatchDialog({
        isOpen: false,
        agent: null,
        recommendation: null,
        customMessage: "",
        isManualOverride: false
      });

      // Reload recommendations
      await loadRecommendations();

      toast({
        title: "Agent Dispatched",
        description: `${getAgentDisplayName(dispatchDialog.agent)} has been notified and will begin work`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Dispatch Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualDispatch = (agent: AgentType) => {
    setManualDispatchDialog({
      isOpen: true,
      selectedAgent: agent,
      customMessage: `**Manual Assignment to ${getAgentDisplayName(agent)}**\n\nPlease proceed with your assigned task for the current project phase: ${project.state.currentPhase}\n\nUpdate your status and communicate any blockers to the team.`
    });
  };

  const executeManualDispatch = async () => {
    if (!manualDispatchDialog.selectedAgent) return;

    try {
      setLoading(true);
      
      await BMadAPI.sendAgentMessage(
        project.id,
        AgentType.BMadOrchestrator,
        manualDispatchDialog.selectedAgent,
        manualDispatchDialog.customMessage,
        MessageType.Assignment
      );

      onDispatch?.(manualDispatchDialog.selectedAgent, manualDispatchDialog.customMessage);

      setManualDispatchDialog({
        isOpen: false,
        selectedAgent: null,
        customMessage: ""
      });

      await loadRecommendations();

      toast({
        title: "Manual Assignment Sent",
        description: `${getAgentDisplayName(manualDispatchDialog.selectedAgent)} has been manually assigned`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Manual Assignment Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDispatch = async () => {
    if (selectedRecommendations.size === 0) return;

    try {
      setLoading(true);
      
      const recsToDispatch = localRecommendations.filter(rec => 
        selectedRecommendations.has(`${rec.agent}-${rec.priority}`)
      );

      for (const rec of recsToDispatch) {
        const smartMessage = generateSmartMessage(rec);
        await BMadAPI.sendAgentMessage(
          project.id,
          AgentType.BMadOrchestrator,
          rec.agent,
          smartMessage,
          MessageType.Handoff
        );
        onDispatch?.(rec.agent, smartMessage);
      }

      setSelectedRecommendations(new Set());
      await loadRecommendations();

      toast({
        title: "Bulk Dispatch Complete",
        description: `${recsToDispatch.length} agents have been dispatched`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Bulk Dispatch Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAgentInitials = (agent: AgentType): string => {
    return getAgentDisplayName(agent)
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return "bg-red-100 text-red-800 border-red-200";
    if (priority >= 6) return "bg-orange-100 text-orange-800 border-orange-200";
    if (priority >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 8) return <AlertTriangle className="h-3 w-3" />;
    if (priority >= 6) return <Zap className="h-3 w-3" />;
    if (priority >= 4) return <Clock className="h-3 w-3" />;
    return <Info className="h-3 w-3" />;
  };

  const getAgentStatus = (agent: AgentType): AgentStatusType => {
    const agentKey = agent.toLowerCase() as keyof typeof project.state.agents;
    return project.state.agents[agentKey]?.status || AgentStatusType.Idle;
  };

  const getAgentStatusIcon = (status: AgentStatusType) => {
    switch (status) {
      case AgentStatusType.Active:
        return <PlayCircle className="h-3 w-3 text-green-500" />;
      case AgentStatusType.Waiting:
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case AgentStatusType.Blocked:
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case AgentStatusType.Idle:
        return <Pause className="h-3 w-3 text-gray-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const sortedRecommendations = [...localRecommendations].sort((a, b) => b.priority - a.priority);

  if (loading && localRecommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Agent Dispatch Center</h3>
          <Badge variant="secondary">{sortedRecommendations.length} recommendations</Badge>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRecommendations}
                disabled={loading}
              >
                <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh recommendations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Recommendations */}
      {sortedRecommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
              No Agent Recommendations
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              All agents are up to date with the current workflow. 
              New recommendations will appear as the project progresses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedRecommendations.map((recommendation, index) => {
              const agentStatus = getAgentStatus(recommendation.agent);
              const isAgentBusy = agentStatus === AgentStatusType.Active || 
                                 agentStatus === AgentStatusType.Blocked;
              
              return (
                <motion.div
                  key={`${recommendation.agent}-${recommendation.priority}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "transition-all hover:shadow-md",
                    recommendation.priority >= 8 && "ring-1 ring-red-200"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Selection Checkbox */}
                        <div className="pt-3">
                          <Checkbox
                            checked={selectedRecommendations.has(`${recommendation.agent}-${recommendation.priority}`)}
                            onCheckedChange={(checked) => {
                              const key = `${recommendation.agent}-${recommendation.priority}`;
                              const newSelected = new Set(selectedRecommendations);
                              if (checked) {
                                newSelected.add(key);
                              } else {
                                newSelected.delete(key);
                              }
                              setSelectedRecommendations(newSelected);
                            }}
                          />
                        </div>

                        {/* Agent Avatar */}
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
                              {getAgentInitials(recommendation.agent)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            {getAgentStatusIcon(agentStatus)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-lg">
                              {getAgentDisplayName(recommendation.agent)}
                            </h4>
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              <div className="flex items-center space-x-1">
                                {getPriorityIcon(recommendation.priority)}
                                <span>P{recommendation.priority}</span>
                              </div>
                            </Badge>
                            {isAgentBusy && (
                              <Badge variant="outline" className="text-xs">
                                {agentStatus}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{recommendation.reason}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            {recommendation.estimatedTime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{recommendation.estimatedTime}</span>
                              </div>
                            )}
                            {recommendation.prerequisites.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{recommendation.prerequisites.length} prerequisite(s)</span>
                              </div>
                            )}
                          </div>

                          {/* Prerequisites */}
                          {recommendation.prerequisites.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Prerequisites:
                              </p>
                              <ul className="text-xs space-y-1">
                                {recommendation.prerequisites.map((prereq, i) => (
                                  <li key={i} className="flex items-center space-x-1">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                    <span>{prereq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleDispatchClick(recommendation)}
                            disabled={loading || (isAgentBusy && recommendation.prerequisites.length > 0)}
                            className="w-24"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Dispatch
                          </Button>
                          
                          {/* IDE Launch Button */}
                          {(recommendation.agent === AgentType.Developer || 
                            recommendation.agent === AgentType.Architect ||
                            recommendation.agent === AgentType.UXExpert) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLaunchIDE(recommendation.agent, project.state.activeStory)}
                                    disabled={ideLoading || availableIDEs.length === 0}
                                    className="w-24"
                                  >
                                    <Code className="h-3 w-3 mr-1" />
                                    IDE
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Launch IDE with project context</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {isAgentBusy && (
                            <p className="text-xs text-yellow-600 text-center">
                              Agent busy
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Smart Actions */}
            {sortedRecommendations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const highPriorityRecs = sortedRecommendations.filter(r => r.priority >= 7);
                    if (highPriorityRecs.length > 0) {
                      handleDispatchClick(highPriorityRecs[0]);
                    }
                  }}
                  disabled={loading || !sortedRecommendations.some(r => r.priority >= 7)}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Dispatch Highest Priority
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const readyRecs = sortedRecommendations.filter(r => r.prerequisites.length === 0);
                    if (readyRecs.length > 0) {
                      handleDispatchClick(readyRecs[0]);
                    }
                  }}
                  disabled={loading || !sortedRecommendations.some(r => r.prerequisites.length === 0)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Dispatch Ready Agent
                </Button>

                {selectedRecommendations.size > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBulkDispatch}
                    disabled={loading}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Bulk Dispatch ({selectedRecommendations.size})
                  </Button>
                )}
              </div>
            )}

            {/* IDE Integration Section */}
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">IDE Integration</span>
                <Badge variant="secondary">{availableIDEs.length} IDEs</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (project.state.activeStory) {
                      handleLaunchIDE(AgentType.Developer, project.state.activeStory);
                    } else {
                      handleLaunchIDE(AgentType.Developer);
                    }
                  }}
                  disabled={ideLoading || availableIDEs.length === 0}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Launch for Current Story
                </Button>
                
                <Select onValueChange={(value) => handleLaunchIDE(value as AgentType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Launch for agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {[AgentType.Developer, AgentType.Architect, AgentType.UXExpert].map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {getAgentDisplayName(agent)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manual Override Section */}
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Manual Override</span>
              </div>
              <div className="flex items-center space-x-2">
                <Select onValueChange={(value) => handleManualDispatch(value as AgentType)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select agent to dispatch" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AgentType).filter(agent => agent !== AgentType.BMadOrchestrator).map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {getAgentDisplayName(agent)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRecommendations}
                  disabled={loading}
                >
                  <RotateCcw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Confirmation Dialog */}
      <Dialog open={dispatchDialog.isOpen} onOpenChange={(open) => 
        setDispatchDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Dispatch Agent</span>
            </DialogTitle>
            <DialogDescription>
              Send instructions to {dispatchDialog.agent && getAgentDisplayName(dispatchDialog.agent)}
            </DialogDescription>
          </DialogHeader>
          
          {dispatchDialog.recommendation && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Recommendation:</p>
                <p className="text-sm">{dispatchDialog.recommendation.reason}</p>
                {dispatchDialog.recommendation.estimatedTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated time: {dispatchDialog.recommendation.estimatedTime}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message to Agent
                </label>
                <Textarea
                  value={dispatchDialog.customMessage}
                  onChange={(e) => setDispatchDialog(prev => ({ 
                    ...prev, 
                    customMessage: e.target.value 
                  }))}
                  placeholder="Add any specific instructions or context..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDispatchDialog(prev => ({ ...prev, isOpen: false }))}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={executeDispatch} disabled={loading || !dispatchDialog.customMessage.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Dispatch Dialog */}
      <Dialog open={manualDispatchDialog.isOpen} onOpenChange={(open) => 
        setManualDispatchDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Manual Agent Assignment</span>
            </DialogTitle>
            <DialogDescription>
              Manually assign a task to {manualDispatchDialog.selectedAgent && getAgentDisplayName(manualDispatchDialog.selectedAgent)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">Manual Override</p>
              </div>
              <p className="text-xs text-yellow-700">
                This bypasses the intelligent recommendation system. Ensure the agent is available and the task is appropriate.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assignment Message
              </label>
              <Textarea
                value={manualDispatchDialog.customMessage}
                onChange={(e) => setManualDispatchDialog(prev => ({ 
                  ...prev, 
                  customMessage: e.target.value 
                }))}
                placeholder="Describe the task and any specific instructions..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManualDispatchDialog(prev => ({ ...prev, isOpen: false }))}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={executeManualDispatch} 
              disabled={loading || !manualDispatchDialog.customMessage.trim()}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};