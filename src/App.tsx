import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Bot, FolderCode, GraduationCap, Workflow, Building2 } from "lucide-react";
import { api, type Project, type Session, type ClaudeMdFile } from "@/lib/api";
import { BMadAPI, handleBMadError } from "@/lib/bmad-api";
import { OutputCacheProvider } from "@/lib/outputCache";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectList } from "@/components/ProjectList";
import { SessionList } from "@/components/SessionList";
import { Topbar } from "@/components/Topbar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ClaudeFileEditor } from "@/components/ClaudeFileEditor";
import { Settings } from "@/components/Settings";
import { CCAgents } from "@/components/CCAgents";
import { ClaudeCodeSession } from "@/components/ClaudeCodeSession";
import { UsageDashboard } from "@/components/UsageDashboard";
import { MCPManager } from "@/components/MCPManager";
import { NFOCredits } from "@/components/NFOCredits";
import { ClaudeBinaryDialog } from "@/components/ClaudeBinaryDialog";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { AgentRouterCoordination } from "@/components/AgentRouterCoordination";
import { EducationDashboard } from "@/components/EducationDashboard";
import { Academy } from "@/academy/components/Academy";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// BMAD Components
import { BMadProjectList } from "@/components/BMAD/ProjectManager";
import { WorkflowDisplay } from "@/components/BMAD/WorkflowDisplay";
import { CommunicationBoard } from "@/components/BMAD/CommunicationBoard";
import { ProjectCreator } from "@/components/BMAD/ProjectCreator";
import { AgentDispatcher } from "@/components/BMAD/AgentDispatcher";
import { BMadProject, BMadView } from "@/types/bmad";

type View = "welcome" | "projects" | "agents" | "editor" | "settings" | "claude-file-editor" | "claude-code-session" | "usage-dashboard" | "mcp" | "education" | "academy" | "bmad-projects" | "bmad-workflow" | "bmad-communication" | "bmad-agent-dispatch" | "bmad-creator";

/**
 * Main App component - Manages the Claude directory browser UI
 */
