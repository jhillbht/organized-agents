import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare,
  Send,
  Filter,
  Search,
  User,
  Clock,
  CheckCheck,
  Eye,
  Archive,
  AlertTriangle,
  Users,
  MessageCircle,
  Bell,
  BellOff,
  History,
  Zap,
  RefreshCw,
  Bot,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BMadAPI, handleBMadError } from "@/lib/bmad-api";
import { 
  BMadProject,
  AgentMessage,
  AgentType,
  MessageType,
  MessageStatus,
  getAgentDisplayName,
  getMessageTypeIcon
} from "@/types/bmad";

interface CommunicationBoardProps {
  project: BMadProject;
  onMessageUpdate?: (messages: AgentMessage[]) => void;
  className?: string;
}

interface AutoMessageSettings {
  enabled: boolean;
  notifyOnBlocker: boolean;
  notifyOnHandoff: boolean;
  notifyOnCompletion: boolean;
  sessionContinuity: boolean;
}

interface SessionData {
  lastActiveTime: string;
  activeAgents: AgentType[];
  pendingActions: string[];
  context: Record<string, any>;
}

interface MessageComposer {
  toAgent: AgentType | null;
  messageType: MessageType;
  content: string;
  isVisible: boolean;
}

/**
 * CommunicationBoard component - Agent message management and communication hub
 */
