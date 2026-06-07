import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import type { LearningMode } from '@/hooks/useLearningMode';

/**
 * ThemePicker component
 * Displays the currently selected theme name.
 */
function ThemePicker(): React.ReactElement {
  const { themes } = useTheme();
  const themeName = themes[0]?.name ?? 'World Capitals';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Theme</label>
      <div className="rounded-md border bg-muted/50 px-4 py-3 text-sm">
        {themeName}
      </div>
    </div>
  );
}

/**
 * ModeSelector component
 * Displays the selected learning mode.
 */
function ModeSelector({
  mode = 'flip',
}: {
  mode?: LearningMode;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Mode</label>
      <div className="rounded-md border bg-muted/50 px-4 py-3 text-sm">
        {mode}
      </div>
    </div>
  );
}

/**
 * HomeScreen Component
 *
 * Landing page of the application served at `/`.
 * Displays theme picker, mode selector, and Start button.
 */
export function HomeScreen(): React.ReactElement {
  const { currentTheme } = useTheme();

  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-4xl">Flashcards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-center text-lg text-muted-foreground">
            {currentTheme?.name ?? 'World Capitals'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <ThemePicker />
            <ModeSelector mode="flip" />
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link to="/session">Start</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeScreen;