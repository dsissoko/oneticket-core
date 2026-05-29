import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = document.getElementById('app');
if (!root) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
