import React from 'react'
import ReactDOM from 'react-dom/client'
import MasterApp from './MasterApp' // O nosso novo componente "porteiro"
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MasterApp />
  </React.StrictMode>,
)
