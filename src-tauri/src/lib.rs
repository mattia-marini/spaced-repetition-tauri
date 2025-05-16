// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_markdown(workspace_path: &str) -> String {
    match fs::read_to_string(workspace_path) {
        Ok(rv) => rv,
        Err(e) => format!("Error in reading file {}: {}", workspace_path, e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
