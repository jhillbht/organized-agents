// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod checkpoint;
mod claude_binary;
mod commands;
mod process;
mod sandbox;
mod education;
mod academy;

use checkpoint::state::CheckpointState;
use commands::agents::{
    cleanup_finished_processes, create_agent, delete_agent, execute_agent, export_agent,
    export_agent_to_file, fetch_github_agent_content, fetch_github_agents, get_agent,
    get_agent_run, get_agent_run_with_real_time_metrics, get_claude_binary_path,
    get_live_session_output, get_session_output, get_session_status, import_agent,
    import_agent_from_file, import_agent_from_github,
            import_preinstalled_agents, init_database, kill_agent_session,
    list_agent_runs, list_agent_runs_with_metrics, list_agents, list_claude_installations,
    list_running_sessions, set_claude_binary_path, stream_session_output, update_agent, AgentDb,
};
use commands::auth::{
    check_auth_status, claude_login, claude_logout, get_auth_mode,
};
use commands::claude::{
    cancel_claude_execution, check_auto_checkpoint, check_claude_version, cleanup_old_checkpoints,
    clear_checkpoint_manager, continue_claude_code, create_checkpoint, execute_claude_code,
    find_claude_md_files, fork_from_checkpoint, get_checkpoint_diff, get_checkpoint_settings,
    get_checkpoint_state_stats, get_claude_settings, get_project_sessions,
    get_recently_modified_files, get_session_timeline, get_system_prompt, list_checkpoints,
    list_directory_contents, list_projects, load_session_history, open_new_session,
    read_claude_md_file, restore_checkpoint, resume_claude_code, save_claude_md_file,
    save_claude_settings, save_system_prompt, search_files, track_checkpoint_message,
    track_session_messages, update_checkpoint_settings, ClaudeProcessState,
};
use commands::mcp::{
    mcp_add, mcp_add_from_claude_desktop, mcp_add_json, mcp_get, mcp_get_server_status, mcp_list,
    mcp_read_project_config, mcp_remove, mcp_reset_project_choices, mcp_save_project_config,
    mcp_serve, mcp_test_connection,
};
use commands::orchestration::{
    cancel_orchestration, create_orchestration_template, get_orchestration_execution,
    get_orchestration_executions, get_orchestration_template, get_orchestration_templates,
    initialize_orchestration_templates, start_orchestration,
};
use commands::router::{
    execute_with_router, get_router_config, get_router_status, get_routing_decision,
    set_router_config, start_router, stop_router, test_router_health, RouterManager,
};
use commands::sandbox::{
    clear_sandbox_violations, create_sandbox_profile, create_sandbox_rule, delete_sandbox_profile,
    delete_sandbox_rule, export_all_sandbox_profiles, export_sandbox_profile,
    get_platform_capabilities, get_sandbox_profile, get_sandbox_violation_stats,
    import_sandbox_profiles, list_sandbox_profiles, list_sandbox_rules, list_sandbox_violations,
    log_sandbox_violation, test_sandbox_profile, update_sandbox_profile, update_sandbox_rule,
};
use commands::screenshot::{capture_url_screenshot, cleanup_screenshot_temp_files};
use commands::usage::{
    get_session_stats, get_usage_by_date_range, get_usage_details, get_usage_stats,
};
use education::EducationDB;
use education::commands::{
    get_education_sessions, start_education_session, complete_education_session,
    reset_education_progress, initialize_education_system,
};
use academy::commands::{
    get_academy_modules, get_academy_lessons, get_lesson_with_progress,
    start_academy_lesson, complete_academy_lesson, submit_exercise_solution,
    get_user_academy_stats, get_user_achievements, initialize_academy_system,
    test_academy_database, initialize_academy_database, get_academy_stats,
};
use process::ProcessRegistryState;
use std::sync::{Arc, Mutex};
use tauri::Manager;

