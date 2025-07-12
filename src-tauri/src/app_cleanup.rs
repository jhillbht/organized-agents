use std::sync::Arc;
use tauri::{AppHandle, Manager, Runtime};
use crate::commands::router::RouterManager;
use crate::process::registry::ProcessRegistryState;

/// Cleanup handler for graceful app shutdown
pub async fn cleanup_on_exit<R: Runtime>(app: &AppHandle<R>) {
    log::info!("Starting app cleanup...");
    
    // Stop router if running
    if let Some(router_state) = app.try_state::<Arc<RouterManager>>() {
        log::info!("Stopping router service...");
        if let Err(e) = router_state.stop().await {
            log::error!("Failed to stop router: {}", e);
        }
    }
    
    // Kill all running agent processes
    if let Some(registry_state) = app.try_state::<ProcessRegistryState>() {
        log::info!("Terminating running processes...");
        let registry = registry_state.registry.lock().await;
        registry.terminate_all().await;
    }
    
    // Clear any temporary files
    if let Ok(temp_dir) = std::env::temp_dir().read_dir() {
        for entry in temp_dir.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name.starts_with("organized-ai-") || name.starts_with("claude-") {
                    if let Err(e) = std::fs::remove_file(entry.path()) {
                        log::debug!("Failed to remove temp file: {}", e);
                    }
                }
            }
        }
    }
    
    log::info!("App cleanup completed");
}

/// Initialize app resources on startup
pub async fn initialize_app_resources<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    log::info!("Initializing app resources...");
    
    // Ensure required directories exist
    let home = dirs::home_dir().ok_or("Failed to get home directory")?;
    let organized_ai_dir = home.join(".organized-ai");
    
    if !organized_ai_dir.exists() {
        std::fs::create_dir_all(&organized_ai_dir)
            .map_err(|e| format!("Failed to create .organized-ai directory: {}", e))?;
    }
    
    // Check and fix Claude binary path for standalone app
    if cfg!(not(debug_assertions)) {
        log::info!("Running in production mode, checking Claude binary path...");
        
        // Try to find Claude installation
        if let Ok(output) = std::process::Command::new("which")
            .arg("claude")
            .output()
        {
            if output.status.success() {
                let claude_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                log::info!("Found Claude at: {}", claude_path);
                
                // Store the path for future use
                if let Err(e) = crate::commands::agents::set_claude_binary_path(claude_path).await {
                    log::error!("Failed to store Claude binary path: {}", e);
                }
            }
        }
    }
    
    log::info!("App resources initialized");
    Ok(())
}