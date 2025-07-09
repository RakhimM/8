// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
// src/main.ts
import './style.css';
import { invoke } from '@tauri-apps/api/core';

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>
      SCPI-клиент<br />
      <span>Генератор FRBG 3420/2 — LAN / USB</span>
    </h1>

    <div class="input-group horizontal-group">
      <label>Тип подключения:</label>
      <div class="radio-options">
        <label><input type="radio" name="method" value="LAN" checked /> LAN (IP)</label>
        <label><input type="radio" name="method" value="USB" /> USB (COM-порт)</label>
      </div>
    </div>

    <div class="input-group lan-only">
      <label for="ip">IP адрес:</label>
      <input id="ip" type="text" placeholder="192.168.1.100" value="192.168.1.100" />
    </div>

    <div class="input-group lan-only">
      <label for="port">Порт:</label>
      <input id="port" type="number" placeholder="5025" value="5025" />
    </div>

    <div class="input-group usb-only" style="display: none;">
      <label for="com">COM порт:</label>
      <input id="com" type="text" placeholder="Например, COM3" />
    </div>

    <div class="input-group">
      <label for="command-select">Быстрая команда:</label>
      <select id="command-select">
        <option value="">-- Выбрать --</option>
        <option value="*IDN?">*IDN? — Идентификация</option>
        <option value="FREQ 1000">FREQ 1000 — Частота 1 кГц</option>
        <option value="VOLT 5">VOLT 5 — Напряжение 5 В</option>
        <option value="OUTP ON">OUTP ON — Включить выход</option>
        <option value="OUTP OFF">OUTP OFF — Выключить выход</option>
      </select>
    </div>

    <div class="input-group">
      <label for="command">SCPI-команда:</label>
      <input id="command" type="text" placeholder="Введите SCPI-команду вручную" />
    </div>

    <button id="send">📡 Отправить команду</button>

    <pre id="response">Ожидание команды...</pre>
  </div>
`;

const sendButton = document.getElementById("send");
sendButton?.addEventListener("click", async () => {
  const method = (document.querySelector('input[name="method"]:checked') as HTMLInputElement)?.value;
  const ip = (document.getElementById("ip") as HTMLInputElement)?.value;
  const port = parseInt((document.getElementById("port") as HTMLInputElement)?.value);
  const com = (document.getElementById("com") as HTMLInputElement)?.value;
  const command = (document.getElementById("command") as HTMLInputElement)?.value;
  const responseBox = document.getElementById("response") as HTMLPreElement;

  responseBox.textContent = "Отправка...";

  try {
    const response = await invoke<string>("send_scpi_command", {
      method,
      ip: method === "LAN" ? ip : null,
      port: method === "LAN" ? port : null,
      com: method === "USB" ? com : null,
      command,
    });

    responseBox.textContent = response;
  } catch (e) {
    responseBox.textContent = `Ошибка: ${e}`;
  }
});

document.getElementById("command-select")?.addEventListener("change", (event) => {
  const select = event.target as HTMLSelectElement;
  const commandInput = document.getElementById("command") as HTMLInputElement;
  if (select.value) {
    commandInput.value = select.value;
  }
});

document.querySelectorAll('input[name="method"]').forEach((el) => {
  el.addEventListener('change', () => {
    const isLAN = (document.querySelector('input[name="method"]:checked') as HTMLInputElement)?.value === "LAN";
    document.querySelectorAll<HTMLElement>('.lan-only').forEach(e => e.style.display = isLAN ? 'block' : 'none');
    document.querySelectorAll<HTMLElement>('.usb-only').forEach(e => e.style.display = isLAN ? 'none' : 'block');
  });
});
