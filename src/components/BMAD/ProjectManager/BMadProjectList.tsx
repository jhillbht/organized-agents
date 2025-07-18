import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FolderOpen, 
  ChevronRight, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Pause
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { 
  BMadProject, 
  BMadPhase, 
  ProjectStateType,
  getPhaseDisplayName,
  getPhaseColor
} from "@/types/bmad";

interface BMadProjectListProps {
  /**
   * Array of BMAD projects to display
   */
  projects: BMadProject[];
  /**
   * Callback when a project is clicked
   */
  onProjectClick: (project: BMadProject) => void;
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Currently active project ID
   */
  activeProjectId?: string;
}

const ITEMS_PER_PAGE = 6;

/**
 * BMadProjectList component - Displays a paginated list of BMAD projects with workflow status
 * 
 * @example
 * <BMadProjectList
 *   projects={bmadProjects}
 *   onProjectClick={(project) => setActiveProject(project)}
 *   activeProjectId={activeProject?.id}
 * />
 */
export const BMadProjectList: React.FC<BMadProjectListProps> = ({
  projects,
  onProjectClick,
  className,
  activeProjectId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);
  
  // Reset to page 1 if projects change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  const getProjectStatusIcon = (project: BMadProject) => {
    switch (project.state.projectState) {
      case ProjectStateType.Complete:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ProjectStateType.Development:
      case ProjectStateType.Planning:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case ProjectStateType.QualityAssurance:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case ProjectStateType.OnHold:
        return <Pause className="h-4 w-4 text-gray-500" />;
      case ProjectStateType.Archived:
        return <FolderOpen className="h-4 w-4 text-gray-400" />;
      default:
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActiveAgents = (project: BMadProject): number => {
    const agents = project.state.agents;
    return Object.values(agents).filter(agent => agent.status === 'Active').length;
  };

  const formatLastModified = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        {currentProjects.map((project, index) => {
          const isActive = project.id === activeProjectId;
          const activeAgents = getActiveAgents(project);
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <Card
                className={cn(
                  "transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                  isActive && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => onProjectClick(project)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getProjectStatusIcon(project)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {project.path}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          {/* Current Phase */}
                          <Badge className={getPhaseColor(project.state.currentPhase)}>
                            {getPhaseDisplayName(project.state.currentPhase)}
                          </Badge>
                          
                          {/* Active Story */}
                          {project.state.activeStory && (
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <PlayCircle className="h-3 w-3" />
                              <span className="truncate max-w-32">
                                {project.state.activeStory}
                              </span>
                            </div>
                          )}
                          
                          {/* Active Agents */}
                          {activeAgents > 0 && (
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{activeAgents} agent{activeAgents !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          
                          {/* Last Modified */}
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatLastModified(project.lastModified)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Unread Messages Count */}
                      {project.communications.filter(msg => msg.status === 'Pending').length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {project.communications.filter(msg => msg.status === 'Pending').length}
                        </Badge>
                      )}
                      
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No BMAD projects found
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a new project or discover existing ones to get started.
          </p>
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};