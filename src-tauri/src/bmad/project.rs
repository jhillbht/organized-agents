use crate::bmad::types::{
    BMadError, BMadProject, ProjectState, ProjectSettings, NotificationSettings, QualityGates
};
use crate::bmad::{StateManager, FileWatcher, CommunicationManager, WorkflowManager};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tracing::{debug, error, info, warn};
use uuid::Uuid;

pub struct ProjectManager {
    projects: HashMap<Uuid, BMadProject>,
    active_project: Option<Uuid>,
    file_watcher: Option<FileWatcher>,
}

#[derive(Debug, Clone)]
pub struct ProjectCreationRequest {
    pub name: String,
    pub path: PathBuf,
    pub description: Option<String>,
    pub ide_preference: Option<String>,
    pub auto_trigger_agents: bool,
    pub notification_settings: NotificationSettings,
    pub quality_gates: QualityGates,
}

impl Default for ProjectCreationRequest {
    fn default() -> Self {
        ProjectCreationRequest {
            name: "New BMAD Project".to_string(),
            path: PathBuf::new(),
            description: None,
            ide_preference: None,
            auto_trigger_agents: true,
            notification_settings: NotificationSettings {
                desktop_notifications: true,
                agent_handoffs: true,
                story_completions: true,
                blockers: true,
            },
            quality_gates: QualityGates {
                require_tests: true,
                require_documentation: true,
                require_architecture_approval: true,
                require_security_review: false,
            },
        }
    }
}

impl ProjectManager {
    pub fn new() -> Result<Self, BMadError> {
        let mut manager = ProjectManager {
            projects: HashMap::new(),
            active_project: None,
            file_watcher: None,
        };

        // Initialize file watcher
        match FileWatcher::new() {
            Ok(watcher) => {
                manager.file_watcher = Some(watcher);
                info!("File watcher initialized successfully");
            }
            Err(e) => {
                warn!("Failed to initialize file watcher: {}", e);
            }
        }

        Ok(manager)
    }

    pub fn discover_projects<P: AsRef<Path>>(&mut self, root_dirs: Vec<P>) -> Result<Vec<BMadProject>, BMadError> {
        let mut discovered_projects = Vec::new();

        for root_dir in root_dirs {
            let project_paths = FileWatcher::discover_bmad_projects(&root_dir)?;
            
            for path in project_paths {
                match self.load_project_from_path(&path) {
                    Ok(project) => {
                        discovered_projects.push(project.clone());
                        self.projects.insert(project.id, project);
                    }
                    Err(e) => {
                        warn!("Failed to load project from {:?}: {}", path, e);
                    }
                }
            }
        }

        info!("Discovered {} BMAD projects", discovered_projects.len());
        Ok(discovered_projects)
    }

    pub fn create_project(&mut self, request: ProjectCreationRequest) -> Result<BMadProject, BMadError> {
        // Validate project path
        if !request.path.exists() {
            return Err(BMadError::ProjectNotFound(format!(
                "Project directory does not exist: {:?}", request.path
            )));
        }

        // Check if project already exists
        let bmad_dir = request.path.join(".bmad");
        if bmad_dir.exists() {
            return Err(BMadError::InvalidProjectState(format!(
                "BMAD project already exists at: {:?}", request.path
            )));
        }

        // Create BMAD directory structure
        FileWatcher::create_bmad_structure(&request.path)?;

        // Create project settings
        let settings = ProjectSettings {
            ide_preference: request.ide_preference,
            auto_trigger_agents: request.auto_trigger_agents,
            notification_settings: request.notification_settings,
            quality_gates: request.quality_gates,
        };

        // Load initial state
        let state = StateManager::load_project_state(&request.path)?;

        // Create project instance
        let project = BMadProject {
            id: Uuid::new_v4(),
            name: request.name,
            path: request.path,
            state,
            communications: Vec::new(),
            created_at: Utc::now(),
            last_modified: Utc::now(),
            settings,
        };

        // Save project metadata
        self.save_project_metadata(&project)?;

        // Add to managed projects
        self.projects.insert(project.id, project.clone());

        // Start watching if file watcher is available
        if let Some(ref mut watcher) = self.file_watcher {
            if let Err(e) = watcher.watch_project(&project) {
                warn!("Failed to start watching project {}: {}", project.name, e);
            }
        }

        info!("Created new BMAD project: {} at {:?}", project.name, project.path);
        Ok(project)
    }

    pub fn load_project(&mut self, project_id: Uuid) -> Result<&BMadProject, BMadError> {
        if !self.projects.contains_key(&project_id) {
            return Err(BMadError::ProjectNotFound(format!(
                "Project not found: {}", project_id
            )));
        }

        // Reload project state from disk
        let project = self.projects.get(&project_id).unwrap();
        let updated_state = StateManager::load_project_state(&project.path)?;
        
        // Update project in memory
        let mut updated_project = project.clone();
        updated_project.state = updated_state;
        updated_project.last_modified = Utc::now();
        
        // Reload communications
        let comm_manager = CommunicationManager::new(&project.path);
        updated_project.communications = comm_manager.load_all_messages()?;

        self.projects.insert(project_id, updated_project);
        
        Ok(self.projects.get(&project_id).unwrap())
    }

    pub fn set_active_project(&mut self, project_id: Uuid) -> Result<(), BMadError> {
        if !self.projects.contains_key(&project_id) {
            return Err(BMadError::ProjectNotFound(format!(
                "Project not found: {}", project_id
            )));
        }

        self.active_project = Some(project_id);
        info!("Set active project to: {}", project_id);
        Ok(())
    }

    pub fn get_active_project(&self) -> Option<&BMadProject> {
        self.active_project.and_then(|id| self.projects.get(&id))
    }

    pub fn get_project(&self, project_id: Uuid) -> Option<&BMadProject> {
        self.projects.get(&project_id)
    }

    pub fn list_projects(&self) -> Vec<&BMadProject> {
        self.projects.values().collect()
    }

    pub fn delete_project(&mut self, project_id: Uuid, delete_files: bool) -> Result<(), BMadError> {
        let project = self.projects.get(&project_id)
            .ok_or_else(|| BMadError::ProjectNotFound(format!("Project not found: {}", project_id)))?;

        // Stop watching the project
        if let Some(ref mut watcher) = self.file_watcher {
            if let Err(e) = watcher.unwatch_project(project_id) {
                warn!("Failed to stop watching project: {}", e);
            }
        }

        if delete_files {
            // Delete .bmad directory
            let bmad_dir = project.path.join(".bmad");
            if bmad_dir.exists() {
                std::fs::remove_dir_all(&bmad_dir)?;
                info!("Deleted BMAD directory: {:?}", bmad_dir);
            }
        }

        // Remove from active project if it was active
        if self.active_project == Some(project_id) {
            self.active_project = None;
        }

        // Remove from projects map
        self.projects.remove(&project_id);

        info!("Deleted project: {}", project_id);
        Ok(())
    }

    pub fn update_project_settings(&mut self, project_id: Uuid, settings: ProjectSettings) -> Result<(), BMadError> {
        let project = self.projects.get_mut(&project_id)
            .ok_or_else(|| BMadError::ProjectNotFound(format!("Project not found: {}", project_id)))?;

        project.settings = settings;
        project.last_modified = Utc::now();

        // Save updated metadata
        self.save_project_metadata(project)?;

        info!("Updated settings for project: {}", project_id);
        Ok(())
    }

    pub fn refresh_project(&mut self, project_id: Uuid) -> Result<(), BMadError> {
        self.load_project(project_id)?;
        info!("Refreshed project: {}", project_id);
        Ok(())
    }

    pub fn get_project_summary(&self, project_id: Uuid) -> Result<String, BMadError> {
        let project = self.projects.get(&project_id)
            .ok_or_else(|| BMadError::ProjectNotFound(format!("Project not found: {}", project_id)))?;

        let workflow_manager = WorkflowManager::new(&project.path);
        let summary = workflow_manager.get_workflow_summary()?;

        Ok(format!(
            "# Project: {}\n\n**Path:** {:?}\n**Created:** {}\n**Last Modified:** {}\n\n{}",
            project.name,
            project.path,
            project.created_at.format("%Y-%m-%d %H:%M UTC"),
            project.last_modified.format("%Y-%m-%d %H:%M UTC"),
            summary
        ))
    }

    pub fn validate_project<P: AsRef<Path>>(project_path: P) -> Result<bool, BMadError> {
        let path = project_path.as_ref();
        
        // Check if .bmad directory exists
        if !FileWatcher::validate_bmad_project(path) {
            return Ok(false);
        }

        // Validate state file format
        let state_file = path.join(".bmad").join("state.yaml");
        StateManager::validate_state_file(state_file)
    }

    pub fn get_project_statistics(&self) -> HashMap<String, serde_json::Value> {
        let mut stats = HashMap::new();
        
        stats.insert("total_projects".to_string(), serde_json::Value::Number(self.projects.len().into()));
        stats.insert("active_project".to_string(), 
            serde_json::Value::String(
                self.active_project.map(|id| id.to_string()).unwrap_or("None".to_string())
            )
        );

        // Count projects by phase
        let mut phase_counts: HashMap<String, u32> = HashMap::new();
        for project in self.projects.values() {
            let phase = format!("{:?}", project.state.current_phase);
            *phase_counts.entry(phase).or_insert(0) += 1;
        }

        for (phase, count) in phase_counts {
            stats.insert(format!("projects_in_{}", phase.to_lowercase()), 
                serde_json::Value::Number(count.into()));
        }

        stats
    }