function App() {
  const [view, setView] = useState<View>("welcome");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingClaudeFile, setEditingClaudeFile] = useState<ClaudeMdFile | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNFO, setShowNFO] = useState(false);
  const [showClaudeBinaryDialog, setShowClaudeBinaryDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showCoordinationDialog, setShowCoordinationDialog] = useState(false);

  // BMAD State
  const [bmadProjects, setBmadProjects] = useState<BMadProject[]>([]);
  const [selectedBmadProject, setSelectedBmadProject] = useState<BMadProject | null>(null);
  const [bmadView, setBmadView] = useState<BMadView>({ type: 'projects' });

  // Load projects on mount when in projects view
  useEffect(() => {
    if (view === "projects") {
      loadProjects();
    } else if (view === "bmad-projects") {
      loadBmadProjects();
    } else if (view === "welcome") {
      // Reset loading state for welcome view
      setLoading(false);
    }
  }, [view]);

  // Listen for Claude session selection events
  useEffect(() => {
    const handleSessionSelected = (event: CustomEvent) => {
      const { session } = event.detail;
      setSelectedSession(session);
      setView("claude-code-session");
    };

    const handleClaudeNotFound = () => {
      setShowClaudeBinaryDialog(true);
    };

    window.addEventListener('claude-session-selected', handleSessionSelected as EventListener);
    window.addEventListener('claude-not-found', handleClaudeNotFound as EventListener);
    return () => {
      window.removeEventListener('claude-session-selected', handleSessionSelected as EventListener);
      window.removeEventListener('claude-not-found', handleClaudeNotFound as EventListener);
    };
  }, []);

  /**
   * Loads all projects from the ~/.claude/projects directory
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectList = await api.listProjects();
      setProjects(projectList);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load projects. Please ensure ~/.claude directory exists.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles project selection and loads its sessions
   */
  const handleProjectClick = async (project: Project) => {
    try {
      setLoading(true);
      setError(null);
      const sessionList = await api.getProjectSessions(project.id);
      setSessions(sessionList);
      setSelectedProject(project);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load sessions for this project.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens a new Claude Code session in the interactive UI
   */
  const handleNewSession = async () => {
    setView("claude-code-session");
    setSelectedSession(null);
  };

  /**
   * Returns to project list view
   */
  const handleBack = () => {
    setSelectedProject(null);
    setSessions([]);
  };

  /**
   * Handles editing a CLAUDE.md file from a project
   */
  const handleEditClaudeFile = (file: ClaudeMdFile) => {
    setEditingClaudeFile(file);
    setView("claude-file-editor");
  };

  /**
   * Returns from CLAUDE.md file editor to projects view
   */
  const handleBackFromClaudeFileEditor = () => {
    setEditingClaudeFile(null);
    setView("projects");
  };

  /**
   * Loads all BMAD projects
   */
  const loadBmadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectList = await BMadAPI.listProjects();
      setBmadProjects(projectList);
    } catch (err) {
      console.error("Failed to load BMAD projects:", err);
      setError("Failed to load BMAD projects. Please check your configuration.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles BMAD project selection
   */
  const handleBmadProjectClick = async (project: BMadProject) => {
    try {
      setSelectedBmadProject(project);
      setBmadView({ type: 'workflow', projectId: project.id });
      setView("bmad-workflow");
      await BMadAPI.setActiveProject(project.id);
    } catch (err) {
      console.error("Failed to select BMAD project:", err);
      setError("Failed to select BMAD project.");
    }
  };

  /**
   * Handles BMAD project creation
   */
  const handleBmadProjectCreated = (project: BMadProject) => {
    setBmadProjects(prev => [...prev, project]);
    setSelectedBmadProject(project);
    setBmadView({ type: 'workflow', projectId: project.id });
    setView("bmad-workflow");
  };

  /**
   * Handles BMAD project updates
   */
  const handleBmadProjectUpdate = (updatedProject: BMadProject) => {
    setBmadProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    if (selectedBmadProject?.id === updatedProject.id) {
      setSelectedBmadProject(updatedProject);
    }
  };

  /**
   * Returns to BMAD projects list
   */
  const handleBackToBmadProjects = () => {
    setSelectedBmadProject(null);
    setBmadView({ type: 'projects' });
    setView("bmad-projects");
  };

  const renderContent = () => {
    switch (view) {
      case "welcome":
        return (
          <div className="flex items-center justify-center p-4" style={{ height: "100%" }}>
            <div className="w-full max-w-4xl">
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
              >
                <h1 className="text-4xl font-bold tracking-tight">
                  <span className="rotating-symbol"></span>
                  Welcome to Organized AI
                </h1>
              </motion.div>

              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {/* BMAD Desktop Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card 
                    className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border/50 shimmer-hover bg-gradient-to-br from-orange-500/5 to-red-500/10"
                    onClick={() => setView("bmad-projects")}
                  >
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <Workflow className="h-16 w-16 mb-4 text-orange-600" />
                      <h2 className="text-xl font-semibold mb-2">BMAD Desktop</h2>
                      <p className="text-sm text-muted-foreground">Breakthrough Method for Agile AI-Driven Development</p>
                    </div>
                  </Card>
                </motion.div>

                {/* CC Agents Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card 
                    className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border/50 shimmer-hover"
                    onClick={() => setView("agents")}
                  >
                    <div className="h-full flex flex-col items-center justify-center p-8">
                      <Bot className="h-16 w-16 mb-4 text-primary" />
                      <h2 className="text-xl font-semibold">CC Agents</h2>
                    </div>
                  </Card>
                </motion.div>

                {/* CC Projects Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card 
                    className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border/50 shimmer-hover"
                    onClick={() => setView("projects")}
                  >
                    <div className="h-full flex flex-col items-center justify-center p-8">
                      <FolderCode className="h-16 w-16 mb-4 text-primary" />
                      <h2 className="text-xl font-semibold">CC Projects</h2>
                    </div>
                  </Card>
                </motion.div>

                {/* Agent Journey Academy Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card 
                    className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border/50 shimmer-hover bg-gradient-to-br from-blue-500/5 to-purple-500/10"
                    onClick={() => setView("academy")}
                  >
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <GraduationCap className="h-16 w-16 mb-4 text-blue-600" />
                      <h2 className="text-xl font-semibold mb-2">Agent Journey Academy</h2>
                      <p className="text-sm text-muted-foreground">Master AI agent development through interactive lessons</p>
                    </div>
                  </Card>
                </motion.div>

              </div>
            </div>
          </div>
        );

      case "agents":
        return (
          <div className="flex-1 overflow-hidden">
            <CCAgents onBack={() => setView("welcome")} />
          </div>
        );

      case "editor":
        return (
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor onBack={() => setView("welcome")} />
          </div>
        );
      
      case "settings":
        return (
          <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            <Settings onBack={() => setView("welcome")} />
          </div>
        );
      
      case "projects":
        return (
          <div className="flex h-full items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl">
              {/* Header with back button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("welcome")}
                  className="mb-4"
                >
                  ← Back to Home
                </Button>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight">CC Projects</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse your Claude Code sessions
                  </p>
                </div>
              </motion.div>

              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </motion.div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Content */}
              {!loading && (
                <AnimatePresence mode="wait">
                  {selectedProject ? (
                    <motion.div
                      key="sessions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SessionList
                        sessions={sessions}
                        projectPath={selectedProject.path}
                        onBack={handleBack}
                        onEditClaudeFile={handleEditClaudeFile}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* New session button at the top */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Button
                          onClick={handleNewSession}
                          size="default"
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          New Claude Code session
                        </Button>
                      </motion.div>

                      {/* Project list */}
                      {projects.length > 0 ? (
                        <ProjectList
                          projects={projects}
                          onProjectClick={handleProjectClick}
                        />
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-muted-foreground">
                            No projects found in ~/.claude/projects
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        );
      
      case "claude-file-editor":
        return editingClaudeFile ? (
          <ClaudeFileEditor
            file={editingClaudeFile}
            onBack={handleBackFromClaudeFileEditor}
          />
        ) : null;
      
      case "claude-code-session":
        return (
          <ClaudeCodeSession
            session={selectedSession || undefined}
            onBack={() => {
              setSelectedSession(null);
              setView("projects");
            }}
          />
        );
      
      case "usage-dashboard":
        return (
          <UsageDashboard onBack={() => setView("welcome")} />
        );
      
      case "mcp":
        return (
          <MCPManager onBack={() => setView("welcome")} />
        );
      
      case "education":
        return (
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <EducationDashboard />
            </div>
          </div>
        );

      case "academy":
        return (
          <div className="flex-1 overflow-hidden">
            <Academy onBack={() => setView("welcome")} />
          </div>
        );

      case "bmad-projects":
        return (
          <div className="flex h-full items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl">
              {/* Header with back button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("welcome")}
                  className="mb-4"
                >
                  ← Back to Home
                </Button>
                <div className="text-center">
                  <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                    <Workflow className="h-8 w-8 text-orange-600" />
                    BMAD Projects
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Breakthrough Method for Agile AI-Driven Development
                  </p>
                </div>
              </motion.div>

              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </motion.div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Content */}
              {!loading && (
                <div className="space-y-4">
                  {/* New project button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      onClick={() => setView("bmad-creator")}
                      size="default"
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New BMAD Project
                    </Button>
                  </motion.div>

                  {/* Project list */}
                  {bmadProjects.length > 0 ? (
                    <BMadProjectList
                      projects={bmadProjects}
                      onProjectClick={handleBmadProjectClick}
                      activeProjectId={selectedBmadProject?.id}
                    />
                  ) : (
                    <div className="py-8 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-muted-foreground mb-2">
                        No BMAD projects found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first BMAD project to get started with structured AI development
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "bmad-creator":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <ProjectCreator
              onProjectCreated={handleBmadProjectCreated}
              onCancel={() => setView("bmad-projects")}
            />
          </div>
        );

      case "bmad-workflow":
        return selectedBmadProject ? (
          <div className="flex-1 overflow-y-auto p-6">
            <WorkflowDisplay
              project={selectedBmadProject}
              onProjectUpdate={handleBmadProjectUpdate}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBackToBmadProjects}
              >
                ← Back to Projects
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setView("bmad-communication")}
                >
                  Messages
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setView("bmad-agent-dispatch")}
                >
                  Dispatch Agents
                </Button>
              </div>
            </div>
          </div>
        ) : null;

      case "bmad-communication":
        return selectedBmadProject ? (
          <div className="flex-1 overflow-y-auto p-6">
            <CommunicationBoard
              project={selectedBmadProject}
              onMessageUpdate={(messages) => {
                if (selectedBmadProject) {
                  const updatedProject = {
                    ...selectedBmadProject,
                    communications: messages
                  };
                  handleBmadProjectUpdate(updatedProject);
                }
              }}
            />
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setView("bmad-workflow")}
              >
                ← Back to Workflow
              </Button>
            </div>
          </div>
        ) : null;

      case "bmad-agent-dispatch":
        return selectedBmadProject ? (
          <div className="flex-1 overflow-y-auto p-6">
            <AgentDispatcher
              project={selectedBmadProject}
              onDispatch={(agent, message) => {
                setToast({
                  message: `${agent} dispatched successfully`,
                  type: "success"
                });
              }}
            />
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setView("bmad-workflow")}
              >
                ← Back to Workflow
              </Button>
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <OutputCacheProvider>
      <div className="h-screen bg-background flex flex-col">
        {/* Topbar */}
        <Topbar
          onClaudeClick={() => setView("editor")}
          onSettingsClick={() => setView("settings")}
          onUsageClick={() => setView("usage-dashboard")}
          onMCPClick={() => setView("mcp")}
          onInfoClick={() => setShowNFO(true)}
          onCoordinationClick={() => setShowCoordinationDialog(true)}
          onEducationClick={() => setView("education")}
          onBmadClick={() => setView("bmad-projects")}
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        
        {/* NFO Credits Modal */}
        {showNFO && <NFOCredits onClose={() => setShowNFO(false)} />}
        
        {/* Claude Binary Dialog */}
        <ClaudeBinaryDialog
          open={showClaudeBinaryDialog}
          onOpenChange={setShowClaudeBinaryDialog}
          onSuccess={() => {
            setToast({ message: "Claude binary path saved successfully", type: "success" });
            // Trigger a refresh of the Claude version check
            window.location.reload();
          }}
          onError={(message) => setToast({ message, type: "error" })}
        />
        
        {/* Global Coordination Dialog */}
        <Dialog open={showCoordinationDialog} onOpenChange={setShowCoordinationDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Coordinate Agents</DialogTitle>
              <DialogDescription>
                Execute coordinated tasks across multiple agents from anywhere in the application.
              </DialogDescription>
            </DialogHeader>
            <AgentRouterCoordination onClose={() => setShowCoordinationDialog(false)} />
          </DialogContent>
        </Dialog>
        
        {/* Toast Container */}
        <ToastContainer>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onDismiss={() => setToast(null)}
            />
          )}
        </ToastContainer>
      </div>
    </OutputCacheProvider>
  );
}

export default App;
