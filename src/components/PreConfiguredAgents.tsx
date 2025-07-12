import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  Download, 
  Users, 
  Star, 
  Zap, 
  Layers,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
// import { cn } from "@/lib/utils"; // Unused import

interface PreConfiguredAgentsProps {
  onImportSuccess?: () => void;
  onImportError?: (error: string) => void;
}

// Pre-configured agent specifications based on HOA plan
const PRE_CONFIGURED_AGENTS = [
  // Core Mastery Agents
  {
    category: "mastery",
    name: "Codebase Mastery Agent",
    icon: "code",
    description: "Full-stack development with router integration",
    specialization: "API layers, service management, fallback logic",
    routerOptimized: true
  },
  {
    category: "mastery", 
    name: "Debug Mastery Agent",
    icon: "bug",
    description: "Advanced debugging and error resolution",
    specialization: "Error analysis, performance optimization",
    routerOptimized: true
  },
  {
    category: "mastery",
    name: "Testing Mastery Agent", 
    icon: "testTube",
    description: "Comprehensive testing strategies",
    specialization: "Unit tests, integration tests, QA validation",
    routerOptimized: true
  },
  {
    category: "mastery",
    name: "Environmental Mastery Agent",
    icon: "settings",
    description: "Environment setup and configuration",
    specialization: "DevOps, deployment, infrastructure",
    routerOptimized: true
  },
  // Coordination Agents
  {
    category: "coordination",
    name: "Gemini Orchestrator Agent",
    icon: "crown",
    description: "Project planning and agent coordination", 
    specialization: "Strategy, integration planning, cost optimization",
    routerOptimized: true
  },
  {
    category: "coordination",
    name: "Planning Agent",
    icon: "map",
    description: "Task breakdown and project management",
    specialization: "Roadmaps, milestone tracking, resource allocation",
    routerOptimized: true
  },
  {
    category: "coordination", 
    name: "Connection Agent",
    icon: "link",
    description: "Inter-agent communication and handoffs",
    specialization: "Workflow coordination, data flow management",
    routerOptimized: true
  },
  {
    category: "coordination",
    name: "Review Mastery Agent",
    icon: "eye",
    description: "Quality assurance and code review",
    specialization: "Cost validation, multi-model QA, router testing",
    routerOptimized: true
  },
  // Utility Agents
  {
    category: "utility",
    name: "Documentation Revolution Agent",
    icon: "book",
    description: "Enhanced documentation with router config UI",
    specialization: "API docs, user guides, router dashboards",
    routerOptimized: true
  },
  {
    category: "utility",
    name: "Analytics Agent",
    icon: "barChart",
    description: "Usage tracking and cost optimization",
    specialization: "Cost analytics, performance metrics, savings reports",
    routerOptimized: true
  },
  {
    category: "utility",
    name: "Security Agent",
    icon: "shield",
    description: "Security analysis and vulnerability scanning",
    specialization: "Code security, dependency analysis, threat detection",
    routerOptimized: true
  },
  {
    category: "utility",
    name: "Performance Agent", 
    icon: "zap",
    description: "Performance optimization and monitoring",
    specialization: "Speed optimization, resource usage, scalability",
    routerOptimized: true
  }
];

const CATEGORY_CONFIG = {
  mastery: {
    name: "Core Mastery",
    icon: Star,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    description: "Essential development expertise"
  },
  coordination: {
    name: "Coordination", 
    icon: Users,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    description: "Multi-agent orchestration"
  },
  utility: {
    name: "Utility",
    icon: Zap, 
    color: "bg-green-500/10 text-green-600 border-green-200",
    description: "Specialized tools and automation"
  }
};

/**
 * Pre-configured Agents component for importing the 12 specialized agents
 */
export const PreConfiguredAgents: React.FC<PreConfiguredAgentsProps> = ({
  onImportSuccess,
  onImportError
}) => {
  const [importing, setImporting] = useState(false);
  const [importedAgents, setImportedAgents] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');

  const handleImportAll = async () => {
    try {
      setImporting(true);
      setImportStatus('importing');
      
      // Call the backend API to import pre-configured agents
      await api.importAgent(JSON.stringify({
        version: 1,
        agents: PRE_CONFIGURED_AGENTS,
        routerOptimized: true,
        costSavings: {
          enabled: true,
          targetSavings: 77.5
        }
      }));
      
      setImportedAgents(PRE_CONFIGURED_AGENTS.map(a => a.name));
      setImportStatus('success');
      onImportSuccess?.();
    } catch (error) {
      console.error("Failed to import pre-configured agents:", error);
      setImportStatus('error');
      onImportError?.(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const groupedAgents = PRE_CONFIGURED_AGENTS.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, typeof PRE_CONFIGURED_AGENTS>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pre-configured Agent Collection</h3>
          <p className="text-sm text-muted-foreground">
            12 specialized agents optimized for claude-code-router integration
          </p>
        </div>
        <Button
          onClick={handleImportAll}
          disabled={importing || importStatus === 'success'}
          className="gap-2"
        >
          {importing ? (
            <>
              <Download className="h-4 w-4 animate-pulse" />
              Importing...
            </>
          ) : importStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Imported
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Import All Agents
            </>
          )}
        </Button>
      </div>

      {/* Status Banner */}
      {importStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-50 border border-green-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Successfully imported {importedAgents.length} agents
              </p>
              <p className="text-sm text-green-700">
                All agents are configured with cost-optimized routing for maximum savings
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {importStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Import failed</p>
              <p className="text-sm text-red-700">
                Please check your connection and try again
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Agent Categories */}
      {Object.entries(groupedAgents).map(([category, agents]) => {
        const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <categoryConfig.icon className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">{categoryConfig.name}</h4>
              <Badge variant="outline" className={categoryConfig.color}>
                {agents.length} agents
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={categoryConfig.color}>
                          <categoryConfig.icon className="h-3 w-3 mr-1" />
                          {categoryConfig.name}
                        </Badge>
                        {agent.routerOptimized && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Zap className="h-3 w-3 mr-1" />
                            Optimized
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{agent.name}</h5>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {agent.description}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Specialization:</span> {agent.specialization}
                      </div>
                      
                      {importedAgents.includes(agent.name) && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" />
                          Imported
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Cost Optimization Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Router Integration Benefits</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Each agent optimized for specific model routing contexts</li>
                <li>• Automatic cost optimization based on task complexity</li>
                <li>• 77.5% average cost savings through smart model selection</li>
                <li>• Coordinated multi-agent workflows with shared routing intelligence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};