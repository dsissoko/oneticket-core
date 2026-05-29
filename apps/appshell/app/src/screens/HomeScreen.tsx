import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * HomeScreen Component
 *
 * Landing page of the application served at `/`.
 * Displays welcome message and introduction.
 */
export function HomeScreen(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-4xl">AppShell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-center text-lg text-muted-foreground">Welcome to the foundation.</p>
          <div className="grid grid-cols-3 gap-4">
            <Link
              to="/about"
              className={cn(
                'inline-flex items-center justify-center',
                'px-4 py-2 rounded-md',
                'bg-primary text-primary-foreground',
                'hover:opacity-90 transition-opacity'
              )}
            >
              About Us
            </Link>
            <Link
              to="/help"
              className={cn(
                'inline-flex items-center justify-center',
                'px-4 py-2 rounded-md',
                'bg-secondary text-secondary-foreground',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Get Help
            </Link>
            <Link
              to="/nonexistent"
              className={cn(
                'inline-flex items-center justify-center',
                'px-4 py-2 rounded-md',
                'bg-muted text-muted-foreground',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Try 404
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeScreen;
