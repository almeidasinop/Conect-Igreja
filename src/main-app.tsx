import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx' // Aponta para o App dentro da nova pasta
import './app/index.css'   // Aponta para o CSS dentro da nova pasta

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
