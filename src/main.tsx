import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SubscriptionProvider } from './context/SubscriptionContext'



createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SubscriptionProvider>
            <App />
        </SubscriptionProvider>
    </StrictMode>,
)
