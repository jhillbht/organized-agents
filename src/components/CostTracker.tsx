import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingDown, 
  Zap, 
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type RoutingDecision } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CostData {
  traditional: number;
  optimized: number;
  savings: number;
  percentage: number;
  dailySavings: number;
  monthlySavings: number;
  routingDecisions: number;
  averageCostPerRequest: number;
}

interface CostTrackerProps {
  className?: string;
  compact?: boolean;
}

/**
 * Cost Tracker component for monitoring claude-code-router cost optimization
 */
export const CostTracker: React.FC<CostTrackerProps> = ({ 
  className, 
  compact = false 
}) => {
  const [costData, setCostData] = useState<CostData>({
    traditional: 200,
    optimized: 45,
    savings: 155,
    percentage: 77.5,
    dailySavings: 5.2,
    monthlySavings: 155,
    routingDecisions: 847,
    averageCostPerRequest: 0.053
  });
  const [recentDecisions, setRecentDecisions] = useState<RoutingDecision[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCostData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch actual cost data
      // For now, we'll use simulated data with some randomization
      const baseTraditional = 200;
      const baseOptimized = 45;
      const variance = 0.1; // 10% variance
      
      const traditional = baseTraditional * (1 + (Math.random() - 0.5) * variance);
      const optimized = baseOptimized * (1 + (Math.random() - 0.5) * variance);
      const savings = traditional - optimized;
      const percentage = (savings / traditional) * 100;
      
      setCostData({
        traditional: Math.round(traditional * 100) / 100,
        optimized: Math.round(optimized * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        dailySavings: Math.round((savings / 30) * 100) / 100,
        monthlySavings: Math.round(savings * 100) / 100,
        routingDecisions: Math.floor(Math.random() * 200) + 800,
        averageCostPerRequest: Math.round((optimized / 1000) * 1000) / 1000
      });

      // Generate some recent routing decisions for display
      const decisions: RoutingDecision[] = [
        {
          selectedModel: "deepseek-coder",
          reason: "Simple file operation - cost optimized",
          estimatedCost: 0.14,
          fallbackUsed: false
        },
        {
          selectedModel: "claude-3-5-haiku-20241022",
          reason: "Quick debugging task",
          estimatedCost: 0.25,
          fallbackUsed: false
        },
        {
          selectedModel: "gemini-1.5-pro",
          reason: "Large codebase analysis",
          estimatedCost: 0.075,
          fallbackUsed: false
        },
        {
          selectedModel: "claude-3-5-sonnet-20241022",
          reason: "Complex architecture design",
          estimatedCost: 3.0,
          fallbackUsed: false
        }
      ];
      
      setRecentDecisions(decisions);
    } catch (error) {
      console.error("Failed to load cost data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCostData();
    // Refresh cost data every 30 seconds
    const interval = setInterval(loadCostData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Cost Savings</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                ${costData.savings}
              </div>
              <div className="text-xs text-green-700">
                {costData.percentage}% saved
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Cost Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Monthly Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-800">
                    ${costData.monthlySavings}
                  </p>
                  <p className="text-xs text-green-600">
                    {costData.percentage}% reduction
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traditional Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 mb-1">Without Router</p>
                  <p className="text-2xl font-bold text-red-800">
                    ${costData.traditional}
                  </p>
                  <p className="text-xs text-red-600">
                    Traditional pricing
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Optimized Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">With Router</p>
                  <p className="text-2xl font-bold text-blue-800">
                    ${costData.optimized}
                  </p>
                  <p className="text-xs text-blue-600">
                    Smart routing
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">Daily Savings</p>
                  <p className="text-2xl font-bold text-purple-800">
                    ${costData.dailySavings}
                  </p>
                  <p className="text-xs text-purple-600">
                    Per day average
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Routing Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Routing Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Smart model selection performance
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadCostData}
              disabled={loading}
              className="gap-2"
            >
              <BarChart3 className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {costData.routingDecisions.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Routing Decisions
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                ${costData.averageCostPerRequest}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Cost/Request
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">
                {costData.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">
                Cost Reduction
              </div>
            </div>
          </div>

          {/* Recent Routing Decisions */}
          <div>
            <h4 className="font-medium mb-3">Recent Routing Decisions</h4>
            <div className="space-y-2">
              {recentDecisions.map((decision, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {decision.selectedModel}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {decision.reason}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${decision.estimatedCost}
                    </div>
                    {!decision.fallbackUsed && (
                      <div className="text-xs text-green-600">
                        ✓ Optimized
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Target */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">Cost Optimization Goals</h4>
              <p className="text-sm text-green-700">
                Target: 80% cost reduction through intelligent model routing
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-800">
                Current: {costData.percentage}%
              </div>
              <div className="text-xs text-green-600">
                {costData.percentage >= 80 ? "🎯 Target Achieved!" : "📈 On Track"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};