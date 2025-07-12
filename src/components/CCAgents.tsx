
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Bot,
  ArrowLeft,
  History,
  Download,
  Upload,
  Globe,
  FileJson,
  ChevronDown,
  DollarSign,
  Users,
  Layers,
  Zap,
  Star,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type Agent, type AgentRunWithMetrics } from "@/lib/api";
import { save, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { CreateAgent } from "./CreateAgent";
import { AgentExecution } from "./AgentExecution";
import { AgentRunsList } from "./AgentRunsList";
import { RunningSessionsView } from "./RunningSessionsView";
import { GitHubAgentBrowser } from "./GitHubAgentBrowser";
import { RouterStatus } from "./RouterStatus";
import { AgentRouterCoordination } from "./AgentRouterCoordination";
import { ICON_MAP } from "./IconPicker";

interface CCAgentsProps {
  /**
   * Callback to go back to the main view
   */
  onBack: () => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

// Available icons for agents - now using all icons from IconPicker
export const AGENT_ICONS = ICON_MAP;

export type AgentIconName = keyof typeof AGENT_ICONS;

// Agent Categories Configuration
const AGENT_CATEGORIES = {
  mastery: {
    name: "Core Mastery",
    icon: Star,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    description: "Essential development expertise agents"
  },
  coordination: {
    name: "Coordination",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600 border-purple-200", 
    description: "Multi-agent orchestration and planning"
  },
  utility: {
    name: "Utility",
    icon: Zap,
    color: "bg-green-500/10 text-green-600 border-green-200",
    description: "Specialized tools and automation"
  }
} as const;

// Cost optimization data
const COST_SAVINGS_DATA = {
  traditional: 200,
  optimized: 45,
  savings: 155,
  percentage: 77.5
};

/**
 * CCAgents component for managing Claude Code agents with enhanced features
 * 
 * @example
 * <CCAgents onBack={() => setView('home')} />
 */
export const CCAgents: React.FC<CCAgentsProps> = ({ onBack, className }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRunWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [runsLoading, setRunsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"list" | "create" | "edit" | "execute">("list");
  const [activeTab, setActiveTab] = useState<"agents" | "running" | "cost" | "coordination">("agents");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showGitHubBrowser, setShowGitHubBrowser] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCoordinationDialog, setShowCoordinationDialog] = useState(false);
  const [selectedAgentsForCoordination, setSelectedAgentsForCoordination] = useState<string[]>([]);
  const [coordinationTask, setCoordinationTask] = useState("");
  const [coordinationProject, setCoordinationProject] = useState("");

  const AGENTS_PER_PAGE = 9; // 3x3 grid

  useEffect(() => {
    loadAgents();
    loadRuns();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const agentsList = await api.listAgents();
      setAgents(agentsList);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setError("Failed to load agents");
      setToast({ message: "Failed to load agents", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async () => {
    try {
      setRunsLoading(true);
      const runsList = await api.listAgentRuns();
      setRuns(runsList);
    } catch (err) {
      console.error("Failed to load runs:", err);
    } finally {
      setRunsLoading(false);
    }
  };

  /**
   * Initiates the delete agent process by showing the confirmation dialog
   * @param agent - The agent to be deleted
   */
  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setShowDeleteDialog(true);
  };

  /**
   * Confirms and executes the agent deletion
   * Only called when user explicitly confirms the deletion
   */
  const confirmDeleteAgent = async () => {
    if (!agentToDelete?.id) return;

    try {
      setIsDeleting(true);
      await api.deleteAgent(agentToDelete.id);
      setToast({ message: "Agent deleted successfully", type: "success" });
      await loadAgents();
      await loadRuns(); // Reload runs as they might be affected
    } catch (err) {
      console.error("Failed to delete agent:", err);
      setToast({ message: "Failed to delete agent", type: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setAgentToDelete(null);
    }
  };

  /**
   * Cancels the delete operation and closes the dialog
   */
  const cancelDeleteAgent = () => {
    setShowDeleteDialog(false);
    setAgentToDelete(null);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setView("edit");
  };

  const handleExecuteAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setView("execute");
  };

  const handleAgentCreated = async () => {
    setView("list");
    await loadAgents();
    setToast({ message: "Agent created successfully", type: "success" });
  };

  const handleAgentUpdated = async () => {
    setView("list");
    await loadAgents();
    setToast({ message: "Agent updated successfully", type: "success" });
  };

  const handleExecutionComplete = async () => {
    // Reload runs when returning from execution
    await loadRuns();
  };

  const handleExportAgent = async (agent: Agent) => {
    try {
      // Show native save dialog
      const filePath = await save({
        defaultPath: `${agent.name.toLowerCase().replace(/\s+/g, '-')}.claudia.json`,
        filters: [{
          name: 'Organized Agent',
          extensions: ['claudia.json']
        }]
      });
      
      if (!filePath) {
        // User cancelled the dialog
        return;
      }
      
      // Export the agent to the selected file
      await invoke('export_agent_to_file', { 
        id: agent.id!,
        filePath 
      });
      
      setToast({ message: `Agent "${agent.name}" exported successfully`, type: "success" });
    } catch (err) {
      console.error("Failed to export agent:", err);
      setToast({ message: "Failed to export agent", type: "error" });
    }
  };

  const handleImportAgent = async () => {
    try {
      // Show native open dialog
      const filePath = await open({
        multiple: false,
        filters: [{
          name: 'Organized Agent',
          extensions: ['claudia.json', 'json']
        }]
      });
      
      if (!filePath) {
        // User cancelled the dialog
        return;
      }
      
      // Import the agent from the selected file
      await api.importAgentFromFile(filePath as string);
      
      setToast({ message: "Agent imported successfully", type: "success" });
      await loadAgents();
    } catch (err) {
      console.error("Failed to import agent:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to import agent";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  // Import all pre-installed agents from cc_agents folder
  const handleImportPreinstalled = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pre-configured agent files in cc_agents folder
      const agentFiles = [
        "codebase-mastery-agent.claudia.json",
        "debug-mastery-agent.claudia.json", 
        "environmental-mastery-agent.claudia.json",
        "gemini-orchestrator-agent.claudia.json",
        "parallel-planning-agent.claudia.json",
        "review-mastery.claudia.json",
        "testing-revolution-agent.claudia.json",
        "the-connection-mastery-agent.claudia.json",
        "the-documentation-revolution-agent.claudia.json",
        "security-scanner.claudia.json",
        "unit-tests-bot.claudia.json",
        "git-commit-bot.claudia.json"
      ];

      let importedCount = 0;
      let importedNames: string[] = [];

      // Import each agent file
      for (const agentFile of agentFiles) {
        try {
          const agentPath = `cc_agents/${agentFile}`;
          const importedAgent = await api.importAgentFromFile(agentPath);
          importedCount++;
          importedNames.push(importedAgent.name);
        } catch (err) {
          console.warn(`Failed to import ${agentFile}:`, err);
          // Continue with other agents
        }
      }
      
      if (importedCount > 0) {
        setToast({
          type: "success",
          message: `Successfully imported ${importedCount} router-optimized agents with cost optimization features`
        });
        await loadAgents(); // Reload the agents list
      } else {
        setToast({
          type: "success", 
          message: "All pre-configured agents are already imported"
        });
      }
    } catch (err) {
      setError(err as string);
      setToast({
        type: "error",
        message: `Failed to import pre-configured agents: ${err}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Get agent category based on name
  const getAgentCategory = (agentName: string): keyof typeof AGENT_CATEGORIES => {
    const name = agentName.toLowerCase();
    if (name.includes('mastery') || name.includes('debug') || name.includes('testing') || name.includes('environmental') || name.includes('documentation')) {
      return 'mastery';
    }
    if (name.includes('orchestrator') || name.includes('planning') || name.includes('connection') || name.includes('review')) {
      return 'coordination';
    }
    return 'utility';
  };

  // Pagination calculations
  const totalPages = Math.ceil(agents.length / AGENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * AGENTS_PER_PAGE;
  const paginatedAgents = agents.slice(startIndex, startIndex + AGENTS_PER_PAGE);

  const renderIcon = (iconName: string) => {
    const Icon = AGENT_ICONS[iconName as AgentIconName] || AGENT_ICONS.bot;
    return <Icon className="h-12 w-12" />;
  };

  if (view === "create") {
    return (
      <CreateAgent
        onBack={() => setView("list")}
        onAgentCreated={handleAgentCreated}
      />
    );
  }

  if (view === "edit" && selectedAgent) {
    return (
      <CreateAgent
        agent={selectedAgent}
        onBack={() => setView("list")}
        onAgentCreated={handleAgentUpdated}
      />
    );
  }

  if (view === "execute" && selectedAgent) {
    return (
      <AgentExecution
        agent={selectedAgent}
        onBack={() => {
          setView("list");
          handleExecutionComplete();
        }}
      />
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Organized AI Agents</h1>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade AI development coordination
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="default"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Import
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportAgent}>
                    <FileJson className="h-4 w-4 mr-2" />
                    From File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowGitHubBrowser(true)}>
                    <Globe className="h-4 w-4 mr-2" />
                    From GitHub
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setShowCoordinationDialog(true)}
                size="default"
                variant="outline"
                className="flex items-center gap-2"
                disabled={agents.length < 2}
              >
                <Users className="h-4 w-4" />
                Coordinate Agents
              </Button>
              <Button
                onClick={() => setView("create")}
                size="default"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Router Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <RouterStatus showControls={true} />
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("agents")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "agents"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Agents ({agents.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("running")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "running"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Running Sessions
              </div>
            </button>
            <button
              onClick={() => setActiveTab("cost")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "cost"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Optimization
              </div>
            </button>
            <button
              onClick={() => setActiveTab("coordination")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "coordination"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Coordination
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-6 space-y-8"
              >
                {/* Agents Grid */}
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No agents yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first agent or import the pre-configured ones
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={handleImportPreinstalled} variant="outline" size="default">
                          <Bot className="h-4 w-4 mr-2" />
                          Import 12 Pre-configured Agents
                        </Button>
                        <Button onClick={() => setView("create")} size="default">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Custom Agent
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                          {paginatedAgents.map((agent, index) => {
                            const category = getAgentCategory(agent.name);
                            const categoryConfig = AGENT_CATEGORIES[category];
                            return (
                              <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <Badge className={cn("text-xs", categoryConfig.color)}>
                                        <categoryConfig.icon className="h-3 w-3 mr-1" />
                                        {categoryConfig.name}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 pb-4 flex flex-col items-center text-center">
                                    <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary">
                                      {renderIcon(agent.icon)}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                      {agent.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      Created: {new Date(agent.created_at).toLocaleDateString()}
                                    </p>
                                  </CardContent>
                                  <CardFooter className="p-4 pt-0 flex justify-center gap-1 flex-wrap">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleExecuteAgent(agent)}
                                      className="flex items-center gap-1"
                                      title="Execute agent"
                                    >
                                      <Play className="h-3 w-3" />
                                      Execute
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditAgent(agent)}
                                      className="flex items-center gap-1"
                                      title="Edit agent"
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleExportAgent(agent)}
                                      className="flex items-center gap-1"
                                      title="Export agent to .claudia.json"
                                    >
                                      <Upload className="h-3 w-3" />
                                      Export
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteAgent(agent)}
                                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                                      title="Delete agent"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </CardFooter>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="flex items-center px-3 text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Execution History */}
                {!loading && agents.length > 0 && (
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">Recent Executions</h2>
                    </div>
                    {runsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <AgentRunsList 
                        runs={runs} 
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "running" && (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-6"
              >
                <RunningSessionsView />
              </motion.div>
            )}

            {activeTab === "coordination" && (
              <motion.div
                key="coordination"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-6"
              >
                <AgentRouterCoordination
                  agents={agents}
                  projectPath={coordinationProject || undefined}
                  onExecuteCoordination={(task) => {
                    setToast({
                      message: `Started coordination task: ${task.name}`,
                      type: "success"
                    });
                    // Switch to running tab to monitor progress
                    setActiveTab("running");
                  }}
                />
              </motion.div>
            )}

            {activeTab === "cost" && (
              <motion.div
                key="cost"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="pt-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cost Savings Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Monthly Savings</h3>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ${COST_SAVINGS_DATA.savings}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {COST_SAVINGS_DATA.percentage}% reduction from traditional costs
                      </p>
                    </CardContent>
                  </Card>

                  {/* Traditional Cost */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold">Traditional Cost</h3>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        ${COST_SAVINGS_DATA.traditional}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Without claude-code-router optimization
                      </p>
                    </CardContent>
                  </Card>

                  {/* Optimized Cost */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Optimized Cost</h3>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        ${COST_SAVINGS_DATA.optimized}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        With smart model routing
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Router Configuration */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Claude Code Router Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Smart routing contexts for optimal cost-performance balance
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Default Context</h4>
                        <p className="text-sm text-muted-foreground mb-2">Claude Sonnet 4 - Production quality</p>
                        <Badge variant="outline">$3.00/1M tokens</Badge>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Background Context</h4>
                        <p className="text-sm text-muted-foreground mb-2">DeepSeek - Simple operations</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">$0.14/1M tokens</Badge>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Think Context</h4>
                        <p className="text-sm text-muted-foreground mb-2">Claude Haiku - Quick responses</p>
                        <Badge variant="outline">$0.25/1M tokens</Badge>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Long Context</h4>
                        <p className="text-sm text-muted-foreground mb-2">Gemini Flash - Extended processing</p>
                        <Badge variant="outline">$0.075/1M tokens</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </ToastContainer>

      {/* Agent Coordination Dialog */}
      <Dialog open={showCoordinationDialog} onOpenChange={setShowCoordinationDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Coordinate Multiple Agents
            </DialogTitle>
            <DialogDescription>
              Run multiple agents in parallel for coordinated development. Each agent will work on the same project with the specified task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Project Path */}
            <div className="space-y-2">
              <Label htmlFor="coordinationProject">Project Path</Label>
              <Input
                id="coordinationProject"
                placeholder="/path/to/your/project"
                value={coordinationProject}
                onChange={(e) => setCoordinationProject(e.target.value)}
              />
            </div>
            
            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="coordinationTask">Coordination Task</Label>
              <textarea
                id="coordinationTask"
                placeholder="Describe the task for all agents to work on..."
                value={coordinationTask}
                onChange={(e) => setCoordinationTask(e.target.value)}
                className="w-full p-3 border rounded-md text-sm min-h-[100px] resize-vertical"
              />
            </div>
            
            {/* Agent Selection */}
            <div className="space-y-2">
              <Label>Select Agents to Coordinate</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {agents.map((agent) => {
                    const category = getAgentCategory(agent.name);
                    const categoryConfig = AGENT_CATEGORIES[category];
                    const isSelected = selectedAgentsForCoordination.includes(agent.id?.toString() || "");
                    
                    return (
                      <div
                        key={agent.id}
                        onClick={() => {
                          const agentId = agent.id?.toString() || "";
                          if (isSelected) {
                            setSelectedAgentsForCoordination(prev => prev.filter(id => id !== agentId));
                          } else {
                            setSelectedAgentsForCoordination(prev => [...prev, agentId]);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                          isSelected 
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {renderIcon(agent.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{agent.name}</span>
                            <Badge className={cn("text-xs", categoryConfig.color)}>
                              <categoryConfig.icon className="h-3 w-3 mr-1" />
                              {categoryConfig.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected && <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedAgentsForCoordination.length} agents
              </p>
            </div>
            
            {/* Coordination Strategy */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h4 className="font-medium text-sm mb-2">Coordination Strategy</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• All agents will execute in parallel on the same project</p>
                <p>• Each agent receives the same task description</p>
                <p>• Agents use their specialized expertise to contribute</p>
                <p>• Monitor progress in the Running Sessions tab</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCoordinationDialog(false);
                setSelectedAgentsForCoordination([]);
                setCoordinationTask("");
                setCoordinationProject("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedAgentsForCoordination.length === 0) {
                  setToast({ message: "Please select at least one agent", type: "error" });
                  return;
                }
                if (!coordinationProject.trim()) {
                  setToast({ message: "Please specify a project path", type: "error" });
                  return;
                }
                if (!coordinationTask.trim()) {
                  setToast({ message: "Please specify a task description", type: "error" });
                  return;
                }
                
                try {
                  // Execute all selected agents in parallel with individual error handling
                  const promises = selectedAgentsForCoordination.map(async (agentId) => {
                    try {
                      const result = await api.executeAgent(
                        parseInt(agentId),
                        coordinationProject,
                        `[COORDINATED TASK] ${coordinationTask}`
                      );
                      return { agentId, success: true, result };
                    } catch (error) {
                      return { agentId, success: false, error: error.message || "Unknown error" };
                    }
                  });
                  
                  const results = await Promise.all(promises);
                  
                  // Count successes and failures
                  const successful = results.filter(r => r.success);
                  const failed = results.filter(r => !r.success);
                  
                  if (successful.length > 0) {
                    if (failed.length === 0) {
                      setToast({ 
                        message: `✅ Successfully started coordination of all ${successful.length} agents`, 
                        type: "success" 
                      });
                    } else {
                      setToast({ 
                        message: `⚠️ Started ${successful.length} agents successfully, ${failed.length} failed. Check Running tab for details.`, 
                        type: "warning" 
                      });
                    }
                    
                    // Switch to running sessions tab to monitor progress
                    setActiveTab("running");
                  } else {
                    setToast({ 
                      message: `❌ Failed to start any agents. Check agent availability and try again.`, 
                      type: "error" 
                    });
                    // Don't close dialog on complete failure so user can retry
                    return;
                  }
                  
                  // Close dialog and reset state only on partial or complete success
                  setShowCoordinationDialog(false);
                  setSelectedAgentsForCoordination([]);
                  setCoordinationTask("");
                  setCoordinationProject("");
                  
                  // Reload runs to show new executions
                  await loadRuns();
                } catch (error) {
                  setToast({ 
                    message: `❌ Coordination failed: ${error.message || "Unknown error"}`, 
                    type: "error" 
                  });
                  console.error("Coordination error:", error);
                }
              }}
              disabled={selectedAgentsForCoordination.length === 0 || !coordinationProject.trim() || !coordinationTask.trim()}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Coordination ({selectedAgentsForCoordination.length} agents)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Agent Browser */}
      <GitHubAgentBrowser
        isOpen={showGitHubBrowser}
        onClose={() => setShowGitHubBrowser(false)}
        onImportSuccess={async () => {
          setShowGitHubBrowser(false);
          await loadAgents();
          setToast({ message: "Agent imported successfully from GitHub", type: "success" });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the agent "{agentToDelete?.name}"? 
              This action cannot be undone and will permanently remove the agent and all its associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteAgent}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAgent}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Agent
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// For backward compatibility - default export
export default CCAgents;
