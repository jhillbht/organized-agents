use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthStatus {
    pub mode: String,
    pub is_authenticated: bool,
    pub username: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    pub message: String,
    pub login_url: Option<String>,
}

/// Check current authentication status
#[tauri::command]
pub async fn check_auth_status() -> Result<AuthStatus, String> {
    // Check AUTH_MODE from environment
    let auth_mode = std::env::var("AUTH_MODE").unwrap_or_else(|_| "api-key".to_string());
    
    if auth_mode == "claude-max" {
        // Check if Claude Code CLI is logged in
        match Command::new("claude").arg("whoami").output() {
            Ok(output) if output.status.success() => {
                let username = String::from_utf8_lossy(&output.stdout)
                    .trim()
                    .to_string();
                
                Ok(AuthStatus {
                    mode: "claude-max".to_string(),
                    is_authenticated: true,
                    username: Some(username),
                    error: None,
                })
            }
            Ok(_) => {
                Ok(AuthStatus {
                    mode: "claude-max".to_string(),
                    is_authenticated: false,
                    username: None,
                    error: Some("Not logged in to Claude Max".to_string()),
                })
            }
            Err(e) => {
                Ok(AuthStatus {
                    mode: "claude-max".to_string(),
                    is_authenticated: false,
                    username: None,
                    error: Some(format!("Claude Code CLI not found: {}", e)),
                })
            }
        }
    } else {
        // Check if API key is set
        let has_api_key = std::env::var("ANTHROPIC_API_KEY")
            .map(|key| !key.is_empty())
            .unwrap_or(false);
        
        Ok(AuthStatus {
            mode: "api-key".to_string(),
            is_authenticated: has_api_key,
            username: None,
            error: if has_api_key { None } else { Some("API key not set".to_string()) },
        })
    }
}

/// Initiate Claude Max login
#[tauri::command]
pub async fn claude_login() -> Result<LoginResponse, String> {
    match Command::new("claude").arg("login").output() {
        Ok(output) => {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let error_str = String::from_utf8_lossy(&output.stderr);
            
            // Extract login URL from output
            let login_url = output_str
                .lines()
                .chain(error_str.lines())
                .find(|line| line.contains("https://") && line.contains("claude.ai"))
                .map(|line| {
                    // Extract URL from the line
                    line.split_whitespace()
                        .find(|word| word.starts_with("https://"))
                        .unwrap_or(line)
                        .to_string()
                });
            
            Ok(LoginResponse {
                success: output.status.success(),
                message: format!("{}\n{}", output_str, error_str).trim().to_string(),
                login_url,
            })
        }
        Err(e) => {
            Ok(LoginResponse {
                success: false,
                message: format!("Failed to run claude login: {}", e),
                login_url: None,
            })
        }
    }
}

/// Logout from Claude Max
#[tauri::command]
pub async fn claude_logout() -> Result<bool, String> {
    match Command::new("claude").arg("logout").output() {
        Ok(output) => Ok(output.status.success()),
        Err(e) => Err(format!("Failed to logout: {}", e)),
    }
}

/// Get current auth mode from environment
#[tauri::command]
pub async fn get_auth_mode() -> Result<String, String> {
    Ok(std::env::var("AUTH_MODE").unwrap_or_else(|_| "api-key".to_string()))
}