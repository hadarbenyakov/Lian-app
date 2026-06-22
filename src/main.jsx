import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import IPhoneMockup from './IPhoneMockup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IPhoneMockup>
      <App />
    </IPhoneMockup>
  </StrictMode>,
)
