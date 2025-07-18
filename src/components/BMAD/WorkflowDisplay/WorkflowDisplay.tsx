import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BMadAPI, handleBMadError } from "@/lib/bmad-api";
import { useToast } from "@/components/ui/use-toast";
import { 
  BMadProject, 
  AgentRecommendation, 
  BMadPhase,
  AgentType 
} from "@/types/bmad";

import { PhaseIndicator } from "./PhaseIndicator";
import { StoryStatus } from "./StoryStatus";
import { AgentQueue } from "./AgentQueue";

interface WorkflowDisplayProps {
  project: BMadProject;
  onProjectUpdate?: (project: BMadProject) => void;
  className?: string;
}

/**
 * WorkflowDisplay component - Main workflow visualization dashboard
 * Combines phase indicators, story status, and agent queue
 */
export const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({
  project,
  onProjectUpdate,
  className,
}) => {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, [project.id, project.state.currentPhase]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const recs = await BMadAPI.getAgentRecommendations(project.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load agent recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseTransition = async (phase: BMadPhase) => {
    try {
      // For now, use BMadOrchestrator as the trigger agent
      // In a real implementation, this would be determined by context
      await BMadAPI.transitionPhase(project.id, phase, AgentType.BMadOrchestrator);
      
      // Reload project to get updated state
      const updatedProject = await BMadAPI.getProject(project.id);
      onProjectUpdate?.(updatedProject);
      
      toast({
        title: "Phase Transition",
        description: `Successfully transitioned to ${phase} phase`,
      });
      
      // Reload recommendations for new phase
      await loadRecommendations();
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Transition Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    }
  };

  const handleStoryClick = (storyName: string) => {
    // In a real implementation, this would open story details
    // For now, just show a toast
    toast({
      title: "Story Details",
      description: `Opening details for: ${storyName}`,
    });
  };

  const handleAgentDispatch = async (agent: AgentType) => {
    try {
      // Find the recommendation for this agent
      const recommendation = recommendations.find(r => r.agent === agent);
      if (!recommendation) return;

      // For now, we'll simulate dispatching by showing a toast
      // In a real implementation, this would trigger the agent
      toast({
        title: "Agent Dispatched",
        description: `${agent} has been dispatched: ${recommendation.reason}`,
      });

      // Reload recommendations
      await loadRecommendations();
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Dispatch Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    }
  };

  const handleViewAgent = (agent: AgentType) => {
    // In a real implementation, this would open agent details
    toast({
      title: "Agent Details",
      description: `Opening details for: ${agent}`,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Project Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{project.name}</h2>
        <p className="text-muted-foreground">{project.path}</p>
      </div>

      {/* Main Workflow Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Phase Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8"
        >
          <PhaseIndicator
            projectState={project.state}
            onPhaseClick={handlePhaseTransition}
          />
        </motion.div>

        {/* Right Column - Agent Queue */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4"
        >
          <AgentQueue
            projectState={project.state}
            recommendations={recommendations}
            onDispatchAgent={handleAgentDispatch}
            onViewAgent={handleViewAgent}
          />
        </motion.div>
      </div>

      {/* Bottom Row - Story Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StoryStatus
          projectState={project.state}
          onStoryClick={handleStoryClick}
        />
      </motion.div>

      {/* Workflow Summary */}
      {project.state.workflowHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 border-t"
        >
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-2">
              {project.state.workflowHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.agent} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};