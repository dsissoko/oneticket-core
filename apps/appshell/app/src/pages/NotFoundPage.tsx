import React from 'react';

/**
 * NotFoundPage Component
 *
 * 404 Not Found page displayed for invalid routes.
 * Provides friendly message and links to navigate back.
 */
export function NotFoundPage(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-destructive">404</h1>
        <p className="text-2xl font-bold mb-4">Page Not Found</p>
        <p className="text-lg text-muted mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            Go to Home Page
          </a>
          <button
            onClick={() => window.history.back()}
            className="block mx-auto text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
