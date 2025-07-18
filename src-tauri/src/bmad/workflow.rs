use crate::bmad::types::{
    BMadError, BMadPhase, ProjectState, ProjectStateType, NextAction, WorkflowEvent,
    WorkflowEventType, AgentType, AgentStatusType, MessageType
};
use crate::bmad::{StateManager, CommunicationManager};
use chrono::{DateTime, Utc};
use std::path::{Path, PathBuf};
use std::collections::HashMap;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

pub struct WorkflowManager {
    project_path: PathBuf,
    state_manager: StateManager,
    communication_manager: CommunicationManager,
}

#[derive(Debug, Clone)]
pub struct AgentRecommendation {
    pub agent: AgentType,
    pub reason: String,
    pub priority: u8, // 1-10, with 10 being highest priority
    pub estimated_time: Option<String>,
    pub prerequisites: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct WorkflowTransition {
    pub from_phase: BMadPhase,
    pub to_phase: BMadPhase,
    pub trigger_agent: AgentType,
    pub required_artifacts: Vec<String>,
    pub validation_checks: Vec<String>,
}

impl WorkflowManager {
    pub fn new<P: AsRef<Path>>(project_path: P) -> Self {
        let path = project_path.as_ref().to_path_buf();
        WorkflowManager {
            project_path: path.clone(),
            state_manager: StateManager::new(),
            communication_manager: CommunicationManager::new(path),
        }
    }

    pub fn analyze_current_state(&self) -> Result<ProjectState, BMadError> {
        StateManager::load_project_state(&self.project_path)
    }

