use crate::bmad::{StateManager, types::*};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager;
use tracing::{debug, error, info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDEInfo {
    pub name: String,
    pub display_name: String,
    pub executable_path: String,
    pub is_available: bool,
    pub supports_context: bool,
    pub launch_args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDEPreferences {
    pub default_ide: Option<String>,
    pub agent_preferences: std::collections::HashMap<String, String>,
    pub project_specific: std::collections::HashMap<String, String>,
}

/// Detect installed IDEs on the system
#[tauri::command]
pub async fn detect_installed_ides() -> Result<Vec<IDEInfo>, String> {
    let mut ides = Vec::new();
    
    // Check for common IDEs based on platform
    #[cfg(target_os = "macos")]
    {
        ides.extend(detect_macos_ides().await);
    }
    
    #[cfg(target_os = "windows")]
    {
        ides.extend(detect_windows_ides().await);
    }
    
    #[cfg(target_os = "linux")]
    {
        ides.extend(detect_linux_ides().await);
    }
    
    // Sort by availability and preference
    ides.sort_by(|a, b| {
        b.is_available.cmp(&a.is_available)
            .then_with(|| a.display_name.cmp(&b.display_name))
    });
    
    info!("Detected {} IDEs on system", ides.len());
    Ok(ides)
}

/// Launch IDE with BMAD context
#[tauri::command]
pub async fn launch_ide_with_context(
    project_id: String,
    ide_name: String,
    story_context: Option<String>,
) -> Result<(), String> {
    let project_path = get_project_path(&project_id).await?;
    let ide_info = get_ide_info(&ide_name).await?;
    
    if !ide_info.is_available {
        return Err(format!("IDE '{}' is not available", ide_name));
    }
    
    // Load project state for context
    let state = StateManager::load_project_state(&project_path)
        .map_err(|e| format!("Failed to load project state: {}", e))?;
    
    // Prepare context files
    let context_files = prepare_context_files(&project_path, &state, story_context.as_deref()).await?;
    
    // Launch IDE with context
    launch_ide(&ide_info, &project_path, &context_files).await?;
    
    info!("Launched {} for project {} with context", ide_name, project_id);
    Ok(())
}

/// Get IDE preferences for a project
#[tauri::command]
pub async fn get_ide_preferences(project_id: String) -> Result<IDEPreferences, String> {
    let project_path = get_project_path(&project_id).await?;
    let prefs_path = project_path.join(".bmad").join("ide_preferences.yaml");
    
    if prefs_path.exists() {
        let content = std::fs::read_to_string(&prefs_path)
            .map_err(|e| format!("Failed to read IDE preferences: {}", e))?;
        
        let preferences: IDEPreferences = serde_yaml::from_str(&content)
            .map_err(|e| format!("Failed to parse IDE preferences: {}", e))?;
        
        Ok(preferences)
    } else {
        // Return default preferences
        Ok(IDEPreferences {
            default_ide: None,
            agent_preferences: std::collections::HashMap::new(),
            project_specific: std::collections::HashMap::new(),
        })
    }
}

/// Save IDE preferences for a project
#[tauri::command]
pub async fn save_ide_preferences(
    project_id: String,
    preferences: IDEPreferences,
) -> Result<(), String> {
    let project_path = get_project_path(&project_id).await?;
    let bmad_dir = project_path.join(".bmad");
    let prefs_path = bmad_dir.join("ide_preferences.yaml");
    
    // Ensure .bmad directory exists
    std::fs::create_dir_all(&bmad_dir)
        .map_err(|e| format!("Failed to create .bmad directory: {}", e))?;
    
    let content = serde_yaml::to_string(&preferences)
        .map_err(|e| format!("Failed to serialize IDE preferences: {}", e))?;
    
    std::fs::write(&prefs_path, content)
        .map_err(|e| format!("Failed to save IDE preferences: {}", e))?;
    
    Ok(())
}

/// Set default IDE for a project
#[tauri::command]
pub async fn set_default_ide(project_id: String, ide_name: String) -> Result<(), String> {
    let mut preferences = get_ide_preferences(project_id.clone()).await?;
    preferences.default_ide = Some(ide_name.clone());
    save_ide_preferences(project_id, preferences).await?;
    
    info!("Set default IDE to {} for project", ide_name);
    Ok(())
}

/// Get recommended IDE for an agent type
#[tauri::command]
pub async fn get_agent_ide_recommendation(
    project_id: String,
    agent_type: String,
) -> Result<Option<String>, String> {
    let preferences = get_ide_preferences(project_id).await?;
    
    // Check agent-specific preference first
    if let Some(ide) = preferences.agent_preferences.get(&agent_type) {
        return Ok(Some(ide.clone()));
    }
    
    // Fall back to default
    if let Some(default_ide) = preferences.default_ide {
        return Ok(Some(default_ide));
    }
    
    // Recommend based on agent type
    let recommendation = match agent_type.as_str() {
        "Developer" => Some("Cursor".to_string()), // AI-powered development
        "Architect" => Some("VSCode".to_string()), // Good for documentation
        "UXExpert" => Some("VSCode".to_string()), // Extensions for design
        "QualityAssurance" => Some("VSCode".to_string()), // Testing extensions
        _ => None,
    };
    
    Ok(recommendation)
}

// Platform-specific IDE detection

#[cfg(target_os = "macos")]
async fn detect_macos_ides() -> Vec<IDEInfo> {
    let mut ides = Vec::new();
    
    // Cursor
    if Path::new("/Applications/Cursor.app").exists() {
        ides.push(IDEInfo {
            name: "cursor".to_string(),
            display_name: "Cursor".to_string(),
            executable_path: "/Applications/Cursor.app/Contents/MacOS/Cursor".to_string(),
            is_available: true,
            supports_context: true,
            launch_args: vec!["--new-window".to_string()],
        });
    }
    
    // VSCode
    if Path::new("/Applications/Visual Studio Code.app").exists() {
        ides.push(IDEInfo {
            name: "vscode".to_string(),
            display_name: "Visual Studio Code".to_string(),
            executable_path: "/Applications/Visual Studio Code.app/Contents/MacOS/Electron".to_string(),
            is_available: true,
            supports_context: true,
            launch_args: vec!["--new-window".to_string()],
        });
    }
    
    // Claude Code (if available via PATH)
    if check_command_available("claude").await {
        ides.push(IDEInfo {
            name: "claude_code".to_string(),
            display_name: "Claude Code".to_string(),
            executable_path: "claude".to_string(),
            is_available: true,
            supports_context: true,
            launch_args: vec!["--interactive".to_string()],
        });
    }
    
    // Zed
    if Path::new("/Applications/Zed.app").exists() {
        ides.push(IDEInfo {
            name: "zed".to_string(),
            display_name: "Zed".to_string(),
            executable_path: "/Applications/Zed.app/Contents/MacOS/zed".to_string(),
            is_available: true,
            supports_context: false,
            launch_args: vec![],
        });
    }
    
    // Xcode
    if Path::new("/Applications/Xcode.app").exists() {
        ides.push(IDEInfo {
            name: "xcode".to_string(),
            display_name: "Xcode".to_string(),
            executable_path: "/Applications/Xcode.app/Contents/MacOS/Xcode".to_string(),
            is_available: true,
            supports_context: false,
            launch_args: vec![],
        });
    }
    
    ides
}

#[cfg(target_os = "windows")]
async fn detect_windows_ides() -> Vec<IDEInfo> {
    let mut ides = Vec::new();
    
    // VSCode
    let vscode_paths = vec![
        r"C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\Code.exe",
        r"C:\Program Files\Microsoft VS Code\Code.exe",
        r"C:\Program Files (x86)\Microsoft VS Code\Code.exe",
    ];
    
    for path in vscode_paths {
        let expanded_path = expand_env_vars(path);
        if Path::new(&expanded_path).exists() {
            ides.push(IDEInfo {
                name: "vscode".to_string(),
                display_name: "Visual Studio Code".to_string(),
                executable_path: expanded_path,
                is_available: true,
                supports_context: true,
                launch_args: vec!["--new-window".to_string()],
            });
            break;
        }
    }
    
    // Cursor
    let cursor_paths = vec![
        r"C:\Users\%USERNAME%\AppData\Local\Programs\Cursor\Cursor.exe",
        r"C:\Program Files\Cursor\Cursor.exe",
    ];
    
    for path in cursor_paths {
        let expanded_path = expand_env_vars(path);
        if Path::new(&expanded_path).exists() {
            ides.push(IDEInfo {
                name: "cursor".to_string(),
                display_name: "Cursor".to_string(),
                executable_path: expanded_path,
                is_available: true,
                supports_context: true,
                launch_args: vec!["--new-window".to_string()],
            });
            break;
        }
    }
    
    // Claude Code
    if check_command_available("claude").await {
        ides.push(IDEInfo {
            name: "claude_code".to_string(),
            display_name: "Claude Code".to_string(),
            executable_path: "claude".to_string(),
            is_available: true,
            supports_context: true,
            launch_args: vec!["--interactive".to_string()],
        });
    }
    
    ides
}

#[cfg(target_os = "linux")]
async fn detect_linux_ides() -> Vec<IDEInfo> {
    let mut ides = Vec::new();
    
    // Check common command-line tools first
    let commands = vec![
        ("code", "Visual Studio Code", "vscode"),
        ("cursor", "Cursor", "cursor"),
        ("claude", "Claude Code", "claude_code"),
        ("zed", "Zed", "zed"),
        ("vim", "Vim", "vim"),
        ("nvim", "Neovim", "neovim"),
        ("emacs", "Emacs", "emacs"),
    ];
    
    for (cmd, display, name) in commands {
        if check_command_available(cmd).await {
            let supports_context = matches!(name, "vscode" | "cursor" | "claude_code");
            let launch_args = if name == "claude_code" {
                vec!["--interactive".to_string()]
            } else if supports_context {
                vec!["--new-window".to_string()]
            } else {
                vec![]
            };
            
            ides.push(IDEInfo {
                name: name.to_string(),
                display_name: display.to_string(),
                executable_path: cmd.to_string(),
                is_available: true,
                supports_context,
                launch_args,
            });
        }
    }
    
    ides
}

// Helper functions

async fn get_project_path(project_id: &str) -> Result<PathBuf, String> {
    // This should integrate with the existing project management system
    // For now, implement a simple lookup
    StateManager::get_project_path_by_id(project_id)
        .ok_or_else(|| format!("Project not found: {}", project_id))
}

async fn get_ide_info(ide_name: &str) -> Result<IDEInfo, String> {
    let ides = detect_installed_ides().await?;
    ides.into_iter()
        .find(|ide| ide.name == ide_name)
        .ok_or_else(|| format!("IDE not found: {}", ide_name))
}

async fn prepare_context_files(
    project_path: &Path,
    state: &ProjectState,
    story_context: Option<&str>,
) -> Result<Vec<PathBuf>, String> {
    let mut context_files = Vec::new();
    
    // Always include key project files
    let key_files = vec![
        "README.md",
        "docs/prd.md",
        "docs/architecture.md",
        ".bmad/project_state.yaml",
    ];
    
    for file in key_files {
        let file_path = project_path.join(file);
        if file_path.exists() {
            context_files.push(file_path);
        }
    }
    
    // Add story-specific files if story context provided
    if let Some(story) = story_context {
        let story_slug = story.to_lowercase().replace(' ', "_");
        let story_files = vec![
            format!("docs/stories/{}.md", story_slug),
            format!("src/{}", story_slug),
            format!("tests/{}", story_slug),
        ];
        
        for file in story_files {
            let file_path = project_path.join(&file);
            if file_path.exists() {
                context_files.push(file_path);
            }
        }
    }
    
    // Add active story files if available
    if let Some(active_story) = &state.active_story {
        let story_slug = active_story.to_lowercase().replace(' ', "_");
        let file_path = project_path.join(format!("docs/stories/{}.md", story_slug));
        if file_path.exists() && !context_files.contains(&file_path) {
            context_files.push(file_path);
        }
    }
    
    Ok(context_files)
}

async fn launch_ide(
    ide_info: &IDEInfo,
    project_path: &Path,
    context_files: &[PathBuf],
) -> Result<(), String> {
    match ide_info.name.as_str() {
        "claude_code" => launch_claude_code(project_path, context_files).await,
        "cursor" | "vscode" => launch_vscode_like(ide_info, project_path, context_files).await,
        _ => launch_generic_ide(ide_info, project_path).await,
    }
}

async fn launch_claude_code(
    project_path: &Path,
    _context_files: &[PathBuf],
) -> Result<(), String> {
    let mut cmd = Command::new("claude");
    cmd.arg("--interactive");
    cmd.current_dir(project_path);
    
    // Set environment variables for context
    cmd.env("CLAUDE_PROJECT_PATH", project_path);
    cmd.env("CLAUDE_MODE", "bmad_integration");
    
    cmd.spawn()
        .map_err(|e| format!("Failed to launch Claude Code: {}", e))?;
    
    Ok(())
}

async fn launch_vscode_like(
    ide_info: &IDEInfo,
    project_path: &Path,
    context_files: &[PathBuf],
) -> Result<(), String> {
    let mut cmd = Command::new(&ide_info.executable_path);
    
    // Add launch arguments
    for arg in &ide_info.launch_args {
        cmd.arg(arg);
    }
    
    // Open project directory
    cmd.arg(project_path);
    
    // Open context files
    for file in context_files.iter().take(5) { // Limit to avoid overwhelming
        cmd.arg(file);
    }
    
    cmd.spawn()
        .map_err(|e| format!("Failed to launch {}: {}", ide_info.display_name, e))?;
    
    Ok(())
}

async fn launch_generic_ide(
    ide_info: &IDEInfo,
    project_path: &Path,
) -> Result<(), String> {
    let mut cmd = Command::new(&ide_info.executable_path);
    
    for arg in &ide_info.launch_args {
        cmd.arg(arg);
    }
    
    cmd.arg(project_path);
    cmd.spawn()
        .map_err(|e| format!("Failed to launch {}: {}", ide_info.display_name, e))?;
    
    Ok(())
}

async fn check_command_available(command: &str) -> bool {
    Command::new("which")
        .arg(command)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false) ||
    Command::new("where")
        .arg(command)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

#[cfg(target_os = "windows")]
fn expand_env_vars(path: &str) -> String {
    // Simple environment variable expansion for Windows
    path.replace("%USERNAME%", &std::env::var("USERNAME").unwrap_or_default())
}