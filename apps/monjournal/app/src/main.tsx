/**
 * MonJournal App Entry Point
 * 
 * This is the main application file that initializes React and mounts the app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

// TODO: Import App component and other initialization logic
const App = () => (
  <div>
    <h1>MonJournal</h1>
    <p>Coming soon...</p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
