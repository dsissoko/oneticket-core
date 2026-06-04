import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundScreen(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-destructive">404</h1>
        <p className="text-2xl font-semibold text-foreground">Page Not Found</p>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline"><Link to="/">Go Home</Link></Button>
          <Button variant="ghost" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundScreen;
