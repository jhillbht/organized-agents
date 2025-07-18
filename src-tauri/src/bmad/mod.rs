// BMAD (Breakthrough Method for Agile AI-Driven Development) integration module

pub mod file_watcher;
pub mod state_manager;
pub mod communication;
pub mod workflow;
pub mod project;
pub mod types;

pub use file_watcher::FileWatcher;
pub use state_manager::StateManager;
pub use communication::CommunicationManager;
pub use workflow::WorkflowManager;
pub use project::ProjectManager;
pub use types::*;