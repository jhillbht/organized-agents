use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::time::{Duration, sleep};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterConfig {
    pub enabled: bool,
    pub port: u16,
    pub default_model: String,
    pub background_model: String,
    pub think_model: String,
    pub long_context_model: String,
    pub auto_route: bool,
    pub cost_optimization: bool,
}

impl Default for RouterConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            port: 8080,
            default_model: "claude-3-5-sonnet-20241022".to_string(),
            background_model: "deepseek-coder".to_string(),
            think_model: "claude-3-5-haiku-20241022".to_string(),
            long_context_model: "gemini-1.5-pro".to_string(),
            auto_route: true,
            cost_optimization: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterStatus {
    pub running: bool,
    pub port: Option<u16>,
    pub last_health_check: Option<u64>,
    pub version: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingDecision {
    pub selected_model: String,
    pub reason: String,
    pub estimated_cost: f64,
    pub fallback_used: bool,
}

pub struct RouterManager {
    config: Arc<Mutex<RouterConfig>>,
    process: Arc<Mutex<Option<Child>>>,
    status: Arc<Mutex<RouterStatus>>,
}

impl RouterManager {
    pub fn new() -> Self {
        // Load configuration from file if it exists
        let config = Self::load_config_from_file();
        
        Self {
            config: Arc::new(Mutex::new(config)),
            process: Arc::new(Mutex::new(None)),
            status: Arc::new(Mutex::new(RouterStatus {
                running: false,
                port: None,
                last_health_check: None,
                version: None,
                error: None,
            })),
        }
    }

    pub async fn auto_start_if_enabled(&self) -> Result<(), String> {
        let config = self.get_config();
        if config.enabled {
            match self.start_router().await {
                Ok(_) => {
                    log::info!("Router auto-started successfully");
                    Ok(())
                }
                Err(e) => {
                    log::warn!("Failed to auto-start router: {}", e);
                    // Don't fail the application if router auto-start fails
                    Ok(())
                }
            }
        } else {
            Ok(())
        }
    }

    pub fn get_config(&self) -> RouterConfig {
        self.config.lock().unwrap().clone()
    }

    pub fn set_config(&self, config: RouterConfig) -> Result<(), String> {
        // Persist configuration to settings file
        if let Err(e) = self.save_config_to_file(&config) {
            return Err(format!("Failed to save router config: {}", e));
        }
        
        *self.config.lock().unwrap() = config;
        Ok(())
    }

    fn save_config_to_file(&self, config: &RouterConfig) -> Result<(), Box<dyn std::error::Error>> {
        let config_dir = dirs::config_dir()
            .ok_or("Could not find config directory")?
            .join("organized-ai");
        
        std::fs::create_dir_all(&config_dir)?;
        
        let config_file = config_dir.join("router_config.json");
        let config_json = serde_json::to_string_pretty(config)?;
        std::fs::write(config_file, config_json)?;
        
        Ok(())
    }

    fn load_config_from_file() -> RouterConfig {
        let config_dir = dirs::config_dir()
            .and_then(|dir| Some(dir.join("organized-ai").join("router_config.json")))
            .and_then(|file| std::fs::read_to_string(file).ok())
            .and_then(|content| serde_json::from_str(&content).ok());
        
        config_dir.unwrap_or_default()
    }

    pub fn get_status(&self) -> RouterStatus {
        self.status.lock().unwrap().clone()
    }

    pub async fn start_router(&self) -> Result<RouterStatus, String> {
        let config = self.get_config();
        
        if !config.enabled {
            return Err("Router is disabled in configuration".to_string());
        }

        // Check if already running
        {
            let mut process_guard = self.process.lock().unwrap();
            if let Some(ref mut child) = *process_guard {
                if let Ok(None) = child.try_wait() {
                    // Process is still running
                    let mut status = self.status.lock().unwrap();
                    status.running = true;
                    status.port = Some(config.port);
                    return Ok(status.clone());
                }
            }
        }

        // Try to start router process
        match self.spawn_router_process(&config).await {
            Ok(child) => {
                *self.process.lock().unwrap() = Some(child);
                
                // Update status
                let mut status = self.status.lock().unwrap();
                status.running = true;
                status.port = Some(config.port);
                status.error = None;
                status.last_health_check = Some(current_timestamp());
                
                Ok(status.clone())
            }
            Err(e) => {
                // Update status with error
                let mut status = self.status.lock().unwrap();
                status.running = false;
                status.error = Some(e.clone());
                
                Err(e)
            }
        }
    }

    pub async fn stop_router(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock().unwrap();
        
        if let Some(mut child) = process_guard.take() {
            match child.kill() {
                Ok(_) => {
                    // Wait for process to actually stop
                    let _ = child.wait();
                    
                    // Update status
                    let mut status = self.status.lock().unwrap();
                    status.running = false;
                    status.port = None;
                    status.error = None;
                    
                    Ok(())
                }
                Err(e) => Err(format!("Failed to stop router process: {}", e))
            }
        } else {
            Ok(()) // Already stopped
        }
    }

    pub async fn test_health(&self) -> Result<String, String> {
        let config = self.get_config();
        
        if !config.enabled {
            return Err("Router is disabled".to_string());
        }

        let port = config.port;
        let url = format!("http://localhost:{}/health", port);
        
        match reqwest::get(&url).await {
            Ok(response) => {
                if response.status().is_success() {
                    // Update last health check
                    let mut status = self.status.lock().unwrap();
                    status.last_health_check = Some(current_timestamp());
                    status.running = true;
                    status.error = None;
                    
                    Ok("Router is healthy".to_string())
                } else {
                    let error = format!("Router health check failed with status: {}", response.status());
                    
                    // Update status with error
                    let mut status = self.status.lock().unwrap();
                    status.error = Some(error.clone());
                    
                    Err(error)
                }
            }
            Err(e) => {
                let error = format!("Failed to connect to router: {}", e);
                
                // Update status
                let mut status = self.status.lock().unwrap();
                status.running = false;
                status.error = Some(error.clone());
                
                Err(error)
            }
        }
    }

    pub async fn get_routing_decision(&self, prompt: &str, context: Option<&str>) -> Result<RoutingDecision, String> {
        let config = self.get_config();
        
        if !config.enabled || !config.auto_route {
            // Return default model without routing
            return Ok(RoutingDecision {
                selected_model: config.default_model,
                reason: "Auto-routing disabled".to_string(),
                estimated_cost: 0.0,
                fallback_used: true,
            });
        }

        // Simple heuristic-based routing (would be replaced with actual router API)
        let decision = self.analyze_prompt_for_routing(prompt, context, &config);
        Ok(decision)
    }

    async fn spawn_router_process(&self, config: &RouterConfig) -> Result<Child, String> {
        // In a real implementation, this would start the claude-code-router process
        // For now, we'll simulate it with a mock process
        
        // Create router config file
        let router_config = serde_json::json!({
            "port": config.port,
            "models": {
                "default": config.default_model,
                "background": config.background_model,
                "think": config.think_model,
                "long_context": config.long_context_model
            },
            "cost_optimization": config.cost_optimization
        });

        // Write config to temporary file
        let config_path = std::env::temp_dir().join("router_config.json");
        std::fs::write(&config_path, router_config.to_string())
            .map_err(|e| format!("Failed to write router config: {}", e))?;

        // In production, this would start the actual router binary:
        // Command::new("claude-code-router")
        //     .arg("--config")
        //     .arg(&config_path)
        //     .arg("--port")
        //     .arg(&config.port.to_string())
        //     .stdout(Stdio::piped())
        //     .stderr(Stdio::piped())
        //     .spawn()
        //     .map_err(|e| format!("Failed to start router: {}", e))

        // For demo purposes, start a simple HTTP server
        let child = Command::new("python3")
            .arg("-m")
            .arg("http.server")
            .arg(&config.port.to_string())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start demo router: {}", e))?;

        Ok(child)
    }

    fn analyze_prompt_for_routing(&self, prompt: &str, _context: Option<&str>, config: &RouterConfig) -> RoutingDecision {
        let prompt_lower = prompt.to_lowercase();
        
        // Simple heuristics for model selection
        if prompt_lower.contains("debug") || prompt_lower.contains("error") || prompt_lower.contains("fix") {
            RoutingDecision {
                selected_model: config.think_model.clone(),
                reason: "Debug/error resolution task - using fast think model".to_string(),
                estimated_cost: 0.25,
                fallback_used: false,
            }
        } else if prompt_lower.contains("large") || prompt_lower.contains("codebase") || prompt.len() > 1000 {
            RoutingDecision {
                selected_model: config.long_context_model.clone(),
                reason: "Large context task - using long context model".to_string(),
                estimated_cost: 0.075,
                fallback_used: false,
            }
        } else if prompt_lower.contains("simple") || prompt_lower.contains("quick") || prompt.len() < 100 {
            RoutingDecision {
                selected_model: config.background_model.clone(),
                reason: "Simple task - using cost-optimized background model".to_string(),
                estimated_cost: 0.14,
                fallback_used: false,
            }
        } else {
            RoutingDecision {
                selected_model: config.default_model.clone(),
                reason: "Complex task - using default high-quality model".to_string(),
                estimated_cost: 3.0,
                fallback_used: false,
            }
        }
    }
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

// Tauri commands for router management

#[tauri::command]
pub async fn get_router_config(router_manager: State<'_, Arc<RouterManager>>) -> Result<RouterConfig, String> {
    Ok(router_manager.get_config())
}

#[tauri::command]
pub async fn set_router_config(
    config: RouterConfig,
    router_manager: State<'_, Arc<RouterManager>>
) -> Result<(), String> {
    router_manager.set_config(config)
}

#[tauri::command]
pub async fn start_router(router_manager: State<'_, Arc<RouterManager>>) -> Result<RouterStatus, String> {
    router_manager.start_router().await
}

#[tauri::command]
pub async fn stop_router(router_manager: State<'_, Arc<RouterManager>>) -> Result<(), String> {
    router_manager.stop_router().await
}

#[tauri::command]
pub async fn get_router_status(router_manager: State<'_, Arc<RouterManager>>) -> Result<RouterStatus, String> {
    Ok(router_manager.get_status())
}

#[tauri::command]
pub async fn test_router_health(router_manager: State<'_, Arc<RouterManager>>) -> Result<String, String> {
    router_manager.test_health().await
}

#[tauri::command]
pub async fn get_routing_decision(
    prompt: String,
    context: Option<String>,
    router_manager: State<'_, Arc<RouterManager>>
) -> Result<RoutingDecision, String> {
    router_manager.get_routing_decision(&prompt, context.as_deref()).await
}

#[tauri::command]
pub async fn execute_with_router(
    prompt: String,
    model: Option<String>,
    project_path: Option<String>,
    router_manager: State<'_, Arc<RouterManager>>
) -> Result<String, String> {
    let config = router_manager.get_config();
    
    if !config.enabled {
        return Err("Router is disabled".to_string());
    }

    // Get routing decision
    let decision = router_manager.get_routing_decision(&prompt, project_path.as_deref()).await?;
    
    // Use specified model or routed model
    let selected_model = model.unwrap_or(decision.selected_model);
    
    // In a real implementation, this would route to the appropriate model API
    // For now, return a mock response
    Ok(format!(
        "Executed with model: {} (reason: {}, estimated cost: ${:.3})",
        selected_model,
        decision.reason,
        decision.estimated_cost
    ))
}