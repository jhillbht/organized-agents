import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Circle, 
  ArrowRight,
  FileText,
  Code,
  Bug,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  BMadPhase, 
  ProjectState,
  getPhaseDisplayName,
  getPhaseColor 
} from "@/types/bmad";

interface PhaseIndicatorProps {
  projectState: ProjectState;
  onPhaseClick?: (phase: BMadPhase) => void;
  className?: string;
}

const PHASE_ORDER: BMadPhase[] = [
  BMadPhase.Planning,
  BMadPhase.StoryCreation,
  BMadPhase.Development,
  BMadPhase.QualityAssurance,
  BMadPhase.Complete,
];

const getPhaseIcon = (phase: BMadPhase, isActive: boolean, isCompleted: boolean) => {
  const iconClass = cn(
    "h-5 w-5 transition-colors",
    isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground"
  );

  switch (phase) {
    case BMadPhase.Planning:
      return <FileText className={iconClass} />;
    case BMadPhase.StoryCreation:
      return <FileText className={iconClass} />;
    case BMadPhase.Development:
      return <Code className={iconClass} />;
    case BMadPhase.QualityAssurance:
      return <Bug className={iconClass} />;
    case BMadPhase.Complete:
      return <Trophy className={iconClass} />;
  }
};

const getPhaseProgress = (phase: BMadPhase, currentPhase: BMadPhase): 'completed' | 'active' | 'pending' => {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  
  if (phaseIndex < currentIndex) return 'completed';
  if (phaseIndex === currentIndex) return 'active';
  return 'pending';
};

/**
 * PhaseIndicator component - Visual representation of BMAD workflow phases
 */
export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  projectState,
  onPhaseClick,
  className,
}) => {
  const currentPhase = projectState.currentPhase;
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Phase Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Progress</h3>
          <p className="text-sm text-muted-foreground">
            Current Phase: {getPhaseDisplayName(currentPhase)}
          </p>
        </div>
        <Badge className={getPhaseColor(currentPhase)}>
          {getPhaseDisplayName(currentPhase)}
        </Badge>
      </div>

      {/* Phase Flow Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {PHASE_ORDER.map((phase, index) => {
            const progress = getPhaseProgress(phase, currentPhase);
            const isClickable = onPhaseClick && progress !== 'pending';
            
            return (
              <React.Fragment key={phase}>
                {/* Phase Step */}
                <motion.div
                  className={cn(
                    "flex flex-col items-center space-y-2 relative z-10",
                    isClickable && "cursor-pointer group"
                  )}
                  onClick={() => isClickable && onPhaseClick(phase)}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {/* Phase Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                      progress === 'completed' && "border-green-500 bg-green-50",
                      progress === 'active' && "border-primary bg-primary/10 ring-4 ring-primary/20",
                      progress === 'pending' && "border-muted-foreground bg-muted",
                      isClickable && "group-hover:shadow-md"
                    )}
                  >
                    {progress === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      getPhaseIcon(phase, progress === 'active', progress === 'completed')
                    )}
                  </div>
                  
                  {/* Phase Label */}
                  <div className="text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      progress === 'active' && "text-primary",
                      progress === 'completed' && "text-green-600",
                      progress === 'pending' && "text-muted-foreground"
                    )}>
                      {getPhaseDisplayName(phase)}
                    </p>
                  </div>
                </motion.div>
                
                {/* Arrow Connector */}
                {index < PHASE_ORDER.length - 1 && (
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        getPhaseProgress(PHASE_ORDER[index + 1], currentPhase) !== 'pending' 
                          ? "text-green-500" 
                          : "text-muted-foreground"
                      )} 
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Progress Line Background */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-10" />
        <div 
          className="absolute top-6 left-6 h-0.5 bg-green-500 -z-10 transition-all duration-500"
          style={{
            width: `${(PHASE_ORDER.indexOf(currentPhase) / (PHASE_ORDER.length - 1)) * 100}%`
          }}
        />
      </div>

      {/* Current Phase Details */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {getPhaseIcon(currentPhase, true, false)}
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">
              {getPhaseDisplayName(currentPhase)} Phase
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {getPhaseDescription(currentPhase)}
            </p>
            
            {/* Active Story */}
            {projectState.activeStory && (
              <div className="flex items-center space-x-2 text-xs">
                <Circle className="h-3 w-3 text-primary fill-current" />
                <span className="font-medium">Active Story:</span>
                <span>{projectState.activeStory}</span>
              </div>
            )}
            
            {/* Next Actions */}
            {projectState.nextActions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Next Actions:
                </p>
                <ul className="text-xs space-y-1">
                  {projectState.nextActions.slice(0, 2).map((action, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <Circle className="h-2 w-2 text-muted-foreground" />
                      <span>{action.task}</span>
                      {action.estimatedTime && (
                        <span className="text-muted-foreground">
                          ({action.estimatedTime})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getPhaseDescription(phase: BMadPhase): string {
  switch (phase) {
    case BMadPhase.Planning:
      return "Define project vision, requirements, and technical architecture.";
    case BMadPhase.StoryCreation:
      return "Break down requirements into development stories and prioritize them.";
    case BMadPhase.Development:
      return "Implement features according to stories and architecture design.";
    case BMadPhase.QualityAssurance:
      return "Test implementation and ensure quality standards are met.";
    case BMadPhase.Complete:
      return "Project completed successfully and ready for deployment.";
  }
}