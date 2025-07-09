// // Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// fn main() {
//   app_lib::run();
// }
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::TcpStream;
use std::io::{Read, Write};
use std::time::Duration;

#[tauri::command]
fn send_scpi_command(
    method: String,
    ip: Option<String>,
    port: Option<u16>,
    com: Option<String>,
    command: String,
) -> Result<String, String> {
    match method.as_str() {
        "LAN" => {
            let address = format!("{}:{}", ip.unwrap_or_default(), port.unwrap_or(5025));
            let mut stream = TcpStream::connect(address).map_err(|e| e.to_string())?;
            stream.write_all(command.as_bytes()).map_err(|e| e.to_string())?;
            stream.write_all(b"\n").map_err(|e| e.to_string())?;

            let mut buffer = [0; 1024];
            let size = stream.read(&mut buffer).map_err(|e| e.to_string())?;
            Ok(String::from_utf8_lossy(&buffer[..size]).to_string())
        }
        "USB" => {
            let port_name = com.ok_or("COM-порт не указан")?;

            let mut port = serialport::new(port_name, 9600)
                .timeout(Duration::from_secs(2))
                .open()
                .map_err(|e| format!("Ошибка открытия порта: {}", e))?;

            port.write_all(command.as_bytes()).map_err(|e| e.to_string())?;
            port.write_all(b"\n").map_err(|e| e.to_string())?;

            let mut buffer = [0; 1024];
            let size = port.read(&mut buffer).map_err(|e| e.to_string())?;
            Ok(String::from_utf8_lossy(&buffer[..size]).to_string())
        }
        _ => Err("Неверный тип подключения".to_string()),
    }
}

use tauri::{Builder, generate_context};

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![send_scpi_command])
        .run(generate_context!())
        .expect("error while running tauri application");
}
