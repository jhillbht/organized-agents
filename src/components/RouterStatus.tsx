import React, { useState, useEffect } from "react";
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  TrendingDown,
  DollarSign 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type RouterStatus as RouterStatusType } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RouterStatusProps {
  className?: string;
  showControls?: boolean;
  onStatusChange?: (status: RouterStatusType) => void;
}

/**
 * Router Status component for displaying claude-code-router status and controls
 */
export const RouterStatus: React.FC<RouterStatusProps> = ({ 
  className, 
  showControls = false,
  onStatusChange 
}) => {
  const [status, setStatus] = useState<RouterStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const routerStatus = await api.getRouterStatus();
      setStatus(routerStatus);
      onStatusChange?.(routerStatus);
    } catch (err) {
      console.error("Failed to load router status:", err);
      setError("Failed to load router status");
      // Set default offline status
      const offlineStatus: RouterStatusType = {
        running: false,
        error: err instanceof Error ? err.message : "Unknown error"
      };
      setStatus(offlineStatus);
      onStatusChange?.(offlineStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRouter = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const newStatus = await api.startRouter();
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (err) {
      console.error("Failed to start router:", err);
      setError("Failed to start router");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopRouter = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await api.stopRouter();
      // Get updated status
      await loadStatus();
    } catch (err) {
      console.error("Failed to stop router:", err);
      setError("Failed to stop router");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestHealth = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await api.testRouterHealth();
      await loadStatus(); // Refresh status after health check
    } catch (err) {
      console.error("Health check failed:", err);
      setError("Health check failed");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // Poll status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading router status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRunning = status?.running ?? false;
  const hasError = status?.error || error;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Claude Code Router</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              isRunning 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {isRunning ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Running
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Stopped
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Details */}
        <div className="space-y-2">
          {status?.port && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Port:</span> {status.port}
            </div>
          )}
          {status?.version && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Version:</span> {status.version}
            </div>
          )}
          {status?.lastHealthCheck && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Last Check:</span>{" "}
              {new Date(status.lastHealthCheck).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Cost Savings Display */}
        {isRunning && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Cost Optimization Active
                </span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="h-3 w-3" />
                <span className="text-sm font-bold">77.5% savings</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {hasError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {hasError}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={handleStartRouter}
                disabled={actionLoading}
                className="gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3" />
                )}
                Start Router
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStopRouter}
                disabled={actionLoading}
                className="gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Stop Router
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestHealth}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              Health Check
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={loadStatus}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};