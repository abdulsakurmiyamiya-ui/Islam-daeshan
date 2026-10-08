import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Guard against unhandled promise rejections and modal exceptions from sandboxed iframes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught:', event.reason);
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // Intercept and prevent sandbox modal/permission crashes from breaking the UI
    if (event?.message && (event.message.includes('allow-modals') || event.message.includes('Script error'))) {
      console.warn('Sandbox restriction intercepted:', event.message);
      event.preventDefault();
    }
  });

  const originalAlert = window.alert;
  window.alert = function (msg?: any) {
    try {
      originalAlert?.call(window, msg);
    } catch {
      console.info('Dialog notice:', msg);
    }
  };

  const originalConfirm = window.confirm;
  window.confirm = function (msg?: any) {
    try {
      return originalConfirm ? originalConfirm.call(window, msg) : true;
    } catch {
      return true;
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

