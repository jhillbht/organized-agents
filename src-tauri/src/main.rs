// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bmad;
mod education;
mod academy;
mod commands;

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
use bmad::{ProjectManager};
use commands::bmad_commands::*;
use commands::ide_commands::*;
use std::sync::Mutex;
use tauri::Manager;

fn main() {
    // Initialize logger
    tracing_subscriber::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Initialize BMAD Project Manager
            let project_manager = ProjectManager::new()
                .expect("Failed to initialize BMAD Project Manager");
            app.manage(Mutex::new(project_manager));

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
                tracing::error!("Failed to initialize academy system: {}", e);
            }

            tracing::info!("BMAD Desktop initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // BMAD Desktop Commands
            discover_bmad_projects,
            create_bmad_project,
            list_bmad_projects,
            get_bmad_project,
            set_active_bmad_project,
            get_active_bmad_project,
            delete_bmad_project,
            get_agent_recommendations,
            transition_bmad_phase,
            start_story,
            complete_story,
            report_blocker,
            get_workflow_summary,
            get_project_messages,
            send_agent_message,
            mark_message_read,
            launch_ide_with_context,
            detect_installed_ides,
            get_ide_preferences,
            save_ide_preferences,
            set_default_ide,
            get_agent_ide_recommendation,
            validate_bmad_project,
            create_bmad_structure,
            get_project_statistics,
            // Education system (keep existing)
            get_education_sessions,
            start_education_session,
            complete_education_session,
            reset_education_progress,
            initialize_education_system,
            // Academy system (keep existing)
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
