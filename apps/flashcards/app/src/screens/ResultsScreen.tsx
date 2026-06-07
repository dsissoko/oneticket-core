import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';

/**
 * ResultsScreen Component
 *
 * Displays session score (X/Y known) after a flashcard session.
 * Provides replay option to restart and back to home navigation.
 */
export function ResultsScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { results, resetSession } = useSession();

  const knownCount = results.filter((r) => r.known).length;
  const totalCount = results.length;

  const handleReplay = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-4xl">Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-center text-2xl text-muted-foreground">
            You knew <span className="text-foreground font-semibold">{knownCount}</span>
            {' / '}
            <span className="text-foreground font-semibold">{totalCount}</span>
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleReplay}>Replay</Button>
            <Button variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsScreen;