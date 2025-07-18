use crate::bmad::types::{BMadError, BMadProject};
use walkdir::WalkDir;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

pub type FileChangeEvent = (PathBuf, EventKind);

#[derive(Debug)]
pub struct FileWatcher {
    _watcher: RecommendedWatcher,
    watched_projects: Arc<Mutex<HashMap<Uuid, PathBuf>>>,
    event_sender: broadcast::Sender<FileChangeEvent>,
    _event_receiver: Receiver<notify::Result<Event>>,
}

impl FileWatcher {
    pub fn new() -> Result<Self, BMadError> {
        let (tx, rx) = channel();
        let (event_sender, _) = broadcast::channel(100);
        
        let watcher = RecommendedWatcher::new(
            move |res: notify::Result<Event>| {
                if let Err(e) = tx.send(res) {
                    error!("Failed to send file event: {}", e);
                }
            },
            Config::default().with_poll_interval(Duration::from_millis(500)),
        ).map_err(|e| BMadError::FileSystem(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to create file watcher: {}", e)
        )))?;

        let watched_projects = Arc::new(Mutex::new(HashMap::new()));
        let watched_projects_clone = watched_projects.clone();
        let event_sender_clone = event_sender.clone();

        // Spawn background thread to handle file events
        thread::spawn(move || {
            Self::handle_file_events(rx, watched_projects_clone, event_sender_clone);
        });

        Ok(FileWatcher {
            _watcher: watcher,
            watched_projects,
            event_sender,
            _event_receiver: rx,
        })
    }

    pub fn watch_project(&mut self, project: &BMadProject) -> Result<(), BMadError> {
        let bmad_dir = project.path.join(".bmad");
        
        if !bmad_dir.exists() {
            warn!("BMAD directory does not exist: {:?}", bmad_dir);
            return Err(BMadError::ProjectNotFound(format!(
                "BMAD directory not found: {:?}", bmad_dir
            )));
        }

        info!("Starting to watch BMAD directory: {:?}", bmad_dir);
        
        self._watcher.watch(&bmad_dir, RecursiveMode::Recursive)
            .map_err(|e| BMadError::FileSystem(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to watch directory {:?}: {}", bmad_dir, e)
            )))?;

        // Store the watched project
        if let Ok(mut projects) = self.watched_projects.lock() {
            projects.insert(project.id, bmad_dir);
        }

        info!("Successfully watching project: {} ({})", project.name, project.id);
        Ok(())
    }

    pub fn unwatch_project(&mut self, project_id: Uuid) -> Result<(), BMadError> {
        if let Ok(mut projects) = self.watched_projects.lock() {
            if let Some(path) = projects.remove(&project_id) {
                self._watcher.unwatch(&path)
                    .map_err(|e| BMadError::FileSystem(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Failed to unwatch directory {:?}: {}", path, e)
                    )))?;
                info!("Stopped watching project: {}", project_id);
            }
        }
        Ok(())
    }

    pub fn subscribe_to_events(&self) -> broadcast::Receiver<FileChangeEvent> {
        self.event_sender.subscribe()
    }

    fn handle_file_events(
        receiver: Receiver<notify::Result<Event>>,
        watched_projects: Arc<Mutex<HashMap<Uuid, PathBuf>>>,
        event_sender: broadcast::Sender<FileChangeEvent>,
    ) {
        for event_result in receiver {
            match event_result {
                Ok(event) => {
                    Self::process_event(event, &watched_projects, &event_sender);
                }
                Err(e) => {
                    error!("File watcher error: {}", e);
                }
            }
        }
    }

    fn process_event(
        event: Event,
        watched_projects: &Arc<Mutex<HashMap<Uuid, PathBuf>>>,
        event_sender: &broadcast::Sender<FileChangeEvent>,
    ) {
        // Filter for BMAD-relevant files
        for path in &event.paths {
            if Self::is_bmad_relevant_file(path) {
                debug!("BMAD file event: {:?} - {:?}", event.kind, path);
                
                // Send the event to subscribers
                if let Err(e) = event_sender.send((path.clone(), event.kind)) {
                    debug!("No active subscribers for file event: {}", e);
                }
            }
        }
    }

    fn is_bmad_relevant_file(path: &Path) -> bool {
        // Check if the file is in a .bmad directory and is relevant
        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
            // Watch for state files, communication files, and session files
            if file_name == "state.yaml" 
                || file_name == "session.yaml" 
                || path.to_string_lossy().contains(".bmad/communications/")
                || path.to_string_lossy().contains(".bmad/context/")
                || path.to_string_lossy().contains(".bmad/logs/") {
                return true;
            }
        }
        false
    }

    pub fn discover_bmad_projects<P: AsRef<Path>>(root_dir: P) -> Result<Vec<PathBuf>, BMadError> {
        let mut projects = Vec::new();
        let root = root_dir.as_ref();

        if !root.exists() {
            return Err(BMadError::FileSystem(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Root directory does not exist: {:?}", root)
            )));
        }

        // Walk the directory tree looking for .bmad directories
        for entry in WalkDir::new(root)
            .max_depth(5) // Limit depth to avoid deep scanning
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            
            // Check if this is a .bmad directory
            if path.is_dir() && path.file_name() == Some(std::ffi::OsStr::new(".bmad")) {
                // Verify it has a state.yaml file
                let state_file = path.join("state.yaml");
                if state_file.exists() {
                    // Add the parent directory (the project root)
                    if let Some(project_root) = path.parent() {
                        projects.push(project_root.to_path_buf());
                        info!("Discovered BMAD project: {:?}", project_root);
                    }
                }
            }
        }

        Ok(projects)
    }

    pub fn validate_bmad_project<P: AsRef<Path>>(project_path: P) -> bool {
        let project_root = project_path.as_ref();
        let bmad_dir = project_root.join(".bmad");
        
        // Check required files exist
        bmad_dir.exists()
            && bmad_dir.join("state.yaml").exists()
            && bmad_dir.join("communications").is_dir()
    }

    pub fn create_bmad_structure<P: AsRef<Path>>(project_path: P) -> Result<(), BMadError> {
        let project_root = project_path.as_ref();
        let bmad_dir = project_root.join(".bmad");

        // Create .bmad directory structure
        std::fs::create_dir_all(&bmad_dir)?;
        std::fs::create_dir_all(bmad_dir.join("communications"))?;
        std::fs::create_dir_all(bmad_dir.join("context"))?;
        std::fs::create_dir_all(bmad_dir.join("logs"))?;

        // Create initial state.yaml if it doesn't exist
        let state_file = bmad_dir.join("state.yaml");
        if !state_file.exists() {
            let initial_state = r#"bmad_version: "1.0.0"
project_state: "initializing"
current_phase: "planning"
active_story: null

phases:
  planning:
    status: "not_started"
    artifacts: []
  
  story_creation:
    status: "not_started"
    stories_created: 0
    stories_ready: 0
  
  story_execution:
    status: "not_started"
    current_story: null
    assigned_agent: null

next_actions: []

agents:
  analyst:
    status: "idle"
    current_task: null
    last_activity: null
  architect:
    status: "idle"
    current_task: null
    last_activity: null
  product_manager:
    status: "idle"
    current_task: null
    last_activity: null
  product_owner:
    status: "idle"
    current_task: null
    last_activity: null
  scrum_master:
    status: "idle"
    current_task: null
    last_activity: null
  developer:
    status: "idle"
    current_task: null
    last_activity: null
  quality_assurance:
    status: "idle"
    current_task: null
    last_activity: null
  ux_expert:
    status: "idle"
    current_task: null
    last_activity: null
"#;
            std::fs::write(state_file, initial_state)?;
        }

        // Create session.yaml if it doesn't exist
        let session_file = bmad_dir.join("session.yaml");
        if !session_file.exists() {
            let initial_session = r#"session_id: null
started_at: null
last_activity: null
active_agents: []
session_notes: ""
"#;
            std::fs::write(session_file, initial_session)?;
        }

        info!("Created BMAD structure at: {:?}", bmad_dir);
        Ok(())
    }
}