    pub fn recommend_next_agent(&self) -> Result<Vec<AgentRecommendation>, BMadError> {
        let state = self.analyze_current_state()?;
        let mut recommendations = Vec::new();

        // Check for any urgent blockers first
        if let Some(blocker_recommendation) = self.check_for_blockers(&state)? {
            recommendations.push(blocker_recommendation);
        }

        // Analyze workload and agent availability
        let agent_workload = self.analyze_agent_workload(&state)?;

        match (&state.current_phase, &state.project_state) {
            (BMadPhase::Planning, ProjectStateType::Initializing) => {
                recommendations.push(AgentRecommendation {
                    agent: AgentType::ProductOwner,
                    reason: "Define project vision and stakeholder requirements".to_string(),
                    priority: 10,
                    estimated_time: Some("2-4 hours".to_string()),
                    prerequisites: vec!["Project concept defined".to_string()],
                });

                recommendations.push(AgentRecommendation {
                    agent: AgentType::Analyst,
                    reason: "Research market requirements and user needs".to_string(),
                    priority: 9,
                    estimated_time: Some("4-6 hours".to_string()),
                    prerequisites: vec!["Project vision available".to_string()],
                });
            }

            (BMadPhase::Planning, ProjectStateType::Planning) => {
                // Check if we have PRD
                if !self.artifact_exists("docs/prd.md")? {
                    recommendations.push(AgentRecommendation {
                        agent: AgentType::ProductManager,
                        reason: "Create Product Requirements Document (PRD)".to_string(),
                        priority: 10,
                        estimated_time: Some("3-5 hours".to_string()),
                        prerequisites: vec!["Analyst research complete".to_string()],
                    });
                }

                // Check if we have architecture
                if !self.artifact_exists("docs/architecture.md")? {
                    recommendations.push(AgentRecommendation {
                        agent: AgentType::Architect,
                        reason: "Design technical architecture and system design".to_string(),
                        priority: 9,
                        estimated_time: Some("4-8 hours".to_string()),
                        prerequisites: vec!["PRD available".to_string()],
                    });
                }

                // Check if we can transition to story creation
                if self.artifact_exists("docs/prd.md")? && self.artifact_exists("docs/architecture.md")? {
                    recommendations.push(AgentRecommendation {
                        agent: AgentType::ScrumMaster,
                        reason: "Break down requirements into development stories and plan sprint backlog".to_string(),
                        priority: 8,
                        estimated_time: Some("2-4 hours".to_string()),
                        prerequisites: vec!["PRD and Architecture complete".to_string()],
                    });
                    
                    // Also suggest stakeholder review before story creation
                    recommendations.push(AgentRecommendation {
                        agent: AgentType::ProductOwner,
                        reason: "Review and approve planning artifacts before story creation".to_string(),
                        priority: 7,
                        estimated_time: Some("1-2 hours".to_string()),
                        prerequisites: vec!["PRD and Architecture documents available".to_string()],
                    });
                }
            }

            (BMadPhase::StoryCreation, _) => {
                recommendations.push(AgentRecommendation {
                    agent: AgentType::ScrumMaster,
                    reason: "Create and prioritize development stories".to_string(),
                    priority: 10,
                    estimated_time: Some("2-3 hours".to_string()),
                    prerequisites: vec!["Architecture design complete".to_string()],
                });

                if self.has_ready_stories()? {
                    recommendations.push(AgentRecommendation {
                        agent: AgentType::Developer,
                        reason: "Begin implementation of highest priority story".to_string(),
                        priority: 9,
                        estimated_time: Some("Variable per story".to_string()),
                        prerequisites: vec!["Stories defined and prioritized".to_string()],
                    });
                }
            }

            (BMadPhase::Development, _) => {
                // Check for active story
                if let Some(active_story) = &state.active_story {
                    let story_completion = self.estimate_story_completion(active_story)?;
                    
                    if story_completion >= 0.8 {
                        // Story is nearly complete, prioritize QA
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::QualityAssurance,
                            reason: format!("Review and test completed story: {} (~{:.0}% complete)", active_story, story_completion * 100.0),
                            priority: 10,
                            estimated_time: Some("1-2 hours".to_string()),
                            prerequisites: vec!["Story implementation complete".to_string()],
                        });
                        
                        // Suggest parallel preparation of next story
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::ScrumMaster,
                            reason: "Prepare next story while current is in QA".to_string(),
                            priority: 6,
                            estimated_time: Some("30 minutes".to_string()),
                            prerequisites: vec!["Current story in QA".to_string()],
                        });
                    } else if story_completion >= 0.5 {
                        // Story is in progress, continue development but consider code review
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::Developer,
                            reason: format!("Continue development of: {} (~{:.0}% complete)", active_story, story_completion * 100.0),
                            priority: 9,
                            estimated_time: Some("2-4 hours".to_string()),
                            prerequisites: vec![],
                        });
                        
