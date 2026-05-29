import React from 'react';
import { Link } from 'react-router-dom';

/**
 * HomePage Component
 *
 * Landing page of the application served at `/`.
 * Displays welcome message and introduction.
 */
export function HomePage(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AppShell</h1>
        <p className="text-lg text-muted mb-8">Welcome to the foundation.</p>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Link
            to="/about"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            About Us
          </Link>
          <Link
            to="/help"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90"
          >
            Get Help
          </Link>
          <Link
            to="/nonexistent"
            className="px-4 py-2 bg-muted text-muted-foreground rounded hover:opacity-90"
          >
            Try 404
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
