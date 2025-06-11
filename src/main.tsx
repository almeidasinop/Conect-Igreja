import React from 'react'
import ReactDOM from 'react-dom/client'
import MasterApp from './MasterApp' // O nosso novo componente "porteiro"
import './index.css'
import { registerSW } from 'virtual:pwa-register'
registerSW()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MasterApp />
  </React.StrictMode>,
)
// PWA: registrar SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}