                        // Suggest mid-development review
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::Architect,
                            reason: "Mid-development architecture review and guidance".to_string(),
                            priority: 5,
                            estimated_time: Some("30 minutes".to_string()),
                            prerequisites: vec!["Partial implementation available".to_string()],
                        });
                    } else {
                        // Story just started, focus on core development
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::Developer,
                            reason: format!("Begin/continue implementation of: {}", active_story),
                            priority: 9,
                            estimated_time: Some("3-6 hours".to_string()),
                            prerequisites: vec![],
                        });
                        
                        // Check if design clarification is needed
                        if self.story_needs_design_clarification(active_story)? {
                            recommendations.push(AgentRecommendation {
                                agent: AgentType::UXExpert,
                                reason: "Provide design specifications and mockups for development".to_string(),
                                priority: 8,
                                estimated_time: Some("1-3 hours".to_string()),
                                prerequisites: vec!["Story requirements understood".to_string()],
                            });
                        }
                    }

                    // Check if UX review is needed for UI components
                    if self.story_needs_ux_review(active_story)? && story_completion >= 0.6 {
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::UXExpert,
                            reason: "Review user experience and interface implementation".to_string(),
                            priority: 7,
                            estimated_time: Some("1-2 hours".to_string()),
                            prerequisites: vec!["UI implementation available for review".to_string()],
                        });
                    }
                } else {
                    // No active story, suggest picking one
                    if self.has_ready_stories()? {
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::ScrumMaster,
                            reason: "Select and assign next high-priority story for development".to_string(),
                            priority: 9,
                            estimated_time: Some("30 minutes".to_string()),
                            prerequisites: vec!["Story backlog available".to_string()],
                        });
                        
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::Developer,
                            reason: "Review available stories and begin implementation".to_string(),
                            priority: 8,
                            estimated_time: Some("1 hour setup + implementation".to_string()),
                            prerequisites: vec!["Story selected for development".to_string()],
                        });
                    } else {
                        recommendations.push(AgentRecommendation {
                            agent: AgentType::ScrumMaster,
                            reason: "Create additional development stories - backlog appears empty".to_string(),
                            priority: 10,
                            estimated_time: Some("1-2 hours".to_string()),
                            prerequisites: vec!["Project requirements available".to_string()],
                        });
                    }
                }
            }

            (BMadPhase::QualityAssurance, _) => {
                recommendations.push(AgentRecommendation {
                    agent: AgentType::QualityAssurance,
                    reason: "Perform comprehensive quality assurance testing".to_string(),
                    priority: 10,
                    estimated_time: Some("2-4 hours".to_string()),
                    prerequisites: vec!["All stories implemented".to_string()],
                });

                // Check if we need final architecture review
                recommendations.push(AgentRecommendation {
                    agent: AgentType::Architect,
                    reason: "Final architecture and security review".to_string(),
                    priority: 8,
                    estimated_time: Some("1-2 hours".to_string()),
                    prerequisites: vec!["Implementation complete".to_string()],
                });
            }

            (BMadPhase::Complete, _) => {
                // Project is complete, minimal recommendations
                recommendations.push(AgentRecommendation {
                    agent: AgentType::ProductOwner,
                    reason: "Project review and stakeholder sign-off".to_string(),
                    priority: 5,
                    estimated_time: Some("1 hour".to_string()),
                    prerequisites: vec!["All quality checks passed".to_string()],
                });
            }
        }

        // Apply intelligent prioritization based on agent availability and dependencies
        self.apply_intelligent_prioritization(&mut recommendations, &agent_workload)?;

        // Remove blockers from earlier check since we already added them
        recommendations.retain(|rec| rec.priority < 10 || rec.reason.contains("Resolve blocker"));

        // Sort by priority (highest first) then by estimated impact
        recommendations.sort_by(|a, b| {
            b.priority.cmp(&a.priority)
                .then_with(|| self.estimate_impact_score(b).cmp(&self.estimate_impact_score(a)))
        });

        // Limit to most relevant recommendations
        recommendations.truncate(5);

        info!("Generated {} intelligent agent recommendations", recommendations.len());
        Ok(recommendations)
    }

    fn analyze_agent_workload(&self, state: &ProjectState) -> Result<HashMap<AgentType, f32>, BMadError> {
        let mut workload = HashMap::new();
        
        // Calculate workload based on current status and recent activity
        let agents = vec![
            (AgentType::Analyst, &state.agents.analyst),
            (AgentType::Architect, &state.agents.architect),
            (AgentType::ProductManager, &state.agents.product_manager),
            (AgentType::ProductOwner, &state.agents.product_owner),
            (AgentType::ScrumMaster, &state.agents.scrum_master),
            (AgentType::Developer, &state.agents.developer),
            (AgentType::QualityAssurance, &state.agents.quality_assurance),
            (AgentType::UXExpert, &state.agents.ux_expert),
        ];

        for (agent_type, agent_status) in agents {
            let mut load = 0.0f32;
            
            // Base load on current status
            match agent_status.status {
                AgentStatusType::Active => load += 0.8,
                AgentStatusType::Waiting => load += 0.3,
                AgentStatusType::Blocked => load += 1.0, // Fully loaded due to blocker
                AgentStatusType::Idle => load += 0.0,
            }
            
            // Factor in current task
            if agent_status.current_task.is_some() {
                load += 0.2;
            }
            
            // Recent activity bonus (lower load for recently active agents)
            if let Some(last_activity) = agent_status.last_activity {
                let hours_since = (Utc::now() - last_activity).num_hours();
                if hours_since < 2 {
                    load += 0.1; // Still working recently
                } else if hours_since > 24 {
                    load -= 0.1; // Ready for new work
                }
            }
            
            workload.insert(agent_type, load.max(0.0).min(1.0));
        }

        Ok(workload)
    }

    fn apply_intelligent_prioritization(
        &self, 
        recommendations: &mut Vec<AgentRecommendation>, 
        agent_workload: &HashMap<AgentType, f32>
    ) -> Result<(), BMadError> {
        for rec in recommendations.iter_mut() {
            let workload = agent_workload.get(&rec.agent).unwrap_or(&0.0);
            
            // Reduce priority for overloaded agents
            if *workload > 0.7 {
                rec.priority = (rec.priority as f32 * 0.7) as u8;
                rec.reason = format!("{} (Agent currently busy)", rec.reason);
            }
            
            // Boost priority for idle agents in critical phases
            if *workload < 0.2 && rec.priority >= 7 {
                rec.priority = (rec.priority as f32 * 1.2).min(10.0) as u8;
            }
        }
        
        Ok(())
    }

    fn estimate_impact_score(&self, recommendation: &AgentRecommendation) -> u8 {
        let mut score = recommendation.priority;
        
        // Boost score for critical path items
        if recommendation.prerequisites.is_empty() {
            score += 2; // Can start immediately
        }
        
        // Boost score for short tasks (quick wins)
        if let Some(time) = &recommendation.estimated_time {
            if time.contains("30 minutes") || time.contains("1 hour") {
                score += 1;
            }
        }
        
        // Boost score for phase-critical agents
        if recommendation.reason.contains("transition") || recommendation.reason.contains("complete") {
            score += 2;
        }
        
        score.min(10)
    }

    pub fn transition_phase(&self, to_phase: BMadPhase, trigger_agent: AgentType) -> Result<(), BMadError> {
        let mut state = self.analyze_current_state()?;
        let from_phase = state.current_phase.clone();

        // Validate transition is allowed
        if !self.is_transition_valid(&from_phase, &to_phase)? {
            return Err(BMadError::Workflow(format!(
                "Invalid transition from {:?} to {:?}", from_phase, to_phase
            )));
        }

        // Update state
        state.current_phase = to_phase.clone();
        
        // Update project state type if needed
        state.project_state = match to_phase {
            BMadPhase::Planning => ProjectStateType::Planning,
            BMadPhase::StoryCreation | BMadPhase::Development => ProjectStateType::Development,
            BMadPhase::QualityAssurance => ProjectStateType::QualityAssurance,
            BMadPhase::Complete => ProjectStateType::Complete,
        };

        // Add workflow event
        let event = WorkflowEvent {
            id: Uuid::new_v4(),
            event_type: WorkflowEventType::PhaseStart,
            agent: trigger_agent,
            description: format!("Transitioned from {:?} to {:?}", from_phase, to_phase),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        state.workflow_history.push(event);

        // Save updated state
        StateManager::save_project_state(&self.project_path, &state)?;

        info!("Successfully transitioned from {:?} to {:?}", from_phase, to_phase);
        Ok(())
    }

    pub fn start_story(&self, story_name: String, assigned_agent: AgentType) -> Result<(), BMadError> {
        let mut state = self.analyze_current_state()?;
        
        state.active_story = Some(story_name.clone());
        
        // Update agent status
        match assigned_agent {
            AgentType::Developer => {
                state.agents.developer.status = AgentStatusType::Active;
                state.agents.developer.current_task = Some(format!("Implementing story: {}", story_name));
                state.agents.developer.last_activity = Some(Utc::now());
            }
            _ => {
                warn!("Story assigned to non-developer agent: {:?}", assigned_agent);
            }
        }

        // Add workflow event
        let event = WorkflowEvent {
            id: Uuid::new_v4(),
            event_type: WorkflowEventType::StoryStart,
            agent: assigned_agent,
            description: format!("Started story: {}", story_name),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        state.workflow_history.push(event);

        StateManager::save_project_state(&self.project_path, &state)?;

        info!("Started story '{}' assigned to {:?}", story_name, assigned_agent);
        Ok(())
    }

    pub fn complete_story(&self, story_name: String, completing_agent: AgentType) -> Result<(), BMadError> {
        let mut state = self.analyze_current_state()?;
        
        // Clear active story if it matches
        if state.active_story.as_ref() == Some(&story_name) {
            state.active_story = None;
        }

        // Update agent status
        match completing_agent {
            AgentType::Developer => {
                state.agents.developer.status = AgentStatusType::Idle;
                state.agents.developer.current_task = None;
                state.agents.developer.last_activity = Some(Utc::now());
            }
            _ => {}
        }

        // Add workflow event
        let event = WorkflowEvent {
            id: Uuid::new_v4(),
            event_type: WorkflowEventType::StoryComplete,
            agent: completing_agent,
            description: format!("Completed story: {}", story_name),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        state.workflow_history.push(event);

        StateManager::save_project_state(&self.project_path, &state)?;

        // Create handoff message to QA if needed
        if self.story_needs_qa(&story_name)? {
            let message = self.communication_manager.create_message(
                completing_agent,
                Some(AgentType::QualityAssurance),
                format!("Story '{}' completed and ready for QA review. Please test functionality and verify requirements are met.", story_name),
                MessageType::Handoff,
                vec![],
            );
            self.communication_manager.save_message(&message)?;
        }

        info!("Completed story '{}' by {:?}", story_name, completing_agent);
        Ok(())
    }

    pub fn report_blocker(&self, agent: AgentType, description: String, affected_story: Option<String>) -> Result<(), BMadError> {
        let mut state = self.analyze_current_state()?;

        // Update agent status to blocked
        self.update_agent_status(&mut state, &agent, AgentStatusType::Blocked, Some(description.clone()))?;

        // Add workflow event
        let event = WorkflowEvent {
            id: Uuid::new_v4(),
            event_type: WorkflowEventType::BlockerReported,
            agent: agent.clone(),
            description: format!("Blocker reported: {}", description),
            timestamp: Utc::now(),
            metadata: {
                let mut meta = HashMap::new();
                if let Some(story) = &affected_story {
                    meta.insert("affected_story".to_string(), serde_json::Value::String(story.clone()));
                }
                meta
            },
        };
        state.workflow_history.push(event);

        StateManager::save_project_state(&self.project_path, &state)?;

        // Create blocker report message
        let message = self.communication_manager.create_message(
            agent,
            None, // Broadcast to team
            format!("🚫 **Blocker Reported**\n\n{}\n\n**Affected Story:** {}\n\nPlease assist in resolving this blocker.", 
                description, 
                affected_story.unwrap_or("General".to_string())
            ),
            MessageType::BlockerReport,
            vec![],
        );
        self.communication_manager.save_message(&message)?;

        warn!("Blocker reported by {:?}: {}", agent, description);
        Ok(())
    }

    pub fn resolve_blocker(&self, resolver_agent: AgentType, blocked_agent: AgentType, resolution: String) -> Result<(), BMadError> {
        let mut state = self.analyze_current_state()?;

        // Update blocked agent status back to idle/active
        self.update_agent_status(&mut state, &blocked_agent, AgentStatusType::Idle, None)?;

        // Add workflow event
        let event = WorkflowEvent {
            id: Uuid::new_v4(),
            event_type: WorkflowEventType::BlockerResolved,
            agent: resolver_agent.clone(),
            description: format!("Resolved blocker for {:?}: {}", blocked_agent, resolution),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        state.workflow_history.push(event);

        StateManager::save_project_state(&self.project_path, &state)?;

        // Create resolution message
        let message = self.communication_manager.create_message(
            resolver_agent,
            Some(blocked_agent),
            format!("✅ **Blocker Resolved**\n\n{}\n\nYou can now continue with your tasks.", resolution),
            MessageType::Update,
            vec![],
        );
        self.communication_manager.save_message(&message)?;

        info!("Blocker resolved by {:?} for {:?}", resolver_agent, blocked_agent);
        Ok(())
    }

    fn artifact_exists(&self, relative_path: &str) -> Result<bool, BMadError> {
        let full_path = self.project_path.join(relative_path);
        Ok(full_path.exists())
    }

    fn has_ready_stories(&self) -> Result<bool, BMadError> {
        let stories_dir = self.project_path.join("docs").join("stories");
        if !stories_dir.exists() {
            return Ok(false);
        }

        for entry in std::fs::read_dir(stories_dir)? {
            let entry = entry?;
            if entry.path().extension().map_or(false, |ext| ext == "md") {
                return Ok(true);
            }
        }

        Ok(false)
    }

    fn story_needs_qa(&self, _story_name: &str) -> Result<bool, BMadError> {
        // Simple heuristic: all stories need QA review
        Ok(true)
    }

    fn story_needs_ux_review(&self, story_name: &str) -> Result<bool, BMadError> {
        // Check if story involves UI/UX work
        let ui_keywords = ["ui", "interface", "design", "user", "frontend", "page", "component"];
        Ok(ui_keywords.iter().any(|keyword| story_name.to_lowercase().contains(keyword)))
    }

    fn story_needs_design_clarification(&self, story_name: &str) -> Result<bool, BMadError> {
        // Check if story involves UI/UX work that might need design specs
        let design_keywords = ["interface", "design", "user", "frontend", "page", "component", "layout", "form"];
        let has_design_elements = design_keywords.iter().any(|keyword| story_name.to_lowercase().contains(keyword));
        
        // Check if design artifacts exist
        let design_artifacts_exist = self.artifact_exists("docs/designs")? || 
                                   self.artifact_exists("docs/mockups")? ||
                                   self.artifact_exists("docs/wireframes")?;
        
        Ok(has_design_elements && !design_artifacts_exist)
    }

    fn estimate_story_completion(&self, story_name: &str) -> Result<f32, BMadError> {
        // Simple heuristic based on file presence and modification times
        let story_slug = story_name.to_lowercase().replace(' ', "_");
        
        let mut completion_indicators = 0;
        let mut total_indicators = 0;
        
        // Check for implementation files
        total_indicators += 1;
        if self.artifact_exists(&format!("src/{}", story_slug))? {
            completion_indicators += 1;
        }
        
        // Check for test files
        total_indicators += 1;
        if self.artifact_exists(&format!("tests/{}", story_slug))? {
            completion_indicators += 1;
        }
        
        // Check for documentation updates
        total_indicators += 1;
        if self.artifact_exists(&format!("docs/stories/{}.md", story_slug))? {
            completion_indicators += 1;
        }
        
        // Default to 30% if we can't determine (story is active so has some progress)
        if total_indicators == 0 {
            return Ok(0.3);
        }
        
        Ok(completion_indicators as f32 / total_indicators as f32)
    }

    fn is_transition_valid(&self, from: &BMadPhase, to: &BMadPhase) -> Result<bool, BMadError> {
        match (from, to) {
            (BMadPhase::Planning, BMadPhase::StoryCreation) => Ok(true),
            (BMadPhase::StoryCreation, BMadPhase::Development) => Ok(true),
            (BMadPhase::Development, BMadPhase::QualityAssurance) => Ok(true),
            (BMadPhase::QualityAssurance, BMadPhase::Complete) => Ok(true),
            // Allow backward transitions for corrections
            (BMadPhase::StoryCreation, BMadPhase::Planning) => Ok(true),
            (BMadPhase::Development, BMadPhase::StoryCreation) => Ok(true),
            (BMadPhase::QualityAssurance, BMadPhase::Development) => Ok(true),
            _ => Ok(false),
        }
    }

    fn check_for_blockers(&self, state: &ProjectState) -> Result<Option<AgentRecommendation>, BMadError> {
        // Check if any agents are blocked
        let blocked_agents = vec![
            (&state.agents.analyst, AgentType::Analyst),
            (&state.agents.architect, AgentType::Architect),
            (&state.agents.product_manager, AgentType::ProductManager),
            (&state.agents.product_owner, AgentType::ProductOwner),
            (&state.agents.scrum_master, AgentType::ScrumMaster),
            (&state.agents.developer, AgentType::Developer),
            (&state.agents.quality_assurance, AgentType::QualityAssurance),
            (&state.agents.ux_expert, AgentType::UXExpert),
        ];

        for (agent_status, agent_type) in blocked_agents {
            if agent_status.status == AgentStatusType::Blocked {
                return Ok(Some(AgentRecommendation {
                    agent: AgentType::ProductManager, // PM coordinates blocker resolution
                    reason: format!("Resolve blocker for {:?}", agent_type),
                    priority: 10, // Highest priority
                    estimated_time: Some("30 minutes - 2 hours".to_string()),
                    prerequisites: vec!["Investigate blocker cause".to_string()],
                }));
            }
        }

        Ok(None)
    }

    fn update_agent_status(
        &self, 
        state: &mut ProjectState, 
        agent: &AgentType, 
        status: AgentStatusType, 
        task: Option<String>
    ) -> Result<(), BMadError> {
        let agent_status = match agent {
            AgentType::Analyst => &mut state.agents.analyst,
            AgentType::Architect => &mut state.agents.architect,
            AgentType::ProductManager => &mut state.agents.product_manager,
            AgentType::ProductOwner => &mut state.agents.product_owner,
            AgentType::ScrumMaster => &mut state.agents.scrum_master,
            AgentType::Developer => &mut state.agents.developer,
            AgentType::QualityAssurance => &mut state.agents.quality_assurance,
            AgentType::UXExpert => &mut state.agents.ux_expert,
            AgentType::BMadOrchestrator => return Ok(()), // Orchestrator doesn't have status
        };

        agent_status.status = status;
        agent_status.current_task = task;
        agent_status.last_activity = Some(Utc::now());

        Ok(())
    }

    pub fn get_workflow_summary(&self) -> Result<String, BMadError> {
        let state = self.analyze_current_state()?;
        let recommendations = self.recommend_next_agent()?;

        let mut summary = format!(
            "# BMAD Workflow Summary\n\n**Current Phase:** {:?}\n**Project State:** {:?}\n",
            state.current_phase, state.project_state
        );

        if let Some(active_story) = &state.active_story {
            summary.push_str(&format!("**Active Story:** {}\n", active_story));
        }

        summary.push_str("\n## Recommended Next Actions\n");
        for (i, rec) in recommendations.iter().take(3).enumerate() {
            summary.push_str(&format!(
                "{}. **{}** - {} (Priority: {}/10)\n",
                i + 1,
                self.agent_display_name(&rec.agent),
                rec.reason,
                rec.priority
            ));
        }

        summary.push_str(&format!("\n## Recent Activity\n"));
        for event in state.workflow_history.iter().rev().take(5) {
            summary.push_str(&format!(
                "- {} - {} ({})\n",
                event.timestamp.format("%m/%d %H:%M"),
                event.description,
                self.agent_display_name(&event.agent)
            ));
        }

        Ok(summary)
    }

    fn agent_display_name(&self, agent: &AgentType) -> &'static str {
        match agent {
            AgentType::Analyst => "Analyst",
            AgentType::Architect => "Architect", 
            AgentType::ProductManager => "Product Manager",
            AgentType::ProductOwner => "Product Owner",
            AgentType::ScrumMaster => "Scrum Master",
            AgentType::Developer => "Developer",
            AgentType::QualityAssurance => "QA",
            AgentType::UXExpert => "UX Expert",
            AgentType::BMadOrchestrator => "BMAD Orchestrator",
        }
    }
}