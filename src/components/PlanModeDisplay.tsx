import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanModeDisplayProps {
  /**
   * The plan content to display
   */
  plan: string;
  /**
   * Current approval status
   */
  status: 'pending' | 'approved' | 'rejected';
  /**
   * Callback when plan is approved
   */
  onApprove: () => void;
  /**
   * Callback when plan is rejected
   */
  onReject: () => void;
  /**
   * Optional estimated cost information
   */
  estimatedCost?: string;
  /**
   * Optional time estimate
   */
  estimatedTime?: string;
  /**
   * Optional complexity level
   */
  complexity?: 'low' | 'medium' | 'high';
  /**
   * Optional safety assessment
   */
  safetyLevel?: 'safe' | 'caution' | 'warning';
  /**
   * Optional className for styling
   */
  className?: string;
}

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'low': return 'bg-green-50 text-green-700 border-green-200';
    case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'high': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getSafetyColor = (safetyLevel: string) => {
  switch (safetyLevel) {
    case 'safe': return 'bg-green-50 text-green-700 border-green-200';
    case 'caution': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'warning': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getSafetyIcon = (safetyLevel: string) => {
  switch (safetyLevel) {
    case 'safe': return CheckCircle;
    case 'caution': return Clock;
    case 'warning': return AlertTriangle;
    default: return CheckCircle;
  }
};

/**
 * PlanModeDisplay component for showing plan approval workflow
 * 
 * @example
 * <PlanModeDisplay 
 *   plan="1. Analyze codebase\n2. Implement feature\n3. Test changes"
 *   status="pending"
 *   onApprove={() => console.log('approved')}
 *   onReject={() => console.log('rejected')}
 * />
 */
export const PlanModeDisplay: React.FC<PlanModeDisplayProps> = ({
  plan,
  status,
  onApprove,
  onReject,
  estimatedCost,
  estimatedTime,
  complexity,
  safetyLevel,
  className
}) => {
  const SafetyIcon = getSafetyIcon(safetyLevel || 'safe');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-lg border", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Execution Plan</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium",
              status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
              status === 'approved' && "bg-green-50 text-green-700 border-green-200",
              status === 'rejected' && "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {status === 'pending' && 'Awaiting Approval'}
            {status === 'approved' && 'Approved'}
            {status === 'rejected' && 'Rejected'}
          </Badge>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-2">
          {estimatedCost && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {estimatedCost}
            </Badge>
          )}
          {estimatedTime && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {estimatedTime}
            </Badge>
          )}
        </div>
      </div>

      {/* Assessment Info */}
      {(complexity || safetyLevel) && (
        <div className="p-4 border-b border-border bg-gray-50">
          <div className="flex items-center gap-4">
            {complexity && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Complexity:</span>
                <Badge className={cn("text-xs", getComplexityColor(complexity))}>
                  {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                </Badge>
              </div>
            )}
            {safetyLevel && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Safety:</span>
                <Badge className={cn("text-xs flex items-center gap-1", getSafetyColor(safetyLevel))}>
                  <SafetyIcon className="h-3 w-3" />
                  {safetyLevel.charAt(0).toUpperCase() + safetyLevel.slice(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Content */}
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <pre className="text-sm whitespace-pre-wrap text-gray-800 font-mono leading-relaxed">
            {plan}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'pending' && (
        <div className="p-4 border-t border-border bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>Review the plan carefully before proceeding</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve & Execute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'approved' && (
        <div className="p-4 border-t border-border bg-green-50">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span>Plan approved. Execution will begin shortly...</span>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="p-4 border-t border-border bg-red-50">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <XCircle className="h-4 w-4" />
            <span>Plan rejected. Modify your task and try again.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};