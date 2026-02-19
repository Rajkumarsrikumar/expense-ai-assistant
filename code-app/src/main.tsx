import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PowerProvider from './PowerProvider.tsx'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </StrictMode>,
)