fn main() {
    // Initialize logger
    env_logger::init();

    // Check if we need to activate sandbox in this process
    if sandbox::executor::should_activate_sandbox() {
        // This is a child process that needs sandbox activation
        if let Err(e) = sandbox::executor::SandboxExecutor::activate_sandbox_in_child() {
            log::error!("Failed to activate sandbox: {}", e);
            // Continue without sandbox rather than crashing
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Initialize agents database
            let conn = init_database(&app.handle()).expect("Failed to initialize agents database");
            app.manage(AgentDb(Mutex::new(conn)));

            // Initialize checkpoint state
            let checkpoint_state = CheckpointState::new();

            // Set the Claude directory path
            if let Ok(claude_dir) = dirs::home_dir()
                .ok_or_else(|| "Could not find home directory")
                .and_then(|home| {
                    let claude_path = home.join(".claude");
                    claude_path
                        .canonicalize()
                        .map_err(|_| "Could not find ~/.claude directory")
                })
            {
                let state_clone = checkpoint_state.clone();
                tauri::async_runtime::spawn(async move {
                    state_clone.set_claude_dir(claude_dir).await;
                });
            }

            app.manage(checkpoint_state);

            // Initialize process registry
            app.manage(ProcessRegistryState::default());

            // Initialize Claude process state
            app.manage(ClaudeProcessState::default());

            // Initialize router manager
            let router_manager = Arc::new(RouterManager::new());
            app.manage(router_manager.clone());

            // Auto-start router if enabled
            let router_clone = router_manager.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = router_clone.auto_start_if_enabled().await {
                    log::error!("Failed to auto-start router: {}", e);
                }
            });

            // Initialize orchestration templates
            initialize_orchestration_templates();

            // Initialize education database
            let app_data_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            
            // Ensure the app data directory exists
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");
                
            let education_db_path = app_data_dir.join("education.db");
            let education_db = EducationDB::new(education_db_path)
                .expect("Failed to initialize education database");
            
            // Initialize sessions on startup
            education_db.initialize_sessions()
                .expect("Failed to initialize education sessions");
                
            app.manage(Mutex::new(education_db));

            // Initialize academy system
            if let Err(e) = academy::get_connection().and_then(|conn| academy::seed_academy_content(&conn)) {
                log::error!("Failed to initialize academy system: {}", e);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            get_project_sessions,
            get_claude_settings,
            open_new_session,
            get_system_prompt,
            check_claude_version,
            save_system_prompt,
            save_claude_settings,
            find_claude_md_files,
            read_claude_md_file,
            save_claude_md_file,
            load_session_history,
            execute_claude_code,
            continue_claude_code,
            resume_claude_code,
            cancel_claude_execution,
            list_directory_contents,
            search_files,
            create_checkpoint,
            restore_checkpoint,
            list_checkpoints,
            fork_from_checkpoint,
            get_session_timeline,
            update_checkpoint_settings,
            get_checkpoint_diff,
            track_checkpoint_message,
            track_session_messages,
            check_auto_checkpoint,
            cleanup_old_checkpoints,
            get_checkpoint_settings,
            clear_checkpoint_manager,
            get_checkpoint_state_stats,
            get_recently_modified_files,
            list_agents,
            create_agent,
            update_agent,
            delete_agent,
            get_agent,
            execute_agent,
            list_agent_runs,
            get_agent_run,
            list_agent_runs_with_metrics,
            get_agent_run_with_real_time_metrics,
            list_running_sessions,
            kill_agent_session,
            get_session_status,
            cleanup_finished_processes,
            get_session_output,
            get_live_session_output,
            stream_session_output,
            get_claude_binary_path,
            set_claude_binary_path,
            list_claude_installations,
            export_agent,
            export_agent_to_file,
            import_agent,
            import_agent_from_file,
            fetch_github_agents,
            fetch_github_agent_content,
            import_agent_from_github,
            import_preinstalled_agents,
            list_sandbox_profiles,
            get_sandbox_profile,
            create_sandbox_profile,
            update_sandbox_profile,
            delete_sandbox_profile,
            list_sandbox_rules,
            create_sandbox_rule,
            update_sandbox_rule,
            delete_sandbox_rule,
            test_sandbox_profile,
            get_platform_capabilities,
            list_sandbox_violations,
            log_sandbox_violation,
            clear_sandbox_violations,
            get_sandbox_violation_stats,
            export_sandbox_profile,
            export_all_sandbox_profiles,
            import_sandbox_profiles,
            get_usage_stats,
            get_usage_by_date_range,
            get_usage_details,
            get_session_stats,
            mcp_add,
            mcp_list,
            mcp_get,
            mcp_remove,
            mcp_add_json,
            mcp_add_from_claude_desktop,
            mcp_serve,
            mcp_test_connection,
            mcp_reset_project_choices,
            mcp_get_server_status,
            mcp_read_project_config,
            mcp_save_project_config,
            capture_url_screenshot,
            cleanup_screenshot_temp_files,
            get_router_config,
            set_router_config,
            start_router,
            stop_router,
            get_router_status,
            test_router_health,
            get_routing_decision,
            execute_with_router,
            get_orchestration_templates,
            get_orchestration_template,
            create_orchestration_template,
            start_orchestration,
            get_orchestration_execution,
            get_orchestration_executions,
            cancel_orchestration,
            get_education_sessions,
            start_education_session,
            complete_education_session,
            reset_education_progress,
            initialize_education_system,
            check_auth_status,
            claude_login,
            claude_logout,
            get_auth_mode,
            get_academy_modules,
            get_academy_lessons,
            get_lesson_with_progress,
            start_academy_lesson,
            complete_academy_lesson,
            submit_exercise_solution,
            get_user_academy_stats,
            get_user_achievements,
            initialize_academy_system,
            test_academy_database,
            initialize_academy_database,
            get_academy_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
