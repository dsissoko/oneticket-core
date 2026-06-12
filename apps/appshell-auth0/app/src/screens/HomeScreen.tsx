import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
          <CardTitle className="text-center text-4xl">AppShell Auth0</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-center text-lg text-muted-foreground">Welcome to the foundation.</p>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline"><Link to="/demo">Explore patterns</Link></Button>
            <Button variant="outline"><Link to="/about">About Us</Link></Button>
            <Button variant="outline"><Link to="/nonexistent">Test 404 →</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeScreen;
