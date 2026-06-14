import React from 'react';

/**
 * LoadingIndicator Component
 *
 * Loading spinner displayed while lazy-loaded routes are being fetched.
 * Provides visual feedback to users during async component loading.
 */
export function LoadingIndicator(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 animate-spin">
          <svg
            className="w-full h-full text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-base text-muted">Loading...</p>
      </div>
    </div>
  );
}
