import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Automatically register and update PWA Service Worker
registerSW({ immediate: true });

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const renderApp = () => (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {renderApp()}
    </GoogleOAuthProvider>
  ) : (
    renderApp()
  )
);
