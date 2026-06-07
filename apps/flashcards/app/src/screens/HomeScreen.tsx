import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/I18nContext';
import { useThemeContext } from '@/context/ThemeContext';
import type { LearningMode } from '@/hooks/useLearningMode';

function ThemePicker(): React.ReactElement {
  const { themes, selectedThemeId, selectTheme } = useThemeContext();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{t.home.theme}</label>
      <select
        value={selectedThemeId ?? themes[0]?.id ?? ''}
        onChange={(e) => selectTheme(e.target.value)}
        className="w-full rounded-md border bg-background px-4 py-3 text-sm cursor-pointer"
      >
        {themes.map((th) => (
          <option key={th.id} value={th.id}>{th.name}</option>
        ))}
      </select>
    </div>
  );
}

function ModeSelector({ mode = 'flip' }: { mode?: LearningMode }): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{t.home.mode}</label>
      <div className="rounded-md border bg-muted/50 px-4 py-3 text-sm">
        {mode}
      </div>
    </div>
  );
}

export function HomeScreen(): React.ReactElement {
  const { currentTheme } = useThemeContext();
  const { t } = useTranslation();

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
              <Link to="/session">{t.home.start}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeScreen;
