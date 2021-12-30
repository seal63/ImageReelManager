#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use tauri::WindowBuilder;
fn main() {
   tauri::Builder::default()
    .create_window(
      "Rust".to_string(),
      tauri::WindowUrl::App("index.html".into()),
      |window_builder, webview_attributes| {
        (window_builder.title("Tauri"), webview_attributes.disable_file_drop_handler())
      },
    )
    .run(tauri::generate_context!())
    .expect("failed to run tauri application");
}

