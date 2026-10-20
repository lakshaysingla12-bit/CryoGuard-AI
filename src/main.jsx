
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "bootstrap-icons/font/bootstrap-icons.css";
import { LiveProvider } from './context/LiveContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LiveProvider>
      <App />
    </LiveProvider>
  </StrictMode>,
)
