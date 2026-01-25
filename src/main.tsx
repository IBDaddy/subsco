import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SubscriptionProvider } from './context/SubscriptionContext'

// FORCE UNREGISTER SERVICE WORKER TO CLEAR CACHE
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister();
            console.log('Service Worker unregistered');
        }
    });
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SubscriptionProvider>
            <App />
        </SubscriptionProvider>
    </StrictMode>,
)
