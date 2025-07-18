// Core BMAD types
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BMadProject {
    pub id: Uuid,
    pub name: String,
    pub path: PathBuf,
    pub state: ProjectState,
    pub communications: Vec<AgentMessage>,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub settings: ProjectSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub bmad_version: String,
    pub project_state: ProjectStateType,
    pub current_phase: BMadPhase,
    pub active_story: Option<String>,
    pub next_actions: Vec<NextAction>,
    pub workflow_history: Vec<WorkflowEvent>,
    pub agents: AgentStatuses,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BMadPhase {
    Planning,
    StoryCreation,
    Development,
    QualityAssurance,
    Complete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectStateType {
    Initializing,
    Planning,
    Development,
    QualityAssurance,
    Complete,
    OnHold,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    pub id: Uuid,
    pub from_agent: AgentType,
    pub to_agent: Option<AgentType>,
    pub content: String,
    pub message_type: MessageType,
    pub files_referenced: Vec<PathBuf>,
    pub timestamp: DateTime<Utc>,
    pub status: MessageStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentType {
    Analyst,
    Architect,
    ProductManager,
    ProductOwner,
    ScrumMaster,
    Developer,
    QualityAssurance,
    UXExpert,
    BMadOrchestrator,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Handoff,
    Question,
    Update,
    Completion,
    BlockerReport,
    ContextShare,
    Assignment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageStatus {
    Pending,
    Read,
    Processed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NextAction {
    pub agent: AgentType,
    pub task: String,
    pub story: Option<String>,
    pub estimated_time: Option<String>,
    pub dependencies: Vec<String>,
    pub auto_trigger: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowEvent {
    pub id: Uuid,
    pub event_type: WorkflowEventType,
    pub agent: AgentType,
    pub description: String,
    pub timestamp: DateTime<Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkflowEventType {
    PhaseStart,
    PhaseComplete,
    StoryStart,
    StoryComplete,
    AgentHandoff,
    BlockerReported,
    BlockerResolved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub ide_preference: Option<String>,
    pub auto_trigger_agents: bool,
    pub notification_settings: NotificationSettings,
    pub quality_gates: QualityGates,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub desktop_notifications: bool,
    pub agent_handoffs: bool,
    pub story_completions: bool,
    pub blockers: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGates {
    pub require_tests: bool,
    pub require_documentation: bool,
    pub require_architecture_approval: bool,
    pub require_security_review: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStatuses {
    pub analyst: AgentStatus,
    pub architect: AgentStatus,
    pub product_manager: AgentStatus,
    pub product_owner: AgentStatus,
    pub scrum_master: AgentStatus,
    pub developer: AgentStatus,
    pub quality_assurance: AgentStatus,
    pub ux_expert: AgentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStatus {
    pub status: AgentStatusType,
    pub current_task: Option<String>,
    pub last_activity: Option<DateTime<Utc>>,
    pub queue_position: Option<usize>,
    pub estimated_start: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentStatusType {
    Idle,
    Active,
    Waiting,
    Blocked,
    Offline,
}

// Error types for BMAD operations
#[derive(Debug, thiserror::Error)]
pub enum BMadError {
    #[error("File system error: {0}")]
    FileSystem(#[from] std::io::Error),
    
    #[error("YAML parsing error: {0}")]
    YamlParsing(#[from] serde_yaml::Error),
    
    #[error("JSON parsing error: {0}")]
    JsonParsing(#[from] serde_json::Error),
    
    #[error("Project not found: {0}")]
    ProjectNotFound(String),
    
    #[error("Invalid project state: {0}")]
    InvalidProjectState(String),
    
    #[error("Communication error: {0}")]
    Communication(String),
    
    #[error("Workflow error: {0}")]
    Workflow(String),
}