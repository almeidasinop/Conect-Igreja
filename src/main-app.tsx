import React from 'react'
import ReactDOM from 'react-dom/client'
// CORREÇÃO: Aponta para o ficheiro AppPwa.tsx na raiz de src
import AppPwa from './App-pwa.tsx'
// CORREÇÃO: Aponta para o ficheiro index.css na raiz de src
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppPwa />
  </React.StrictMode>,
)
