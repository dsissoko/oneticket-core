import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

// Placeholder App component for initialization
function App() {
  return (
    <div className="app">
      <h1>Journal Personnel</h1>
      <p>Application de journal personnel.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
