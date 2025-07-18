import { 
  BMadProject, 
  ProjectState, 
  BMadPhase, 
  AgentType,
  AgentStatusType 
} from '@/types/bmad';
import { 
  BMadLesson, 
  LearningContext, 
  ContextualSuggestion,
  BMadSkill,
  BMadLearningProgress
} from '@/types/bmad-education';
import { BMadEducationAPI } from './bmad-education-api';

/**
 * Project-Education Integration Service
 * Bridges project state with learning recommendations
 */
export class EducationProjectIntegration {
  
  /**
   * Analyze project state to generate contextual learning opportunities
   */
  static async analyzeProjectForLearning(
    project: BMadProject,
    userProgress: BMadLearningProgress
  ): Promise<ProjectLearningAnalysis> {
    const analysis: ProjectLearningAnalysis = {
      projectHealth: this.assessProjectHealth(project),
      phaseReadiness: this.assessPhaseReadiness(project),
      teamEfficiency: this.assessTeamEfficiency(project),
      learningOpportunities: [],
      skillRecommendations: [],
      practicalExercises: []
    };

    // Generate learning opportunities based on analysis
    analysis.learningOpportunities = await this.generateLearningOpportunities(
      project, 
      analysis, 
      userProgress
    );

    // Generate skill recommendations
    analysis.skillRecommendations = this.generateSkillRecommendations(
      project, 
      analysis, 
      userProgress
    );

    // Generate practical exercises
    analysis.practicalExercises = await this.generatePracticalExercises(
      project, 
      analysis
    );

    return analysis;
  }

  /**
   * Get learning context for current project state
   */
  static generateLearningContext(
    project: BMadProject,
    currentView: string,
    userProgress: BMadLearningProgress
  ): LearningContext {
    return {
      currentProject: project,
      projectState: project.state,
      userProgress,
      recentErrors: this.detectRecentIssues(project),
      currentView: currentView as any,
      timeOfDay: this.getTimeOfDay(),
      learningSession: {
        startTime: new Date().toISOString(),
        duration: 0,
        lessonsCompleted: 0,
        focusLevel: this.estimateProjectFocusLevel(project)
      }
    };
  }

  /**
   * Generate phase-specific suggestions
   */
  static getPhaseSpecificSuggestions(
    currentPhase: BMadPhase,
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    switch (currentPhase) {
      case BMadPhase.Planning:
        suggestions.push(...this.getPlanningPhaseSuggestions(projectState, userProgress));
        break;
      case BMadPhase.StoryCreation:
        suggestions.push(...this.getStoryCreationSuggestions(projectState, userProgress));
        break;
      case BMadPhase.Development:
        suggestions.push(...this.getDevelopmentSuggestions(projectState, userProgress));
        break;
      case BMadPhase.QualityAssurance:
        suggestions.push(...this.getQASuggestions(projectState, userProgress));
        break;
      case BMadPhase.Complete:
        suggestions.push(...this.getCompletionSuggestions(projectState, userProgress));
        break;
    }

    return suggestions;
  }

  /**
   * Track project-based learning progress
   */
  static async trackProjectLearning(
    project: BMadProject,
    lessonId: string,
    skillsApplied: BMadSkill[],
    outcome: 'success' | 'partial' | 'failed'
  ): Promise<void> {
    // Update project metadata with learning information
    const learningMetadata = {
      lessonId,
      skillsApplied,
      outcome,
      timestamp: new Date().toISOString(),
      projectPhase: project.state.currentPhase,
      projectContext: {
        totalStories: project.state.totalStories,
        completedStories: project.state.completedStories,
        activeAgents: Object.keys(project.state.agents).length
      }
    };

    // Store learning metadata (would integrate with backend)
    console.log('Project learning tracked:', learningMetadata);
  }

