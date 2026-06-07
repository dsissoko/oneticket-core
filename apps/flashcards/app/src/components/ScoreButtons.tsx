import { Button } from '@/components/ui/button';

/**
 * ScoreButtons Component
 *
 * Two-button score input for flashcard sessions:
 * - "I knew it" — records the card as known (onScore(true))
 * - "I didn't know" — records the card as unknown (onScore(false))
 *
 * Appears after the user flips a flashcard to reveal the answer.
 *
 * @component
 * @param onScore - Callback invoked with true for "knew it", false for "didn't know"
 * @example
 * return <ScoreButtons onScore={(known) => handleScore(known)} />
 */
export interface ScoreButtonsProps {
  onScore: (known: boolean) => void;
}

export function ScoreButtons({ onScore }: ScoreButtonsProps): React.ReactElement {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        onClick={() => onScore(true)}
        variant="default"
        size="lg"
        aria-label="I knew it"
      >
        I knew it
      </Button>
      <Button
        onClick={() => onScore(false)}
        variant="destructive"
        size="lg"
        aria-label="I didn't know"
      >
        I didn't know
      </Button>
    </div>
  );
}

ScoreButtons.displayName = 'ScoreButtons';