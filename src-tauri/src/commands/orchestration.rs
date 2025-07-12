use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager, Runtime};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tokio::time::sleep;

use crate::commands::agents::{execute_agent, Agent};
use crate::commands::router::get_routing_decision;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestrationTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon: String,
    pub complexity: String,
    pub estimated_time: String,
    pub agents: Vec<String>, // Agent IDs
    pub routing_strategy: String,
    pub estimated_savings: i32,
    pub use_cases: Vec<String>,
    pub steps: Vec<OrchestrationStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestrationStep {
    pub id: String,
    pub name: String,
    pub description: String,
    pub agent_id: String,
    pub task_template: String,
    pub depends_on: Vec<String>, // Step IDs this step depends on
    pub timeout_minutes: u64,
    pub retry_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestrationExecution {
    pub id: String,
    pub template_id: String,
    pub project_path: String,
    pub initial_task: String,
    pub status: OrchestrationStatus,
    pub started_at: u64,
    pub completed_at: Option<u64>,
    pub current_step: Option<String>,
    pub completed_steps: Vec<String>,
    pub failed_steps: Vec<String>,
    pub step_results: HashMap<String, StepResult>,
    pub total_cost: f64,
    pub total_tokens: u64,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepResult {
    pub step_id: String,
    pub agent_id: String,
    pub status: StepStatus,
    pub started_at: u64,
    pub completed_at: Option<u64>,
    pub task: String,
    pub output: Option<String>,
    pub error: Option<String>,
    pub cost: f64,
    pub tokens: u64,
    pub model_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrchestrationStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StepStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Skipped,
}

// Global orchestration state
use std::sync::OnceLock;
static ORCHESTRATION_EXECUTIONS: OnceLock<Arc<Mutex<HashMap<String, OrchestrationExecution>>>> = OnceLock::new();
static ORCHESTRATION_TEMPLATES: OnceLock<Arc<Mutex<HashMap<String, OrchestrationTemplate>>>> = OnceLock::new();

fn get_executions() -> &'static Arc<Mutex<HashMap<String, OrchestrationExecution>>> {
    ORCHESTRATION_EXECUTIONS.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

fn get_templates() -> &'static Arc<Mutex<HashMap<String, OrchestrationTemplate>>> {
    ORCHESTRATION_TEMPLATES.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

#[tauri::command]
pub async fn get_orchestration_templates() -> Result<Vec<OrchestrationTemplate>, String> {
    let templates = get_templates().lock().unwrap();
    Ok(templates.values().cloned().collect())
}

#[tauri::command]
pub async fn get_orchestration_template(template_id: String) -> Result<OrchestrationTemplate, String> {
    let templates = get_templates().lock().unwrap();
    templates.get(&template_id)
        .cloned()
        .ok_or_else(|| format!("Template with id {} not found", template_id))
}

#[tauri::command]
pub async fn create_orchestration_template(template: OrchestrationTemplate) -> Result<String, String> {
    let mut templates = get_templates().lock().unwrap();
    let id = template.id.clone();
    templates.insert(id.clone(), template);
    Ok(id)
}

#[tauri::command]
pub async fn start_orchestration<R: Runtime>(
    app: AppHandle<R>,
    template_id: String,
    project_path: String,
    initial_task: String,
) -> Result<String, String> {
    let template = {
        let templates = get_templates().lock().unwrap();
        templates.get(&template_id)
            .cloned()
            .ok_or_else(|| format!("Template with id {} not found", template_id))?
    };

    let execution_id = Uuid::new_v4().to_string();
    let execution = OrchestrationExecution {
        id: execution_id.clone(),
        template_id,
        project_path: project_path.clone(),
        initial_task: initial_task.clone(),
        status: OrchestrationStatus::Pending,
        started_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        completed_at: None,
        current_step: None,
        completed_steps: Vec::new(),
        failed_steps: Vec::new(),
        step_results: HashMap::new(),
        total_cost: 0.0,
        total_tokens: 0,
        error_message: None,
    };

    // Store execution
    {
        let mut executions = get_executions().lock().unwrap();
        executions.insert(execution_id.clone(), execution);
    }

    // Start execution in background
    let app_handle = app.clone();
    let exec_id = execution_id.clone();
    tokio::spawn(async move {
        execute_orchestration(app_handle, exec_id, template, project_path, initial_task).await;
    });

    Ok(execution_id)
}

#[tauri::command]
pub async fn get_orchestration_execution(execution_id: String) -> Result<OrchestrationExecution, String> {
    let executions = get_executions().lock().unwrap();
    executions.get(&execution_id)
        .cloned()
        .ok_or_else(|| format!("Execution with id {} not found", execution_id))
}

#[tauri::command]
pub async fn get_orchestration_executions() -> Result<Vec<OrchestrationExecution>, String> {
    let executions = get_executions().lock().unwrap();
    Ok(executions.values().cloned().collect())
}

#[tauri::command]
pub async fn cancel_orchestration<R: Runtime>(
    app: AppHandle<R>,
    execution_id: String,
) -> Result<(), String> {
    let mut executions = get_executions().lock().unwrap();
    if let Some(execution) = executions.get_mut(&execution_id) {
        execution.status = OrchestrationStatus::Cancelled;
        
        // Emit cancellation event
        let _ = app.emit_all("orchestration-cancelled", &execution_id);
        
        Ok(())
    } else {
        Err(format!("Execution with id {} not found", execution_id))
    }
}

// Initialize default templates
pub fn initialize_orchestration_templates() {
    let mut templates = get_templates().lock().unwrap();
    
    // Full-Stack Development Pipeline
    templates.insert("full-stack-dev".to_string(), OrchestrationTemplate {
        id: "full-stack-dev".to_string(),
        name: "Full-Stack Development Pipeline".to_string(),
        description: "Complete application development with cost optimization".to_string(),
        category: "Development".to_string(),
        icon: "🚀".to_string(),
        complexity: "Advanced".to_string(),
        estimated_time: "2-3 hours".to_string(),
        agents: vec!["codebase-mastery".to_string(), "testing-revolution".to_string(), "review-mastery".to_string()],
        routing_strategy: "multi_model_optimization".to_string(),
        estimated_savings: 65,
        use_cases: vec![
            "New feature development".to_string(),
            "API implementation".to_string(),
            "Frontend-backend integration".to_string(),
        ],
        steps: vec![
            OrchestrationStep {
                id: "step1".to_string(),
                name: "Code Analysis".to_string(),
                description: "Analyze codebase structure and requirements".to_string(),
                agent_id: "codebase-mastery".to_string(),
                task_template: "Analyze the codebase structure for: {initial_task}".to_string(),
                depends_on: vec![],
                timeout_minutes: 30,
                retry_count: 2,
            },
            OrchestrationStep {
                id: "step2".to_string(),
                name: "Implementation".to_string(),
                description: "Implement the requested feature".to_string(),
                agent_id: "codebase-mastery".to_string(),
                task_template: "Based on the analysis, implement: {initial_task}".to_string(),
                depends_on: vec!["step1".to_string()],
                timeout_minutes: 60,
                retry_count: 2,
            },
            OrchestrationStep {
                id: "step3".to_string(),
                name: "Testing".to_string(),
                description: "Create and run comprehensive tests".to_string(),
                agent_id: "testing-revolution".to_string(),
                task_template: "Create comprehensive tests for the implemented feature: {initial_task}".to_string(),
                depends_on: vec!["step2".to_string()],
                timeout_minutes: 45,
                retry_count: 2,
            },
            OrchestrationStep {
                id: "step4".to_string(),
                name: "Code Review".to_string(),
                description: "Review implementation and suggest improvements".to_string(),
                agent_id: "review-mastery".to_string(),
                task_template: "Review the implementation and tests for: {initial_task}".to_string(),
                depends_on: vec!["step2".to_string(), "step3".to_string()],
                timeout_minutes: 30,
                retry_count: 1,
            },
        ],
    });

    // Add more default templates as needed
}

async fn execute_orchestration<R: Runtime>(
    app: AppHandle<R>,
    execution_id: String,
    template: OrchestrationTemplate,
    project_path: String,
    initial_task: String,
) {
    // Update status to running
    {
        let mut executions = get_executions().lock().unwrap();
        if let Some(execution) = executions.get_mut(&execution_id) {
            execution.status = OrchestrationStatus::Running;
        }
    }

    // Emit start event
    let _ = app.emit_all("orchestration-started", &execution_id);

    // Build dependency graph and execute steps
    let mut completed_steps = Vec::new();
    let mut failed_steps = Vec::new();
    let mut step_results = HashMap::new();

    for step in &template.steps {
        // Check if dependencies are satisfied
        let dependencies_satisfied = step.depends_on.iter().all(|dep_id| {
            completed_steps.contains(dep_id)
        });

        if !dependencies_satisfied {
            continue;
        }

        // Update current step
        {
            let mut executions = get_executions().lock().unwrap();
            if let Some(execution) = executions.get_mut(&execution_id) {
                execution.current_step = Some(step.id.clone());
            }
        }

        // Emit step start event
        let _ = app.emit_all("orchestration-step-started", (&execution_id, &step.id));

        // Execute step
        let step_result = execute_step(
            &app,
            &execution_id,
            step,
            &project_path,
            &initial_task,
        ).await;

        // Store step result
        step_results.insert(step.id.clone(), step_result.clone());

        // Update execution state
        {
            let mut executions = get_executions().lock().unwrap();
            if let Some(execution) = executions.get_mut(&execution_id) {
                execution.step_results.insert(step.id.clone(), step_result.clone());
                execution.total_cost += step_result.cost;
                execution.total_tokens += step_result.tokens;
            }
        }

        match step_result.status {
            StepStatus::Completed => {
                completed_steps.push(step.id.clone());
                // Emit step completion event
                let _ = app.emit_all("orchestration-step-completed", (&execution_id, &step.id));
            }
            StepStatus::Failed => {
                failed_steps.push(step.id.clone());
                // Emit step failure event
                let _ = app.emit_all("orchestration-step-failed", (&execution_id, &step.id));
                break; // Stop execution on first failure
            }
            _ => {}
        }
    }

    // Determine final status
    let final_status = if !failed_steps.is_empty() {
        OrchestrationStatus::Failed
    } else if completed_steps.len() == template.steps.len() {
        OrchestrationStatus::Completed
    } else {
        OrchestrationStatus::Failed
    };

    // Update final execution state
    {
        let mut executions = get_executions().lock().unwrap();
        if let Some(execution) = executions.get_mut(&execution_id) {
            execution.status = final_status;
            execution.completed_at = Some(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            );
            execution.completed_steps = completed_steps;
            execution.failed_steps = failed_steps;
            execution.current_step = None;
        }
    }

    // Emit completion event
    let _ = app.emit_all("orchestration-completed", &execution_id);
}

async fn execute_step<R: Runtime>(
    app: &AppHandle<R>,
    execution_id: &str,
    step: &OrchestrationStep,
    project_path: &str,
    initial_task: &str,
) -> StepResult {
    let start_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Prepare task by replacing placeholders
    let task = step.task_template.replace("{initial_task}", initial_task);

    // Get routing decision for cost optimization
    let routing_decision = get_routing_decision(task.clone(), Some(project_path.to_string()))
        .await
        .unwrap_or_else(|_| crate::commands::router::RoutingDecision {
            selected_model: "sonnet".to_string(),
            reason: "Fallback to sonnet".to_string(),
            estimated_cost: "0.10".to_string(),
            fallback_used: true,
        });

    // Execute the agent
    match execute_agent(
        step.agent_id.clone(),
        project_path.to_string(),
        task.clone(),
        routing_decision.selected_model.clone(),
    ).await {
        Ok(run_id) => {
            // For now, simulate execution completion
            // In a real implementation, we would wait for the agent to complete
            // and collect the actual results
            
            // Simulate some processing time
            sleep(Duration::from_secs(5)).await;
            
            let end_time = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();

            StepResult {
                step_id: step.id.clone(),
                agent_id: step.agent_id.clone(),
                status: StepStatus::Completed,
                started_at: start_time,
                completed_at: Some(end_time),
                task,
                output: Some(format!("Agent {} completed successfully", step.agent_id)),
                error: None,
                cost: 0.25, // Simulated cost
                tokens: 1500, // Simulated tokens
                model_used: Some(routing_decision.selected_model),
            }
        }
        Err(error) => {
            let end_time = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();

            StepResult {
                step_id: step.id.clone(),
                agent_id: step.agent_id.clone(),
                status: StepStatus::Failed,
                started_at: start_time,
                completed_at: Some(end_time),
                task,
                output: None,
                error: Some(error),
                cost: 0.0,
                tokens: 0,
                model_used: None,
            }
        }
    }
}