  /**
   * Validate project suitability for specific lessons
   */
  static validateProjectForLesson(
    project: BMadProject,
    lesson: BMadLesson
  ): ProjectValidationResult {
    const result: ProjectValidationResult = {
      isValid: true,
      reasons: [],
      requirements: [],
      recommendations: []
    };

    // Check if lesson requires real project integration
    if (lesson.realProjectIntegration) {
      if (!project) {
        result.isValid = false;
        result.reasons.push('This lesson requires an active project');
        return result;
      }

      // Check project phase compatibility
      if (lesson.phase !== 'general' && lesson.phase !== project.state.currentPhase) {
        result.isValid = false;
        result.reasons.push(
          `This lesson is designed for ${lesson.phase} phase, but project is in ${project.state.currentPhase}`
        );
        result.recommendations.push(
          `Consider completing this lesson when your project reaches the ${lesson.phase} phase`
        );
      }

      // Check project complexity
      if (lesson.difficulty === 'advanced' && project.state.totalStories < 3) {
        result.isValid = false;
        result.reasons.push('This lesson requires a more complex project with multiple stories');
        result.requirements.push('Add at least 3 stories to your project');
      }

      // Check team size for collaboration lessons
      if (lesson.tags.includes('collaboration') && Object.keys(project.state.agents).length < 2) {
        result.isValid = false;
        result.reasons.push('This lesson requires multiple active agents');
        result.requirements.push('Ensure multiple agents are active in your project');
      }
    }

    return result;
  }

  // Private helper methods

  private static assessProjectHealth(project: BMadProject): ProjectHealthScore {
    let score = 0;
    const factors: string[] = [];

    // Story completion rate
    const completionRate = project.state.totalStories > 0 
      ? project.state.completedStories / project.state.totalStories 
      : 0;
    
    if (completionRate > 0.8) {
      score += 30;
      factors.push('High story completion rate');
    } else if (completionRate > 0.5) {
      score += 20;
      factors.push('Good story completion rate');
    } else {
      score += 10;
      factors.push('Low story completion rate');
    }

    // Agent activity
    const activeAgents = Object.values(project.state.agents).filter(
      agent => agent.status === AgentStatusType.Active
    ).length;
    
    if (activeAgents > 2) {
      score += 25;
      factors.push('Multiple active agents');
    } else if (activeAgents > 0) {
      score += 15;
      factors.push('Some agent activity');
    } else {
      score += 5;
      factors.push('Low agent activity');
    }

    // Phase progression
    if (project.state.currentPhase !== BMadPhase.Planning) {
      score += 20;
      factors.push('Project has progressed beyond planning');
    }

    // Communication activity
    if (project.state.activeStory) {
      score += 15;
      factors.push('Active story in progress');
    }

    // Recent activity (simplified - would check timestamps in real implementation)
    score += 10;
    factors.push('Recent project activity');

    return {
      score: Math.min(100, score),
      factors,
      issues: score < 50 ? ['Project may need more active management'] : []
    };
  }

  private static assessPhaseReadiness(project: BMadProject): PhaseReadinessAssessment {
    const currentPhase = project.state.currentPhase;
    const assessment: PhaseReadinessAssessment = {
      currentPhase,
      readinessScore: 0,
      nextPhaseRecommendations: [],
      blockingIssues: []
    };

    switch (currentPhase) {
      case BMadPhase.Planning:
        assessment.readinessScore = project.state.totalStories > 0 ? 80 : 30;
        if (project.state.totalStories === 0) {
          assessment.blockingIssues.push('No stories created yet');
          assessment.nextPhaseRecommendations.push('Create initial project stories');
        }
        break;

      case BMadPhase.StoryCreation:
        assessment.readinessScore = project.state.totalStories > 2 ? 85 : 50;
        if (project.state.totalStories < 3) {
          assessment.nextPhaseRecommendations.push('Add more detailed stories');
        }
        break;

      case BMadPhase.Development:
        const devProgress = project.state.completedStories / Math.max(1, project.state.totalStories);
        assessment.readinessScore = devProgress * 100;
        if (devProgress < 0.8) {
          assessment.nextPhaseRecommendations.push('Complete more development stories');
        }
        break;

      case BMadPhase.QualityAssurance:
        assessment.readinessScore = 75; // Simplified
        assessment.nextPhaseRecommendations.push('Complete quality reviews');
        break;

      case BMadPhase.Complete:
        assessment.readinessScore = 100;
        break;
    }

    return assessment;
  }

