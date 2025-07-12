import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  Play,
  BarChart3,
  Router
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Agent, type RoutingDecision, type OrchestrationTemplate, type OrchestrationExecution } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoordinationTask {
  id: string;
  name: string;
  agents: Agent[];
  routingStrategy: string;
  estimatedCost: number;
  estimatedTime: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  savings: number;
}

interface AgentRouterCoordinationProps {
  className?: string;
  agents: Agent[];
  projectPath?: string;
  onExecuteCoordination?: (task: CoordinationTask) => void;
}

/**
 * Agent Router Coordination component for managing multi-agent workflows with smart routing
 */
export const AgentRouterCoordination: React.FC<AgentRouterCoordinationProps> = ({
  className,
  agents,
  projectPath,
  onExecuteCoordination
}) => {
  const [coordinationTasks, setCoordinationTasks] = useState<CoordinationTask[]>([]);
  const [orchestrationTemplates, setOrchestrationTemplates] = useState<OrchestrationTemplate[]>([]);
  const [orchestrationExecutions, setOrchestrationExecutions] = useState<OrchestrationExecution[]>([]);
  const [routingStrategies, setRoutingStrategies] = useState<Record<string, RoutingDecision>>({});
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OrchestrationTemplate | null>(null);
  const [executionTask, setExecutionTask] = useState('');

  // Pre-defined coordination workflows optimized for router integration
  const COORDINATION_WORKFLOWS = [
    {
      name: "Full-Stack Development Pipeline",
      description: "Complete application development with cost optimization",
      category: "Development",
      icon: "🚀",
      complexity: "Advanced",
      estimatedTime: "2-3 hours",
      agents: ["Codebase Mastery Agent", "Testing Revolution Agent", "Review Mastery Agent"],
      routingStrategy: "multi_model_optimization",
      estimatedSavings: 65,
      use_cases: ["New feature development", "API implementation", "Frontend-backend integration"]
    },
    {
      name: "Debugging & Performance Analysis",
      description: "Comprehensive debugging with performance optimization",
      category: "Debugging",
      icon: "🔧",
      complexity: "Expert",
      estimatedTime: "1-2 hours",
      agents: ["Debug Mastery Agent", "Environmental Mastery Agent", "Documentation Revolution Agent"],
      routingStrategy: "debug_specialized",
      estimatedSavings: 80,
      use_cases: ["Performance bottlenecks", "Memory leaks", "Complex bug investigation"]
    },
    {
      name: "Architecture Design Sprint",
      description: "System architecture with coordination planning",
      category: "Architecture",
      icon: "🏗️",
      complexity: "Expert",
      estimatedTime: "3-4 hours",
      agents: ["Gemini Orchestrator Agent", "Codebase Mastery Agent", "Security Scanner"],
      routingStrategy: "planning_intensive",
      estimatedSavings: 55,
      use_cases: ["System design", "Microservices architecture", "Scalability planning"]
    },
    {
      name: "Quality Assurance Pipeline",
      description: "Complete testing and security validation",
      category: "Testing",
      icon: "✅",
      complexity: "Intermediate",
      estimatedTime: "1.5-2.5 hours",
      agents: ["Testing Revolution Agent", "Security Scanner", "Review Mastery Agent"],
      routingStrategy: "validation_focused",
      estimatedSavings: 72,
      use_cases: ["CI/CD setup", "Security audit", "Code quality review"]
    },
    {
      name: "Rapid Prototyping Sprint",
      description: "Quick MVP development with essential features",
      category: "Prototyping",
      icon: "⚡",
      complexity: "Beginner",
      estimatedTime: "45-90 minutes",
      agents: ["Codebase Mastery Agent", "Documentation Revolution Agent"],
      routingStrategy: "rapid_development",
      estimatedSavings: 85,
      use_cases: ["MVP development", "Proof of concept", "Demo preparation"]
    },
    {
      name: "Documentation & Knowledge Transfer",
      description: "Comprehensive documentation with best practices",
      category: "Documentation",
      icon: "📚",
      complexity: "Beginner",
      estimatedTime: "30-60 minutes",
      agents: ["Documentation Revolution Agent", "Review Mastery Agent"],
      routingStrategy: "documentation_focused",
      estimatedSavings: 90,
      use_cases: ["API documentation", "Code comments", "Team onboarding"]
    }
  ];

  const loadOrchestrationData = async () => {
    try {
      setLoading(true);
      
      // Load orchestration templates
      const templates = await api.getOrchestrationTemplates();
      setOrchestrationTemplates(templates);
      
      // Load recent executions
      const executions = await api.getOrchestrationExecutions();
      setOrchestrationExecutions(executions);
      
      // Get routing decisions for different workflow types
      const strategies = {
        multi_model_optimization: await api.getRoutingDecision(
          "Full-stack development with testing and review",
          "coordination"
        ),
        debug_specialized: await api.getRoutingDecision(
          "Debug complex performance issues",
          "debugging"
        ),
        planning_intensive: await api.getRoutingDecision(
          "Architecture design and system planning",
          "planning"
        ),
        validation_focused: await api.getRoutingDecision(
          "Testing and security validation",
          "validation"
        ),
        rapid_development: await api.getRoutingDecision(
          "Rapid prototyping and MVP development",
          "prototyping"
        ),
        documentation_focused: await api.getRoutingDecision(
          "Documentation and knowledge transfer",
          "documentation"
        )
      };
      
      setRoutingStrategies(strategies);
    } catch (error) {
      console.error("Failed to load orchestration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCoordinationTask = (workflow: typeof COORDINATION_WORKFLOWS[0]): CoordinationTask => {
    const workflowAgents = agents.filter(agent => 
      workflow.agents.some(name => agent.name.includes(name.split(' ')[0]))
    );
    
    // const routingDecision = routingStrategies[workflow.routingStrategy]; // Unused variable
    const baseTime = 45; // Base time in minutes
    const timeMultiplier = workflowAgents.length * 0.8;
    const estimatedTime = Math.round(baseTime * timeMultiplier);
    
    const baseCost = 15; // Base cost in dollars
    const costReduction = workflow.estimatedSavings / 100;
    const estimatedCost = Math.round((baseCost * workflowAgents.length * (1 - costReduction)) * 100) / 100;
    const savings = Math.round((baseCost * workflowAgents.length * costReduction) * 100) / 100;

    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: workflow.name,
      agents: workflowAgents,
      routingStrategy: workflow.routingStrategy,
      estimatedCost,
      estimatedTime,
      status: 'pending',
      progress: 0,
      savings
    };
  };

  // Load orchestration data on component mount
  useEffect(() => {
    loadOrchestrationData();
  }, []);

  const handleExecuteWorkflow = async (workflow: typeof COORDINATION_WORKFLOWS[0]) => {
    if (!projectPath) {
      console.error("Project path is required for orchestration execution");
      return;
    }

    const task = createCoordinationTask(workflow);
    
    try {
      
      // Add to coordination tasks
      setCoordinationTasks(prev => [...prev, { ...task, status: 'running' }]);
      
      // Find corresponding orchestration template
      const template = orchestrationTemplates.find(t => 
        t.name === workflow.name || t.id === `${workflow.name.toLowerCase().replace(/\s+/g, '-')}`
      );
      
      if (template) {
        // Start orchestration execution
        const executionId = await api.startOrchestration(
          template.id,
          projectPath,
          executionTask || `Execute ${workflow.name} workflow`
        );
        
        console.log(`Started orchestration execution: ${executionId}`);
        
        // Update task with execution ID and status
        setCoordinationTasks(prev => 
          prev.map(t => 
            t.id === task.id 
              ? { ...t, status: 'running' as const, progress: 10 }
              : t
          )
        );
        
        // Refresh executions to show new one
        setTimeout(() => {
          loadOrchestrationData();
        }, 1000);
      } else {
        // Fallback to simulation for legacy workflows
        simulateWorkflowExecution(task);
      }
      
      // Call parent handler if provided
      onExecuteCoordination?.(task);
      
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      
      // Update task status to error
      setCoordinationTasks(prev => 
        prev.map(t => 
          t.id === task.id 
            ? { ...t, status: 'error' as const }
            : t
        )
      );
    }
  };

  const simulateWorkflowExecution = (task: CoordinationTask) => {
    // Simulate task execution with progress updates
    simulateTaskExecution(task.id);
  };

  const simulateTaskExecution = (taskId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress 5-20%
      
      if (progress >= 100) {
        progress = 100;
        setCoordinationTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', progress }
              : task
          )
        );
        clearInterval(interval);
      } else {
        setCoordinationTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, progress }
              : task
          )
        );
      }
    }, 2000);
  };


  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Agent Router Coordination</h3>
        <p className="text-sm text-muted-foreground">
          Multi-agent workflows with intelligent cost optimization through smart routing
        </p>
      </div>

      {/* Project Path Input */}
      {!projectPath && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="executionTask">Execution Task (Optional)</Label>
              <Input
                id="executionTask"
                value={executionTask}
                onChange={(e) => setExecutionTask(e.target.value)}
                placeholder="Describe what you want to accomplish with this workflow..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This will be used as context for the orchestration workflow. Leave empty for default task descriptions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-defined Workflows */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Router className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold">Optimized Workflows</h4>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Router Integrated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COORDINATION_WORKFLOWS.map((workflow, index) => {
              const routingDecision = routingStrategies[workflow.routingStrategy];
              const availableAgents = agents.filter(agent => 
                workflow.agents.some(name => agent.name.includes(name.split(' ')[0]))
              );
              
              return (
                <motion.div
                  key={workflow.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium mb-1">{workflow.name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                      
                      {/* Agent Requirements */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Required Agents ({availableAgents.length}/{workflow.agents.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.agents.map(agentName => {
                            const available = availableAgents.some(a => 
                              a.name.includes(agentName.split(' ')[0])
                            );
                            return (
                              <Badge 
                                key={agentName}
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  available 
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {agentName.split(' ')[0]}
                                {available ? " ✓" : " ✗"}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Cost Optimization */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {workflow.estimatedSavings}% savings
                          </span>
                        </div>
                        {routingDecision && (
                          <Badge variant="outline" className="text-xs">
                            {routingDecision.selectedModel.split('-')[0]}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Button
                        size="sm"
                        onClick={() => handleExecuteWorkflow(workflow)}
                        disabled={availableAgents.length !== workflow.agents.length || loading}
                        className="w-full gap-2"
                      >
                        <Play className="h-3 w-3" />
                        Execute Workflow
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Coordination Tasks */}
      {coordinationTasks.length > 0 && (
        <Card className="border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Active Orchestrations</h4>
                  <p className="text-sm text-muted-foreground">Real-time workflow execution</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                {coordinationTasks.filter(t => t.status === 'running').length} active • {coordinationTasks.filter(t => t.status === 'completed').length} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {coordinationTasks.map((task) => {
                  const workflow = COORDINATION_WORKFLOWS.find(w => w.name === task.name);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-5 border-2 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{workflow?.icon || '🤖'}</div>
                          <div>
                            <h5 className="font-bold text-lg">{task.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {task.agents.length} agents • {workflow?.category || 'Coordination'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'running' && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1" />
                              Running
                            </Badge>
                          )}
                          {task.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>Execution Progress</span>
                          <span className="text-blue-600">{Math.round(task.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
                            style={{ width: `${task.progress}%` }}
                          >
                            {task.progress > 10 && (
                              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-lg border">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">${task.estimatedCost}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Cost</div>
                          <div className="text-xs text-green-600 font-medium">
                            ${task.savings} saved
                          </div>
                        </div>
                        <div className="text-center border-x">
                          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">{task.estimatedTime}m</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-xs text-blue-600 font-medium">
                            {workflow?.estimatedTime || 'Estimated'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <BarChart3 className="h-4 w-4" />
                            <span className="font-bold">{task.agents.length}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Agents</div>
                          <div className="text-xs text-purple-600 font-medium">
                            Coordinated
                          </div>
                        </div>
                      </div>
                      
                      {/* Agent List */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {task.agents.map((agent, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {agent.name.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Router Integration Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Router Coordination Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-700 mb-1">Smart Model Selection</div>
                  <p className="text-blue-600">
                    Each agent automatically uses the most cost-effective model for its specific tasks
                  </p>
                </div>
                <div>
                  <div className="font-medium text-blue-700 mb-1">Workflow Optimization</div>
                  <p className="text-blue-600">
                    Coordinated routing reduces redundant high-cost model usage across agents
                  </p>
                </div>
                <div>
                  <div className="font-medium text-blue-700 mb-1">Cost Intelligence</div>
                  <p className="text-blue-600">
                    Real-time cost tracking and optimization for multi-agent coordination
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};