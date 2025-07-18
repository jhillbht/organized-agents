// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// Declare modules
pub mod bmad;
pub mod commands;
pub mod education;
pub mod academy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