  private static assessTeamEfficiency(project: BMadProject): TeamEfficiencyMetrics {
    const agents = Object.values(project.state.agents);
    const activeAgents = agents.filter(agent => agent.status === AgentStatusType.Active);
    const blockedAgents = agents.filter(agent => agent.status === AgentStatusType.Blocked);

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      blockedAgents: blockedAgents.length,
      efficiencyScore: agents.length > 0 ? (activeAgents.length / agents.length) * 100 : 0,
      coordinationIssues: blockedAgents.length > 0 ? ['Some agents are blocked'] : [],
      recommendations: blockedAgents.length > 0 
        ? ['Review and resolve agent blockers'] 
        : ['Team coordination is good']
    };
  }

  private static async generateLearningOpportunities(
    project: BMadProject,
    analysis: ProjectLearningAnalysis,
    userProgress: BMadLearningProgress
  ): Promise<ContextualSuggestion[]> {
    const opportunities: ContextualSuggestion[] = [];

    // Health-based opportunities
    if (analysis.projectHealth.score < 70) {
      opportunities.push({
        type: 'lesson',
        title: 'Project Health & Monitoring',
        description: 'Learn to identify and resolve common project issues',
        relevanceScore: 90,
        reason: 'Your project health score indicates room for improvement',
        lessonId: 'project-health-monitoring'
      });
    }

    // Phase-specific opportunities
    const phaseOpportunities = this.getPhaseSpecificSuggestions(
      project.state.currentPhase,
      project.state,
      userProgress
    );
    opportunities.push(...phaseOpportunities);

    // Team efficiency opportunities
    if (analysis.teamEfficiency.efficiencyScore < 60) {
      opportunities.push({
        type: 'lesson',
        title: 'Agent Coordination',
        description: 'Improve team coordination and agent management',
        relevanceScore: 85,
        reason: 'Team efficiency metrics suggest coordination improvements needed',
        lessonId: 'agent-coordination'
      });
    }

    return opportunities.slice(0, 5); // Return top 5 opportunities
  }

  private static generateSkillRecommendations(
    project: BMadProject,
    analysis: ProjectLearningAnalysis,
    userProgress: BMadLearningProgress
  ): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = [];

    // Workflow management
    if (analysis.phaseReadiness.readinessScore < 70) {
      recommendations.push({
        skill: BMadSkill.WorkflowManagement,
        currentLevel: userProgress.skillLevels[BMadSkill.WorkflowManagement] || 0,
        targetLevel: 75,
        priority: 'high',
        reason: 'Phase transition challenges detected',
        suggestedActions: [
          'Complete workflow management lesson',
          'Practice phase transitions in your project',
          'Review phase completion criteria'
        ]
      });
    }

    // Agent coordination
    if (analysis.teamEfficiency.blockedAgents > 0) {
      recommendations.push({
        skill: BMadSkill.AgentCoordination,
        currentLevel: userProgress.skillLevels[BMadSkill.AgentCoordination] || 0,
        targetLevel: 80,
        priority: 'high',
        reason: 'Blocked agents detected in project',
        suggestedActions: [
          'Learn agent dispatch strategies',
          'Practice conflict resolution',
          'Improve handoff procedures'
        ]
      });
    }

    return recommendations;
  }

  private static async generatePracticalExercises(
    project: BMadProject,
    analysis: ProjectLearningAnalysis
  ): Promise<PracticalExercise[]> {
    const exercises: PracticalExercise[] = [];

    // Phase-specific exercises
    switch (project.state.currentPhase) {
      case BMadPhase.Development:
        if (project.state.activeStory) {
          exercises.push({
            id: 'active-story-optimization',
            title: 'Optimize Active Story Development',
            description: 'Apply BMAD best practices to your current active story',
            difficulty: 'intermediate',
            estimatedTime: 25,
            projectRequired: true,
            skills: [BMadSkill.WorkflowManagement, BMadSkill.AgentCoordination],
            context: {
              story: project.state.activeStory,
              phase: project.state.currentPhase
            }
          });
        }
        break;

      case BMadPhase.QualityAssurance:
        exercises.push({
          id: 'quality-gate-review',
          title: 'Implement Quality Gates',
          description: 'Set up and test quality gates for your project',
          difficulty: 'advanced',
          estimatedTime: 35,
          projectRequired: true,
          skills: [BMadSkill.QualityAssurance, BMadSkill.ProcessOptimization],
          context: {
            completedStories: project.state.completedStories,
            totalStories: project.state.totalStories
          }
        });
        break;
    }

    return exercises;
  }

  // Phase-specific suggestion generators

  private static getPlanningPhaseSuggestions(
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    if (projectState.totalStories === 0) {
      suggestions.push({
        type: 'exercise',
        title: 'Create Your First Stories',
        description: 'Learn to break down requirements into actionable stories',
        relevanceScore: 95,
        reason: 'No stories found in planning phase',
        exerciseId: 'story-creation-basics'
      });
    }

    if (!userProgress.completedLessons.includes('project-setup')) {
      suggestions.push({
        type: 'lesson',
        title: 'Project Setup',
        description: 'Master BMAD project configuration',
        relevanceScore: 90,
        reason: 'Setting up project foundation is crucial',
        lessonId: 'project-setup'
      });
    }

    return suggestions;
  }

  private static getStoryCreationSuggestions(
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    if (projectState.totalStories < 3) {
      suggestions.push({
        type: 'tip',
        title: 'Story Breakdown Strategy',
        description: 'Break large features into smaller, manageable stories',
        relevanceScore: 85,
        reason: 'Limited stories may indicate need for better breakdown'
      });
    }

    return suggestions;
  }

  private static getDevelopmentSuggestions(
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    if (projectState.activeStory) {
      suggestions.push({
        type: 'exercise',
        title: 'Active Story Development',
        description: 'Apply BMAD development practices to your current story',
        relevanceScore: 95,
        reason: 'You have an active story in development',
        exerciseId: 'story-development-practice'
      });
    }

    const completionRate = projectState.completedStories / Math.max(1, projectState.totalStories);
    if (completionRate < 0.3) {
      suggestions.push({
        type: 'lesson',
        title: 'Development Velocity',
        description: 'Learn to increase development speed and quality',
        relevanceScore: 80,
        reason: 'Low story completion rate detected',
        lessonId: 'development-velocity'
      });
    }

    return suggestions;
  }

  private static getQASuggestions(
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    suggestions.push({
      type: 'lesson',
      title: 'Quality Gates',
      description: 'Implement comprehensive quality assurance',
      relevanceScore: 90,
      reason: 'Quality assurance phase requires systematic testing',
      lessonId: 'quality-gates'
    });

    return suggestions;
  }

  private static getCompletionSuggestions(
    projectState: ProjectState,
    userProgress: BMadLearningProgress
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    suggestions.push({
      type: 'tip',
      title: 'Project Retrospective',
      description: 'Reflect on lessons learned and improvements for next project',
      relevanceScore: 85,
      reason: 'Project completion is a great time for reflection'
    });

    return suggestions;
  }

  // Utility methods

  private static detectRecentIssues(project: BMadProject): string[] {
    const issues: string[] = [];
    
    const blockedAgents = Object.values(project.state.agents).filter(
      agent => agent.status === AgentStatusType.Blocked
    );
    
    if (blockedAgents.length > 0) {
      issues.push(`${blockedAgents.length} agents are blocked`);
    }

    if (project.state.totalStories > 0 && project.state.completedStories === 0) {
      issues.push('No stories completed yet');
    }

    return issues;
  }

  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private static estimateProjectFocusLevel(project: BMadProject): number {
    let focusLevel = 50; // Base level

    // Active story indicates focused work
    if (project.state.activeStory) focusLevel += 20;

    // Multiple active agents indicate coordination
    const activeAgents = Object.values(project.state.agents).filter(
      agent => agent.status === AgentStatusType.Active
    ).length;
    focusLevel += Math.min(20, activeAgents * 5);

    // Progress indicates momentum
    const progressRate = project.state.totalStories > 0 
      ? project.state.completedStories / project.state.totalStories 
      : 0;
    focusLevel += progressRate * 10;

    return Math.min(100, focusLevel);
  }
}

