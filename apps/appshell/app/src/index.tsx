import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';

function App(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AppShell</h1>
        <p className="text-lg text-muted">Welcome to the foundation.</p>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
