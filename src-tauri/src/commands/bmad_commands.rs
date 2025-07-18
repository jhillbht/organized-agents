// BMAD Desktop command handlers for Tauri frontend

use crate::bmad::{
    types::{BMadProject, BMadError, AgentType, BMadPhase},
    ProjectManager, WorkflowManager, CommunicationManager
};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

type ProjectManagerState = Mutex<ProjectManager>;

// Project Management Commands

#[tauri::command]
pub async fn discover_bmad_projects(
    project_manager: State<'_, ProjectManagerState>,
    root_directories: Vec<String>,
) -> Result<Vec<BMadProject>, String> {
    let paths: Vec<PathBuf> = root_directories.into_iter().map(PathBuf::from).collect();
    
    project_manager
        .lock()
        .unwrap()
        .discover_projects(paths)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_bmad_project(
    project_manager: State<'_, ProjectManagerState>,
    name: String,
    path: String,
) -> Result<BMadProject, String> {
    let request = crate::bmad::project::ProjectCreationRequest {
        name,
        path: PathBuf::from(path),
        ..Default::default()
    };
    
    project_manager
        .lock()
        .unwrap()
        .create_project(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_bmad_projects(
    project_manager: State<'_, ProjectManagerState>,
) -> Result<Vec<BMadProject>, String> {
    let projects = project_manager
        .lock()
        .unwrap()
        .list_projects()
        .into_iter()
        .cloned()
        .collect();
    
    Ok(projects)
}

#[tauri::command]
pub async fn get_bmad_project(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
) -> Result<BMadProject, String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    project_manager
        .lock()
        .unwrap()
        .load_project(uuid)
        .map(|p| p.clone())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_active_bmad_project(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    project_manager
        .lock()
        .unwrap()
        .set_active_project(uuid)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_active_bmad_project(
    project_manager: State<'_, ProjectManagerState>,
) -> Result<Option<BMadProject>, String> {
    Ok(project_manager
        .lock()
        .unwrap()
        .get_active_project()
        .cloned())
}

#[tauri::command]
pub async fn delete_bmad_project(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    delete_files: bool,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    project_manager
        .lock()
        .unwrap()
        .delete_project(uuid, delete_files)
        .map_err(|e| e.to_string())
}

// Workflow Management Commands

#[tauri::command]
pub async fn get_agent_recommendations(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
) -> Result<Vec<crate::bmad::workflow::AgentRecommendation>, String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.recommend_next_agent().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn transition_bmad_phase(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    to_phase: String,
    trigger_agent: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let phase: BMadPhase = serde_json::from_str(&format!("\"{}\"", to_phase))
        .map_err(|e| e.to_string())?;
    let agent: AgentType = serde_json::from_str(&format!("\"{}\"", trigger_agent))
        .map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.transition_phase(phase, agent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_story(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    story_name: String,
    assigned_agent: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let agent: AgentType = serde_json::from_str(&format!("\"{}\"", assigned_agent))
        .map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.start_story(story_name, agent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn complete_story(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    story_name: String,
    completing_agent: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let agent: AgentType = serde_json::from_str(&format!("\"{}\"", completing_agent))
        .map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.complete_story(story_name, agent).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn report_blocker(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    agent: String,
    description: String,
    affected_story: Option<String>,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let agent_type: AgentType = serde_json::from_str(&format!("\"{}\"", agent))
        .map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.report_blocker(agent_type, description, affected_story)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_workflow_summary(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
) -> Result<String, String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let workflow_manager = WorkflowManager::new(&project.path);
    workflow_manager.get_workflow_summary().map_err(|e| e.to_string())
}

// Communication Commands

#[tauri::command]
pub async fn get_project_messages(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
) -> Result<Vec<crate::bmad::types::AgentMessage>, String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let comm_manager = CommunicationManager::new(&project.path);
    comm_manager.load_all_messages().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_agent_message(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    from_agent: String,
    to_agent: Option<String>,
    content: String,
    message_type: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let from: AgentType = serde_json::from_str(&format!("\"{}\"", from_agent))
        .map_err(|e| e.to_string())?;
    let to: Option<AgentType> = to_agent.map(|agent| 
        serde_json::from_str(&format!("\"{}\"", agent))
    ).transpose().map_err(|e: serde_json::Error| e.to_string())?;
    let msg_type: crate::bmad::types::MessageType = serde_json::from_str(&format!("\"{}\"", message_type))
        .map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let comm_manager = CommunicationManager::new(&project.path);
    let message = comm_manager.create_message(from, to, content, msg_type, vec![]);
    comm_manager.save_message(&message).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn mark_message_read(
    project_manager: State<'_, ProjectManagerState>,
    project_id: String,
    message_id: String,
) -> Result<(), String> {
    let uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    let msg_uuid = Uuid::parse_str(&message_id).map_err(|e| e.to_string())?;
    
    let project = project_manager
        .lock()
        .unwrap()
        .get_project(uuid)
        .ok_or("Project not found")?;
    
    let comm_manager = CommunicationManager::new(&project.path);
    comm_manager.mark_message_read(msg_uuid).map_err(|e| e.to_string())
}

// IDE Integration Commands

#[tauri::command]
pub async fn launch_ide_with_context(
    project_id: String,
    ide_name: String,
    story_context: Option<String>,
) -> Result<(), String> {
    // This will be implemented later with actual IDE detection and launching
    tracing::info!("Launching {} for project {} with context: {:?}", 
        ide_name, project_id, story_context);
    
    // For now, just return success
    Ok(())
}

#[tauri::command]
pub async fn detect_installed_ides() -> Result<Vec<String>, String> {
    // This will be implemented later with actual IDE detection
    Ok(vec![
        "VS Code".to_string(),
        "Cursor".to_string(),
        "Windsurf".to_string(),
    ])
}

// File Operations

#[tauri::command]
pub async fn validate_bmad_project(project_path: String) -> Result<bool, String> {
    Ok(crate::bmad::ProjectManager::validate_project(PathBuf::from(project_path))
        .map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn create_bmad_structure(project_path: String) -> Result<(), String> {
    crate::bmad::FileWatcher::create_bmad_structure(PathBuf::from(project_path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project_statistics(
    project_manager: State<'_, ProjectManagerState>,
) -> Result<std::collections::HashMap<String, serde_json::Value>, String> {
    Ok(project_manager.lock().unwrap().get_project_statistics())
}