export const CommunicationBoard: React.FC<CommunicationBoardProps> = ({
  project,
  onMessageUpdate,
  className,
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>(project.communications || []);
  const [filteredMessages, setFilteredMessages] = useState<AgentMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAgent, setFilterAgent] = useState<AgentType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "all">("all");
  const [filterType, setFilterType] = useState<MessageType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [composer, setComposer] = useState<MessageComposer>({
    toAgent: null,
    messageType: MessageType.Update,
    content: "",
    isVisible: false
  });
  const [autoMessageSettings, setAutoMessageSettings] = useState<AutoMessageSettings>({
    enabled: true,
    notifyOnBlocker: true,
    notifyOnHandoff: true,
    notifyOnCompletion: true,
    sessionContinuity: true
  });
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadSessionData();
    setupNotifications();
  }, [project.id]);

  useEffect(() => {
    applyFilters();
  }, [messages, searchTerm, filterAgent, filterStatus, filterType]);

  useEffect(() => {
    if (autoMessageSettings.enabled) {
      generateAutoMessages();
    }
  }, [project.state.currentPhase, project.state.activeStory, autoMessageSettings.enabled]);

  useEffect(() => {
    // Save session data periodically
    if (autoMessageSettings.sessionContinuity) {
      saveSessionData();
    }
  }, [messages, project.state, autoMessageSettings.sessionContinuity]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const projectMessages = await BMadAPI.getProjectMessages(project.id);
      setMessages(projectMessages);
      onMessageUpdate?.(projectMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAgentDisplayName(msg.fromAgent).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.toAgent && getAgentDisplayName(msg.toAgent).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Agent filter
    if (filterAgent !== "all") {
      filtered = filtered.filter(msg => 
        msg.fromAgent === filterAgent || msg.toAgent === filterAgent
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(msg => msg.messageType === filterType);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredMessages(filtered);
  };

  const sendMessage = async () => {
    if (!composer.content.trim()) return;

    try {
      await BMadAPI.sendAgentMessage(
        project.id,
        AgentType.BMadOrchestrator, // User messages come from orchestrator
        composer.toAgent,
        composer.content,
        composer.messageType
      );

      // Reset composer
      setComposer({
        toAgent: null,
        messageType: MessageType.Update,
        content: "",
        isVisible: false
      });

      // Reload messages
      await loadMessages();

      toast({
        title: "Message Sent",
        description: `Message sent to ${composer.toAgent ? getAgentDisplayName(composer.toAgent) : "all agents"}`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Send Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await BMadAPI.markMessageRead(project.id, messageId);
      await loadMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const loadSessionData = async () => {
    try {
      const data = localStorage.getItem(`bmad_session_${project.id}`);
      if (data) {
        const session: SessionData = JSON.parse(data);
        setSessionData(session);
        
        // Check if session was interrupted and restore context
        const timeSinceLastActive = Date.now() - new Date(session.lastActiveTime).getTime();
        if (timeSinceLastActive > 30 * 60 * 1000 && session.pendingActions.length > 0) { // 30 minutes
          generateSessionRestorationMessage(session);
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const saveSessionData = () => {
    const activeAgents = messages
      .filter(m => Date.now() - new Date(m.timestamp).getTime() < 60 * 60 * 1000) // Last hour
      .map(m => m.fromAgent)
      .filter((agent, index, self) => self.indexOf(agent) === index);

    const pendingActions = messages
      .filter(m => m.status === MessageStatus.Pending)
      .map(m => m.content);

    const session: SessionData = {
      lastActiveTime: new Date().toISOString(),
      activeAgents,
      pendingActions,
      context: {
        currentPhase: project.state.currentPhase,
        activeStory: project.state.activeStory,
        messageCount: messages.length
      }
    };

    localStorage.setItem(`bmad_session_${project.id}`, JSON.stringify(session));
    setSessionData(session);
  };

  const generateSessionRestorationMessage = async (session: SessionData) => {
    if (!autoMessageSettings.sessionContinuity) return;

    const message = `**🔄 Session Restored**

Welcome back to **${project.name}**!

**Last Session Context:**
- Phase: ${session.context.currentPhase}
- Active Story: ${session.context.activeStory || 'None'}
- Time Away: ${Math.round((Date.now() - new Date(session.lastActiveTime).getTime()) / (1000 * 60))} minutes

**Pending Actions (${session.pendingActions.length}):**
${session.pendingActions.slice(0, 3).map(action => `- ${action.substring(0, 80)}...`).join('\n')}

**Active Agents:** ${session.activeAgents.map(a => getAgentDisplayName(a)).join(', ')}

Ready to continue where you left off!`;

    try {
      await BMadAPI.sendAgentMessage(
        project.id,
        AgentType.BMadOrchestrator,
        null,
        message,
        MessageType.ContextShare
      );
      await loadMessages();
    } catch (error) {
      console.error('Failed to send session restoration message:', error);
    }
  };

  const generateAutoMessages = async () => {
    if (!autoMessageSettings.enabled || autoGenerating) return;

    setAutoGenerating(true);
    try {
      // Generate phase transition messages
      await generatePhaseTransitionMessage();
      
      // Generate milestone alerts
      await generateMilestoneAlerts();
      
      // Generate blocker notifications
      await generateBlockerNotifications();
      
    } catch (error) {
      console.error('Failed to generate auto messages:', error);
    } finally {
      setAutoGenerating(false);
    }
  };

  const generatePhaseTransitionMessage = async () => {
    const lastPhaseMessage = messages.find(m => 
      m.content.includes('Phase transition') || m.content.includes('moved to')
    );
    
    if (!lastPhaseMessage || 
        new Date(lastPhaseMessage.timestamp).getTime() < Date.now() - 60 * 60 * 1000) {
      
      const message = `**📋 Phase Update - ${project.state.currentPhase}**

The project has ${lastPhaseMessage ? 'transitioned to' : 'entered'} the **${project.state.currentPhase}** phase.

**Current Status:**
- Active Story: ${project.state.activeStory || 'No active story'}
- Next Actions: ${project.state.nextActions.length} pending
- Recent Activity: ${messages.filter(m => Date.now() - new Date(m.timestamp).getTime() < 24 * 60 * 60 * 1000).length} messages in last 24h

**Phase Objectives:**
${getPhaseObjectives(project.state.currentPhase)}

All agents are notified of this phase change and can proceed with phase-specific tasks.`;

      try {
        await BMadAPI.sendAgentMessage(
          project.id,
          AgentType.BMadOrchestrator,
          null,
          message,
          MessageType.Update
        );
      } catch (error) {
        console.error('Failed to send phase transition message:', error);
      }
    }
  };

  const generateMilestoneAlerts = async () => {
    const milestones = [];
    
    // Check for story completion milestones
    if (project.state.activeStory) {
      const storyMessages = messages.filter(m => 
        m.content.toLowerCase().includes(project.state.activeStory!.toLowerCase())
      );
      
      if (storyMessages.length >= 5) { // Story has significant activity
        milestones.push(`Story "${project.state.activeStory}" has ${storyMessages.length} related messages`);
      }
    }

    // Check for agent coordination milestones
    const agentActivity = Object.values(AgentType).map(agent => ({
      agent,
      count: messages.filter(m => m.fromAgent === agent || m.toAgent === agent).length
    })).filter(a => a.count >= 3);

    if (agentActivity.length >= 3) {
      milestones.push(`High collaboration: ${agentActivity.length} agents actively communicating`);
    }

    if (milestones.length > 0 && autoMessageSettings.notifyOnCompletion) {
      const message = `**🎯 Project Milestones**

${milestones.map(m => `✅ ${m}`).join('\n')}

Great progress on **${project.name}**! Keep up the momentum.`;

      try {
        await BMadAPI.sendAgentMessage(
          project.id,
          AgentType.BMadOrchestrator,
          null,
          message,
          MessageType.Completion
        );
      } catch (error) {
        console.error('Failed to send milestone alert:', error);
      }
    }
  };

  const generateBlockerNotifications = async () => {
    const recentBlockers = messages.filter(m => 
      m.messageType === MessageType.BlockerReport &&
      Date.now() - new Date(m.timestamp).getTime() < 4 * 60 * 60 * 1000 // Last 4 hours
    );

    if (recentBlockers.length > 0 && autoMessageSettings.notifyOnBlocker) {
      const message = `**🚨 Blocker Alert**

${recentBlockers.length} blocker(s) reported in the last 4 hours:

${recentBlockers.map((m, i) => 
  `${i + 1}. **${getAgentDisplayName(m.fromAgent)}**: ${m.content.substring(0, 100)}...`
).join('\n')}

**Recommended Actions:**
- Review blocked agents and provide assistance
- Escalate to Product Manager if needed
- Update project timeline if delays are significant

Immediate attention required to maintain project velocity.`;

      try {
        await BMadAPI.sendAgentMessage(
          project.id,
          AgentType.BMadOrchestrator,
          AgentType.ProductManager,
          message,
          MessageType.BlockerReport
        );
      } catch (error) {
        console.error('Failed to send blocker notification:', error);
      }
    }
  };

  const setupNotifications = () => {
    if (!notificationsEnabled) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const showDesktopNotification = (title: string, body: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const icon = type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    new Notification(`${icon} ${title}`, {
      body,
      icon: '/bmad-logo.png',
      tag: `bmad-${project.id}`,
      requireInteraction: type === 'error'
    });
  };

  const getPhaseObjectives = (phase: string): string => {
    switch (phase) {
      case 'Planning':
        return '• Define project vision and requirements\n• Create technical architecture\n• Establish project timeline';
      case 'StoryCreation':
        return '• Break down requirements into user stories\n• Prioritize development tasks\n• Assign stories to development cycles';
      case 'Development':
        return '• Implement user stories\n• Conduct code reviews\n• Maintain development velocity';
      case 'QualityAssurance':
        return '• Test all implemented features\n• Verify requirements compliance\n• Prepare for deployment';
      case 'Complete':
        return '• Final review and approval\n• Documentation handoff\n• Project closure activities';
      default:
        return '• Follow phase-specific guidelines\n• Communicate progress regularly\n• Address blockers promptly';
    }
  };

  const getAgentInitials = (agent: AgentType): string => {
    return getAgentDisplayName(agent)
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: MessageStatus): string => {
    switch (status) {
      case MessageStatus.Pending: return "bg-yellow-100 text-yellow-800";
      case MessageStatus.Read: return "bg-blue-100 text-blue-800";
      case MessageStatus.Processed: return "bg-green-100 text-green-800";
      case MessageStatus.Archived: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Pending: return <Clock className="h-3 w-3" />;
      case MessageStatus.Read: return <Eye className="h-3 w-3" />;
      case MessageStatus.Processed: return <CheckCheck className="h-3 w-3" />;
      case MessageStatus.Archived: return <Archive className="h-3 w-3" />;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const messageStats = useMemo(() => {
    return {
      total: messages.length,
      pending: messages.filter(m => m.status === MessageStatus.Pending).length,
      unread: messages.filter(m => m.status === MessageStatus.Pending || m.status === MessageStatus.Read).length,
      blockers: messages.filter(m => m.messageType === MessageType.BlockerReport).length,
    };
  }, [messages]);

  const allAgents = Object.values(AgentType);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Board</h2>
          <div className="flex items-center space-x-4">
            <p className="text-muted-foreground">
              Agent messages and coordination for {project.name}
            </p>
            {sessionData && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <History className="h-3 w-3" />
                <span>Session restored</span>
              </Badge>
            )}
            {autoGenerating && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Bot className="h-3 w-3 animate-pulse" />
                <span>Auto-generating</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="flex items-center space-x-2"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span>{notificationsEnabled ? 'Notifications On' : 'Notifications Off'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>

          <Button
            onClick={() => setComposer(prev => ({ ...prev, isVisible: !prev.isVisible }))}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>New Message</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{messageStats.total}</p>
            <p className="text-sm text-muted-foreground">Total Messages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{messageStats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{messageStats.unread}</p>
            <p className="text-sm text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{messageStats.blockers}</p>
            <p className="text-sm text-muted-foreground">Blockers</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Message Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Communication Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Auto-Generated Messages</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMessageSettings.enabled}
                          onChange={(e) => setAutoMessageSettings(prev => ({ 
                            ...prev, 
                            enabled: e.target.checked 
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Enable auto-generated messages</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMessageSettings.notifyOnBlocker}
                          onChange={(e) => setAutoMessageSettings(prev => ({ 
                            ...prev, 
                            notifyOnBlocker: e.target.checked 
                          }))}
                          disabled={!autoMessageSettings.enabled}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Blocker notifications</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMessageSettings.notifyOnHandoff}
                          onChange={(e) => setAutoMessageSettings(prev => ({ 
                            ...prev, 
                            notifyOnHandoff: e.target.checked 
                          }))}
                          disabled={!autoMessageSettings.enabled}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Agent handoff messages</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMessageSettings.notifyOnCompletion}
                          onChange={(e) => setAutoMessageSettings(prev => ({ 
                            ...prev, 
                            notifyOnCompletion: e.target.checked 
                          }))}
                          disabled={!autoMessageSettings.enabled}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Milestone and completion alerts</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Session Management</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMessageSettings.sessionContinuity}
                          onChange={(e) => setAutoMessageSettings(prev => ({ 
                            ...prev, 
                            sessionContinuity: e.target.checked 
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Enable session continuity</span>
                      </label>
                      
                      {sessionData && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs font-medium mb-1">Current Session</p>
                          <p className="text-xs text-muted-foreground">
                            Active Agents: {sessionData.activeAgents.length} | 
                            Pending: {sessionData.pendingActions.length} | 
                            Last Active: {formatTimestamp(sessionData.lastActiveTime)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    onClick={generateAutoMessages}
                    disabled={!autoMessageSettings.enabled || autoGenerating}
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Messages Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                    size="sm"
                  >
                    Close Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Composer */}
      <AnimatePresence>
        {composer.isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Compose Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Agent</label>
                    <Select
                      value={composer.toAgent || ""}
                      onValueChange={(value) => setComposer(prev => ({ 
                        ...prev, 
                        toAgent: value === "all" ? null : value as AgentType 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {allAgents.map(agent => (
                          <SelectItem key={agent} value={agent}>
                            {getAgentDisplayName(agent)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message Type</label>
                    <Select
                      value={composer.messageType}
                      onValueChange={(value) => setComposer(prev => ({ 
                        ...prev, 
                        messageType: value as MessageType 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MessageType).map(type => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center space-x-2">
                              <span>{getMessageTypeIcon(type)}</span>
                              <span>{type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={composer.content}
                    onChange={(e) => setComposer(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button onClick={sendMessage} disabled={!composer.content.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setComposer(prev => ({ ...prev, isVisible: false }))}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={filterAgent} onValueChange={(value) => setFilterAgent(value as AgentType | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {allAgents.map(agent => (
                  <SelectItem key={agent} value={agent}>
                    {getAgentDisplayName(agent)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as MessageStatus | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(MessageStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={(value) => setFilterType(value as MessageType | "all")}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(MessageType).map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilterAgent("all");
                setFilterStatus("all");
                setFilterType("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Messages ({filteredMessages.length})</span>
            </div>
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">
                  No messages found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {messages.length === 0 
                    ? "Start the conversation by sending a message to an agent"
                    : "Try adjusting your filters to see more messages"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors",
                      message.status === MessageStatus.Pending && "border-l-yellow-500 bg-yellow-50/50",
                      message.status === MessageStatus.Read && "border-l-blue-500",
                      message.status === MessageStatus.Processed && "border-l-green-500",
                      message.status === MessageStatus.Archived && "border-l-gray-500",
                      message.messageType === MessageType.BlockerReport && "border-l-red-500 bg-red-50/50"
                    )}
                    onClick={() => message.status === MessageStatus.Pending && markAsRead(message.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getAgentInitials(message.fromAgent)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium">
                            {getAgentDisplayName(message.fromAgent)}
                          </p>
                          {message.toAgent && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <p className="text-sm font-medium">
                                {getAgentDisplayName(message.toAgent)}
                              </p>
                            </>
                          )}
                          <span className="text-xl">{getMessageTypeIcon(message.messageType)}</span>
                          <Badge className={getStatusColor(message.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(message.status)}
                              <span>{message.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-900 mb-2">{message.content}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.filesReferenced.length > 0 && (
                            <span>{message.filesReferenced.length} file(s) referenced</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};