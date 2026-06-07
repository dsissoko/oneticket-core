import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * HomeScreen Component
 *
 * Landing page of the application served at `/`.
 * Displays welcome message and introduction.
 */
export function HomeScreen(): React.ReactElement {
  return (
    <div className="flex-grow flex items-center justify-center bg-background text-foreground px-4">
      <Button asChild size="lg">
        <Link to="/game">Start Game</Link>
      </Button>
    </div>
  );
}

export default HomeScreen;