// Type definitions for integration

export interface ProjectLearningAnalysis {
  projectHealth: ProjectHealthScore;
  phaseReadiness: PhaseReadinessAssessment;
  teamEfficiency: TeamEfficiencyMetrics;
  learningOpportunities: ContextualSuggestion[];
  skillRecommendations: SkillRecommendation[];
  practicalExercises: PracticalExercise[];
}

export interface ProjectHealthScore {
  score: number; // 0-100
  factors: string[];
  issues: string[];
}

export interface PhaseReadinessAssessment {
  currentPhase: BMadPhase;
  readinessScore: number; // 0-100
  nextPhaseRecommendations: string[];
  blockingIssues: string[];
}

export interface TeamEfficiencyMetrics {
  totalAgents: number;
  activeAgents: number;
  blockedAgents: number;
  efficiencyScore: number; // 0-100
  coordinationIssues: string[];
  recommendations: string[];
}

export interface SkillRecommendation {
  skill: BMadSkill;
  currentLevel: number;
  targetLevel: number;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  suggestedActions: string[];
}

export interface PracticalExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  projectRequired: boolean;
  skills: BMadSkill[];
  context: Record<string, any>;
}

export interface ProjectValidationResult {
  isValid: boolean;
  reasons: string[];
  requirements: string[];
  recommendations: string[];
}