    fn load_project_from_path<P: AsRef<Path>>(&self, path: P) -> Result<BMadProject, BMadError> {
        let project_path = path.as_ref();
        
        // Load project state
        let state = StateManager::load_project_state(project_path)?;
        
        // Load communications
        let comm_manager = CommunicationManager::new(project_path);
        let communications = comm_manager.load_all_messages()?;

        // Load or create project metadata
        let metadata_file = project_path.join(".bmad").join("project.yaml");
        let (id, name, created_at, settings) = if metadata_file.exists() {
            self.load_project_metadata(&metadata_file)?
        } else {
            // Create default metadata
            let id = Uuid::new_v4();
            let name = project_path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("Unknown Project")
                .to_string();
            let created_at = Utc::now();
            let settings = ProjectSettings {
                ide_preference: None,
                auto_trigger_agents: true,
                notification_settings: NotificationSettings {
                    desktop_notifications: true,
                    agent_handoffs: true,
                    story_completions: true,
                    blockers: true,
                },
                quality_gates: QualityGates {
                    require_tests: true,
                    require_documentation: true,
                    require_architecture_approval: true,
                    require_security_review: false,
                },
            };
            (id, name, created_at, settings)
        };

        let project = BMadProject {
            id,
            name,
            path: project_path.to_path_buf(),
            state,
            communications,
            created_at,
            last_modified: Utc::now(),
            settings,
        };

        // Save metadata if it didn't exist
        if !metadata_file.exists() {
            self.save_project_metadata(&project)?;
        }

        Ok(project)
    }

    fn save_project_metadata(&self, project: &BMadProject) -> Result<(), BMadError> {
        let metadata_file = project.path.join(".bmad").join("project.yaml");
        
        let metadata = serde_yaml::to_string(&serde_yaml::Value::Mapping({
            let mut map = serde_yaml::Mapping::new();
            map.insert(serde_yaml::Value::String("id".to_string()), 
                serde_yaml::Value::String(project.id.to_string()));
            map.insert(serde_yaml::Value::String("name".to_string()), 
                serde_yaml::Value::String(project.name.clone()));
            map.insert(serde_yaml::Value::String("created_at".to_string()), 
                serde_yaml::Value::String(project.created_at.to_rfc3339()));
            map.insert(serde_yaml::Value::String("settings".to_string()), 
                serde_yaml::to_value(&project.settings).unwrap());
            map
        }))?;

        std::fs::write(metadata_file, metadata)?;
        Ok(())
    }

    fn load_project_metadata(&self, metadata_file: &Path) -> Result<(Uuid, String, DateTime<Utc>, ProjectSettings), BMadError> {
        let content = std::fs::read_to_string(metadata_file)?;
        let metadata: serde_yaml::Value = serde_yaml::from_str(&content)?;

        let id = metadata.get("id")
            .and_then(|v| v.as_str())
            .and_then(|s| Uuid::parse_str(s).ok())
            .unwrap_or_else(Uuid::new_v4);

        let name = metadata.get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown Project")
            .to_string();

        let created_at = metadata.get("created_at")
            .and_then(|v| v.as_str())
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(Utc::now);

        let settings = metadata.get("settings")
            .and_then(|v| serde_yaml::from_value(v.clone()).ok())
            .unwrap_or_else(|| ProjectSettings {
                ide_preference: None,
                auto_trigger_agents: true,
                notification_settings: NotificationSettings {
                    desktop_notifications: true,
                    agent_handoffs: true,
                    story_completions: true,
                    blockers: true,
                },
                quality_gates: QualityGates {
                    require_tests: true,
                    require_documentation: true,
                    require_architecture_approval: true,
                    require_security_review: false,
                },
            });

        Ok((id, name, created_at, settings))
    }

    pub fn export_project(&self, project_id: Uuid) -> Result<String, BMadError> {
        let project = self.projects.get(&project_id)
            .ok_or_else(|| BMadError::ProjectNotFound(format!("Project not found: {}", project_id)))?;

        let export_data = serde_json::to_string_pretty(project)?;
        info!("Exported project: {}", project_id);
        Ok(export_data)
    }

    pub fn get_file_watcher_events(&mut self) -> Option<tokio::sync::broadcast::Receiver<(PathBuf, notify::EventKind)>> {
        self.file_watcher.as_ref().map(|watcher| watcher.subscribe_to_events())
    }
}