import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/I18nContext';

export interface ScoreButtonsProps {
  onScore: (known: boolean) => void;
}

export function ScoreButtons({ onScore }: ScoreButtonsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 justify-center">
      <Button onClick={() => onScore(true)} variant="default" size="lg" aria-label={t.score.knew}>
        {t.score.knew}
      </Button>
      <Button onClick={() => onScore(false)} variant="destructive" size="lg" aria-label={t.score.didntKnow}>
        {t.score.didntKnow}
      </Button>
    </div>
  );
}

ScoreButtons.displayName = 'ScoreButtons';
