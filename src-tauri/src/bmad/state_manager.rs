use crate::bmad::types::{
    BMadError, BMadPhase, ProjectState, ProjectStateType, NextAction, WorkflowEvent,
    AgentStatuses, AgentStatus, AgentStatusType, AgentType
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tracing::{debug, error, info, warn};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawProjectState {
    pub bmad_version: String,
    pub project_state: String,
    pub current_phase: String,
    pub active_story: Option<String>,
    pub phases: HashMap<String, RawPhaseInfo>,
    pub next_actions: Vec<RawNextAction>,
    pub agents: HashMap<String, RawAgentStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawPhaseInfo {
    pub status: String,
    pub artifacts: Option<Vec<String>>,
    pub stories_created: Option<u32>,
    pub stories_ready: Option<u32>,
    pub current_story: Option<String>,
    pub assigned_agent: Option<String>,
    pub completed_at: Option<String>,
    pub started_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawNextAction {
    pub agent: String,
    pub task: String,
    pub story: Option<String>,
    pub estimated_time: Option<String>,
    pub depends_on: Option<String>,
    pub auto_trigger: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawAgentStatus {
    pub status: String,
    pub current_task: Option<String>,
    pub last_activity: Option<String>,
    pub queue_position: Option<usize>,
    pub estimated_start: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionState {
    pub session_id: Option<Uuid>,
    pub started_at: Option<DateTime<Utc>>,
    pub last_activity: Option<DateTime<Utc>>,
    pub active_agents: Vec<AgentType>,
    pub session_notes: String,
}

pub struct StateManager;

impl StateManager {
    pub fn new() -> Self {
        StateManager
    }

    // Static project path lookup by ID (should integrate with project registry)
    pub fn get_project_path_by_id(project_id: &str) -> Option<PathBuf> {
        // For now, implement a simple lookup
        // In a real implementation, this would query a project registry
        let projects_dir = dirs::home_dir()?.join("bmad_projects");
        let project_path = projects_dir.join(project_id);
        
        if project_path.exists() {
            Some(project_path)
        } else {
            None
        }
    }

    pub fn load_project_state<P: AsRef<Path>>(project_path: P) -> Result<ProjectState, BMadError> {
        let state_file = project_path.as_ref().join(".bmad").join("state.yaml");
        
        if !state_file.exists() {
            return Err(BMadError::ProjectNotFound(format!(
                "State file not found: {:?}", state_file
            )));
        }

        debug!("Loading project state from: {:?}", state_file);
        
        let content = std::fs::read_to_string(&state_file)?;
        let raw_state: RawProjectState = serde_yaml::from_str(&content)?;
        
        let project_state = Self::convert_raw_state(raw_state)?;
        
        info!("Successfully loaded project state from: {:?}", state_file);
        Ok(project_state)
    }

    pub fn save_project_state<P: AsRef<Path>>(
        project_path: P, 
        state: &ProjectState
    ) -> Result<(), BMadError> {
        let state_file = project_path.as_ref().join(".bmad").join("state.yaml");
        
        debug!("Saving project state to: {:?}", state_file);
        
        let raw_state = Self::convert_to_raw_state(state)?;
        let content = serde_yaml::to_string(&raw_state)?;
        
        // Create backup of existing state
        if state_file.exists() {
            let backup_file = state_file.with_extension("yaml.backup");
            if let Err(e) = std::fs::copy(&state_file, &backup_file) {
                warn!("Failed to create backup: {}", e);
            }
        }
        
        std::fs::write(&state_file, content)?;
        
        info!("Successfully saved project state to: {:?}", state_file);
        Ok(())
    }

    pub fn load_session_state<P: AsRef<Path>>(project_path: P) -> Result<SessionState, BMadError> {
        let session_file = project_path.as_ref().join(".bmad").join("session.yaml");
        
        if !session_file.exists() {
            // Return default session state
            return Ok(SessionState {
                session_id: None,
                started_at: None,
                last_activity: None,
                active_agents: Vec::new(),
                session_notes: String::new(),
            });
        }

        debug!("Loading session state from: {:?}", session_file);
        
        let content = std::fs::read_to_string(&session_file)?;
        let session_state: SessionState = serde_yaml::from_str(&content)?;
        
        Ok(session_state)
    }

    pub fn save_session_state<P: AsRef<Path>>(
        project_path: P, 
        session: &SessionState
    ) -> Result<(), BMadError> {
        let session_file = project_path.as_ref().join(".bmad").join("session.yaml");
        
        debug!("Saving session state to: {:?}", session_file);
        
        let content = serde_yaml::to_string(session)?;
        std::fs::write(&session_file, content)?;
        
        info!("Successfully saved session state to: {:?}", session_file);
        Ok(())
    }

    fn convert_raw_state(raw: RawProjectState) -> Result<ProjectState, BMadError> {
        let project_state = match raw.project_state.as_str() {
            "initializing" => ProjectStateType::Initializing,
            "planning" => ProjectStateType::Planning,
            "development" => ProjectStateType::Development,
            "quality_assurance" => ProjectStateType::QualityAssurance,
            "complete" => ProjectStateType::Complete,
            "on_hold" => ProjectStateType::OnHold,
            "archived" => ProjectStateType::Archived,
            _ => {
                warn!("Unknown project state: {}, defaulting to Initializing", raw.project_state);
                ProjectStateType::Initializing
            }
        };

        let current_phase = match raw.current_phase.as_str() {
            "planning" => BMadPhase::Planning,
            "story_creation" => BMadPhase::StoryCreation,
            "development" => BMadPhase::Development,
            "quality_assurance" => BMadPhase::QualityAssurance,
            "complete" => BMadPhase::Complete,
            _ => {
                warn!("Unknown phase: {}, defaulting to Planning", raw.current_phase);
                BMadPhase::Planning
            }
        };

        let next_actions = raw.next_actions.into_iter()
            .filter_map(|action| Self::convert_raw_action(action).ok())
            .collect();

        let agents = Self::convert_raw_agents(raw.agents)?;

        Ok(ProjectState {
            bmad_version: raw.bmad_version,
            project_state,
            current_phase,
            active_story: raw.active_story,
            next_actions,
            workflow_history: Vec::new(), // Load separately if needed
            agents,
        })
    }

    fn convert_to_raw_state(state: &ProjectState) -> Result<RawProjectState, BMadError> {
        let project_state = match state.project_state {
            ProjectStateType::Initializing => "initializing",
            ProjectStateType::Planning => "planning",
            ProjectStateType::Development => "development",
            ProjectStateType::QualityAssurance => "quality_assurance",
            ProjectStateType::Complete => "complete",
            ProjectStateType::OnHold => "on_hold",
            ProjectStateType::Archived => "archived",
        }.to_string();

        let current_phase = match state.current_phase {
            BMadPhase::Planning => "planning",
            BMadPhase::StoryCreation => "story_creation",
            BMadPhase::Development => "development",
            BMadPhase::QualityAssurance => "quality_assurance",
            BMadPhase::Complete => "complete",
        }.to_string();

        let next_actions = state.next_actions.iter()
            .map(|action| Self::convert_to_raw_action(action))
            .collect();

        let agents = Self::convert_to_raw_agents(&state.agents);

        Ok(RawProjectState {
            bmad_version: state.bmad_version.clone(),
            project_state,
            current_phase,
            active_story: state.active_story.clone(),
            phases: HashMap::new(), // Simplified for now
            next_actions,
            agents,
        })
    }

    fn convert_raw_action(raw: RawNextAction) -> Result<NextAction, BMadError> {
        let agent = Self::parse_agent_type(&raw.agent)?;
        
        Ok(NextAction {
            agent,
            task: raw.task,
            story: raw.story,
            estimated_time: raw.estimated_time,
            dependencies: raw.depends_on.map(|d| vec![d]).unwrap_or_default(),
            auto_trigger: raw.auto_trigger.unwrap_or(false),
        })
    }

    fn convert_to_raw_action(action: &NextAction) -> RawNextAction {
        RawNextAction {
            agent: Self::agent_type_to_string(&action.agent),
            task: action.task.clone(),
            story: action.story.clone(),
            estimated_time: action.estimated_time.clone(),
            depends_on: action.dependencies.first().cloned(),
            auto_trigger: Some(action.auto_trigger),
        }
    }

    fn convert_raw_agents(raw_agents: HashMap<String, RawAgentStatus>) -> Result<AgentStatuses, BMadError> {
        let default_status = AgentStatus {
            status: AgentStatusType::Idle,
            current_task: None,
            last_activity: None,
            queue_position: None,
            estimated_start: None,
        };

        Ok(AgentStatuses {
            analyst: Self::convert_raw_agent_status(
                raw_agents.get("analyst").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            architect: Self::convert_raw_agent_status(
                raw_agents.get("architect").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            product_manager: Self::convert_raw_agent_status(
                raw_agents.get("product_manager").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            product_owner: Self::convert_raw_agent_status(
                raw_agents.get("product_owner").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            scrum_master: Self::convert_raw_agent_status(
                raw_agents.get("scrum_master").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            developer: Self::convert_raw_agent_status(
                raw_agents.get("developer").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            quality_assurance: Self::convert_raw_agent_status(
                raw_agents.get("quality_assurance").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status.clone()),
            ux_expert: Self::convert_raw_agent_status(
                raw_agents.get("ux_expert").cloned().unwrap_or_else(|| RawAgentStatus {
                    status: "idle".to_string(),
                    current_task: None,
                    last_activity: None,
                    queue_position: None,
                    estimated_start: None,
                })
            ).unwrap_or_else(|_| default_status),
        })
    }

    fn convert_to_raw_agents(agents: &AgentStatuses) -> HashMap<String, RawAgentStatus> {
        let mut raw_agents = HashMap::new();
        
        raw_agents.insert("analyst".to_string(), Self::convert_to_raw_agent_status(&agents.analyst));
        raw_agents.insert("architect".to_string(), Self::convert_to_raw_agent_status(&agents.architect));
        raw_agents.insert("product_manager".to_string(), Self::convert_to_raw_agent_status(&agents.product_manager));
        raw_agents.insert("product_owner".to_string(), Self::convert_to_raw_agent_status(&agents.product_owner));
        raw_agents.insert("scrum_master".to_string(), Self::convert_to_raw_agent_status(&agents.scrum_master));
        raw_agents.insert("developer".to_string(), Self::convert_to_raw_agent_status(&agents.developer));
        raw_agents.insert("quality_assurance".to_string(), Self::convert_to_raw_agent_status(&agents.quality_assurance));
        raw_agents.insert("ux_expert".to_string(), Self::convert_to_raw_agent_status(&agents.ux_expert));
        
        raw_agents
    }

    fn convert_raw_agent_status(raw: RawAgentStatus) -> Result<AgentStatus, BMadError> {
        let status = match raw.status.as_str() {
            "idle" => AgentStatusType::Idle,
            "active" => AgentStatusType::Active,
            "waiting" => AgentStatusType::Waiting,
            "blocked" => AgentStatusType::Blocked,
            "offline" => AgentStatusType::Offline,
            _ => {
                warn!("Unknown agent status: {}, defaulting to Idle", raw.status);
                AgentStatusType::Idle
            }
        };

        let last_activity = if let Some(timestamp_str) = raw.last_activity {
            DateTime::parse_from_rfc3339(&timestamp_str)
                .map(|dt| dt.with_timezone(&Utc))
                .ok()
        } else {
            None
        };

        let estimated_start = if let Some(timestamp_str) = raw.estimated_start {
            DateTime::parse_from_rfc3339(&timestamp_str)
                .map(|dt| dt.with_timezone(&Utc))
                .ok()
        } else {
            None
        };

        Ok(AgentStatus {
            status,
            current_task: raw.current_task,
            last_activity,
            queue_position: raw.queue_position,
            estimated_start,
        })
    }

    fn convert_to_raw_agent_status(status: &AgentStatus) -> RawAgentStatus {
        let status_str = match status.status {
            AgentStatusType::Idle => "idle",
            AgentStatusType::Active => "active",
            AgentStatusType::Waiting => "waiting",
            AgentStatusType::Blocked => "blocked",
            AgentStatusType::Offline => "offline",
        }.to_string();

        RawAgentStatus {
            status: status_str,
            current_task: status.current_task.clone(),
            last_activity: status.last_activity.map(|dt| dt.to_rfc3339()),
            queue_position: status.queue_position,
            estimated_start: status.estimated_start.map(|dt| dt.to_rfc3339()),
        }
    }

    fn parse_agent_type(agent_str: &str) -> Result<AgentType, BMadError> {
        match agent_str {
            "analyst" => Ok(AgentType::Analyst),
            "architect" => Ok(AgentType::Architect),
            "product_manager" => Ok(AgentType::ProductManager),
            "product_owner" => Ok(AgentType::ProductOwner),
            "scrum_master" => Ok(AgentType::ScrumMaster),
            "developer" => Ok(AgentType::Developer),
            "quality_assurance" => Ok(AgentType::QualityAssurance),
            "ux_expert" => Ok(AgentType::UXExpert),
            "bmad_orchestrator" => Ok(AgentType::BMadOrchestrator),
            _ => Err(BMadError::InvalidProjectState(format!("Unknown agent type: {}", agent_str)))
        }
    }

    fn agent_type_to_string(agent: &AgentType) -> String {
        match agent {
            AgentType::Analyst => "analyst",
            AgentType::Architect => "architect",
            AgentType::ProductManager => "product_manager",
            AgentType::ProductOwner => "product_owner",
            AgentType::ScrumMaster => "scrum_master",
            AgentType::Developer => "developer",
            AgentType::QualityAssurance => "quality_assurance",
            AgentType::UXExpert => "ux_expert",
            AgentType::BMadOrchestrator => "bmad_orchestrator",
        }.to_string()
    }

    pub fn validate_state_file<P: AsRef<Path>>(state_file: P) -> Result<bool, BMadError> {
        let path = state_file.as_ref();
        if !path.exists() {
            return Ok(false);
        }

        let content = std::fs::read_to_string(path)?;
        match serde_yaml::from_str::<RawProjectState>(&content) {
            Ok(_) => Ok(true),
            Err(e) => {
                error!("Invalid state file format: {}", e);
                Ok(false)
            }
        }
    }
}