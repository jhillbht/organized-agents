// BMAD TypeScript types for frontend

export interface BMadProject {
  id: string;
  name: string;
  path: string;
  state: ProjectState;
  communications: AgentMessage[];
  createdAt: string;
  lastModified: string;
  settings: ProjectSettings;
}

export interface ProjectState {
  bmadVersion: string;
  projectState: ProjectStateType;
  currentPhase: BMadPhase;
  activeStory?: string;
  nextActions: NextAction[];
  workflowHistory: WorkflowEvent[];
  agents: AgentStatuses;
}

export enum BMadPhase {
  Planning = 'Planning',
  StoryCreation = 'StoryCreation', 
  Development = 'Development',
  QualityAssurance = 'QualityAssurance',
  Complete = 'Complete',
}

export enum ProjectStateType {
  Initializing = 'Initializing',
  Planning = 'Planning',
  Development = 'Development', 
  QualityAssurance = 'QualityAssurance',
  Complete = 'Complete',
  OnHold = 'OnHold',
  Archived = 'Archived',
}

export interface AgentMessage {
  id: string;
  fromAgent: AgentType;
  toAgent?: AgentType;
  content: string;
  messageType: MessageType;
  filesReferenced: string[];
  timestamp: string;
  status: MessageStatus;
}

export enum AgentType {
  Analyst = 'Analyst',
  Architect = 'Architect',
  ProductManager = 'ProductManager',
  ProductOwner = 'ProductOwner',
  ScrumMaster = 'ScrumMaster',
  Developer = 'Developer',
  QualityAssurance = 'QualityAssurance',
  UXExpert = 'UXExpert',
  BMadOrchestrator = 'BMadOrchestrator',
}

export enum MessageType {
  Handoff = 'Handoff',
  Question = 'Question',
  Update = 'Update',
  Completion = 'Completion',
  BlockerReport = 'BlockerReport',
  ContextShare = 'ContextShare',
  Assignment = 'Assignment',
}

export enum MessageStatus {
  Pending = 'Pending',
  Read = 'Read',
  Processed = 'Processed',
  Archived = 'Archived',
}

export interface NextAction {
  agent: AgentType;
  task: string;
  story?: string;
  estimatedTime?: string;
  dependencies: string[];
  autoTrigger: boolean;
}

export interface WorkflowEvent {
  id: string;
  eventType: WorkflowEventType;
  agent: AgentType;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export enum WorkflowEventType {
  PhaseStart = 'PhaseStart',
  PhaseComplete = 'PhaseComplete',
  StoryStart = 'StoryStart',
  StoryComplete = 'StoryComplete',
  AgentHandoff = 'AgentHandoff',
  BlockerReported = 'BlockerReported',
  BlockerResolved = 'BlockerResolved',
}

export interface ProjectSettings {
  idePreference?: string;
  autoTriggerAgents: boolean;
  notificationSettings: NotificationSettings;
  qualityGates: QualityGates;
}

export interface NotificationSettings {
  desktopNotifications: boolean;
  agentHandoffs: boolean;
  storyCompletions: boolean;
  blockers: boolean;
}

export interface QualityGates {
  requireTests: boolean;
  requireDocumentation: boolean;
  requireArchitectureApproval: boolean;
  requireSecurityReview: boolean;
}

export interface AgentStatuses {
  analyst: AgentStatus;
  architect: AgentStatus;
  productManager: AgentStatus;
  productOwner: AgentStatus;
  scrumMaster: AgentStatus;
  developer: AgentStatus;
  qualityAssurance: AgentStatus;
  uxExpert: AgentStatus;
}

export interface AgentStatus {
  status: AgentStatusType;
  currentTask?: string;
  lastActivity?: string;
  queuePosition?: number;
  estimatedStart?: string;
}

export enum AgentStatusType {
  Idle = 'Idle',
  Active = 'Active',
  Waiting = 'Waiting',
  Blocked = 'Blocked',
  Offline = 'Offline',
}

export interface AgentRecommendation {
  agent: AgentType;
  reason: string;
  priority: number; // 1-10, with 10 being highest priority
  estimatedTime?: string;
  prerequisites: string[];
}

// API response types
export interface ProjectStatistics {
  totalProjects: number;
  activeProject?: string;
  projectsInPlanning: number;
  projectsInDevelopment: number;
  projectsInQualityAssurance: number;
  projectsInComplete: number;
}

// UI-specific types
export interface BMadView {
  type: 'projects' | 'workflow' | 'communication' | 'agent-dispatch' | 'education';
  projectId?: string;
}

export interface BMadError {
  message: string;
  details?: string;
}

// Helper functions
export const getAgentDisplayName = (agent: AgentType): string => {
  switch (agent) {
    case AgentType.Analyst: return 'Analyst';
    case AgentType.Architect: return 'Architect';
    case AgentType.ProductManager: return 'Product Manager';
    case AgentType.ProductOwner: return 'Product Owner';
    case AgentType.ScrumMaster: return 'Scrum Master';
    case AgentType.Developer: return 'Developer';
    case AgentType.QualityAssurance: return 'QA';
    case AgentType.UXExpert: return 'UX Expert';
    case AgentType.BMadOrchestrator: return 'BMAD Orchestrator';
  }
};

export const getPhaseDisplayName = (phase: BMadPhase): string => {
  switch (phase) {
    case BMadPhase.Planning: return 'Planning';
    case BMadPhase.StoryCreation: return 'Story Creation';
    case BMadPhase.Development: return 'Development';
    case BMadPhase.QualityAssurance: return 'Quality Assurance';
    case BMadPhase.Complete: return 'Complete';
  }
};

export const getPhaseColor = (phase: BMadPhase): string => {
  switch (phase) {
    case BMadPhase.Planning: return 'bg-blue-100 text-blue-800';
    case BMadPhase.StoryCreation: return 'bg-purple-100 text-purple-800';
    case BMadPhase.Development: return 'bg-orange-100 text-orange-800';
    case BMadPhase.QualityAssurance: return 'bg-yellow-100 text-yellow-800';
    case BMadPhase.Complete: return 'bg-green-100 text-green-800';
  }
};

export const getAgentStatusColor = (status: AgentStatusType): string => {
  switch (status) {
    case AgentStatusType.Idle: return 'bg-gray-100 text-gray-800';
    case AgentStatusType.Active: return 'bg-green-100 text-green-800';
    case AgentStatusType.Waiting: return 'bg-yellow-100 text-yellow-800';
    case AgentStatusType.Blocked: return 'bg-red-100 text-red-800';
    case AgentStatusType.Offline: return 'bg-gray-100 text-gray-500';
  }
};

export const getMessageTypeIcon = (type: MessageType): string => {
  switch (type) {
    case MessageType.Handoff: return '🤝';
    case MessageType.Question: return '❓';
    case MessageType.Update: return '📄';
    case MessageType.Completion: return '✅';
    case MessageType.BlockerReport: return '🚫';
    case MessageType.ContextShare: return '📤';
  }
};