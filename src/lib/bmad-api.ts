// BMAD API layer for Tauri commands

import { invoke } from '@tauri-apps/api/core';
import { 
  BMadProject, 
  AgentRecommendation, 
  AgentMessage, 
  ProjectStatistics,
  BMadPhase,
  AgentType,
  MessageType 
} from '@/types/bmad';

export class BMadAPI {
  // Project Management
  static async discoverProjects(rootDirectories: string[]): Promise<BMadProject[]> {
    return invoke('discover_bmad_projects', { rootDirectories });
  }

  static async createProject(name: string, path: string): Promise<BMadProject> {
    return invoke('create_bmad_project', { name, path });
  }

  static async listProjects(): Promise<BMadProject[]> {
    return invoke('list_bmad_projects');
  }

  static async getProject(projectId: string): Promise<BMadProject> {
    return invoke('get_bmad_project', { projectId });
  }

  static async setActiveProject(projectId: string): Promise<void> {
    return invoke('set_active_bmad_project', { projectId });
  }

  static async getActiveProject(): Promise<BMadProject | null> {
    return invoke('get_active_bmad_project');
  }

  static async deleteProject(projectId: string, deleteFiles: boolean): Promise<void> {
    return invoke('delete_bmad_project', { projectId, deleteFiles });
  }

  // Workflow Management
  static async getAgentRecommendations(projectId: string): Promise<AgentRecommendation[]> {
    return invoke('get_agent_recommendations', { projectId });
  }

  static async transitionPhase(
    projectId: string, 
    toPhase: BMadPhase, 
    triggerAgent: AgentType
  ): Promise<void> {
    return invoke('transition_bmad_phase', { 
      projectId, 
      toPhase: toPhase.toString(), 
      triggerAgent: triggerAgent.toString() 
    });
  }

  static async startStory(
    projectId: string, 
    storyName: string, 
    assignedAgent: AgentType
  ): Promise<void> {
    return invoke('start_story', { 
      projectId, 
      storyName, 
      assignedAgent: assignedAgent.toString() 
    });
  }

  static async completeStory(
    projectId: string, 
    storyName: string, 
    completingAgent: AgentType
  ): Promise<void> {
    return invoke('complete_story', { 
      projectId, 
      storyName, 
      completingAgent: completingAgent.toString() 
    });
  }

  static async reportBlocker(
    projectId: string,
    agent: AgentType,
    description: string,
    affectedStory?: string
  ): Promise<void> {
    return invoke('report_blocker', { 
      projectId, 
      agent: agent.toString(), 
      description, 
      affectedStory 
    });
  }

  static async getWorkflowSummary(projectId: string): Promise<string> {
    return invoke('get_workflow_summary', { projectId });
  }

  // Communication Management
  static async getProjectMessages(projectId: string): Promise<AgentMessage[]> {
    return invoke('get_project_messages', { projectId });
  }

  static async sendAgentMessage(
    projectId: string,
    fromAgent: AgentType,
    toAgent: AgentType | null,
    content: string,
    messageType: MessageType
  ): Promise<void> {
    return invoke('send_agent_message', {
      projectId,
      fromAgent: fromAgent.toString(),
      toAgent: toAgent?.toString() || null,
      content,
      messageType: messageType.toString()
    });
  }

  static async markMessageRead(projectId: string, messageId: string): Promise<void> {
    return invoke('mark_message_read', { projectId, messageId });
  }

  // IDE Integration
  static async launchIdeWithContext(
    projectId: string,
    ideName: string,
    storyContext?: string
  ): Promise<void> {
    return invoke('launch_ide_with_context', { projectId, ideName, storyContext });
  }

  static async detectInstalledIdes(): Promise<string[]> {
    return invoke('detect_installed_ides');
  }

  // File Operations
  static async validateBmadProject(projectPath: string): Promise<boolean> {
    return invoke('validate_bmad_project', { projectPath });
  }

  static async createBmadStructure(projectPath: string): Promise<void> {
    return invoke('create_bmad_structure', { projectPath });
  }

  static async getProjectStatistics(): Promise<ProjectStatistics> {
    return invoke('get_project_statistics');
  }
}

// Error handling utility
export class BMadError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'BMadError';
  }
}

// Helper function to handle API errors consistently
export const handleBMadError = (error: unknown): BMadError => {
  if (error instanceof Error) {
    return new BMadError(error.message);
  }
  
  if (typeof error === 'string') {
    return new BMadError(error);
  }
  
  return new BMadError('An unknown error occurred');
};