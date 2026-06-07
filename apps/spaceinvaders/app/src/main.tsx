import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

function bootstrap(): void {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('[SpaceInvaders] Root element not found');
    return;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

try {
  bootstrap();
} catch (error) {
  console.error('[SpaceInvaders] Failed to bootstrap application', error);
}
