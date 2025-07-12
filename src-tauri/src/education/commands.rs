use super::{EducationDB, Session, UserProgress};
use anyhow::Result;
use std::sync::Mutex;
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionWithProgress {
    pub session: Session,
    pub progress: Option<UserProgress>,
}

#[tauri::command]
pub async fn get_education_sessions(
    education_db: State<'_, Mutex<EducationDB>>,
) -> Result<Vec<SessionWithProgress>, String> {
    let db = education_db.lock().map_err(|e| e.to_string())?;
    
    let sessions_with_progress = db.get_all_sessions_with_progress()
        .map_err(|e| e.to_string())?;
    
    Ok(sessions_with_progress
        .into_iter()
        .map(|(session, progress)| SessionWithProgress { session, progress })
        .collect())
}

#[tauri::command]
pub async fn start_education_session(
    session_id: String,
    education_db: State<'_, Mutex<EducationDB>>,
) -> Result<(), String> {
    let db = education_db.lock().map_err(|e| e.to_string())?;
    db.start_session(&session_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn complete_education_session(
    session_id: String,
    score: i32,
    education_db: State<'_, Mutex<EducationDB>>,
) -> Result<(), String> {
    let db = education_db.lock().map_err(|e| e.to_string())?;
    db.complete_session(&session_id, score).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn reset_education_progress(
    education_db: State<'_, Mutex<EducationDB>>,
) -> Result<(), String> {
    let db = education_db.lock().map_err(|e| e.to_string())?;
    db.reset_progress().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn initialize_education_system(
    education_db: State<'_, Mutex<EducationDB>>,
) -> Result<(), String> {
    let db = education_db.lock().map_err(|e| e.to_string())?;
    db.initialize_sessions().map_err(|e| e.to_string())
}