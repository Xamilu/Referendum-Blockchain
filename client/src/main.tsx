import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Web3ContextProvider } from './hooks/useWeb3.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3ContextProvider>
    <App />
    </Web3ContextProvider>
  </StrictMode>,
)
