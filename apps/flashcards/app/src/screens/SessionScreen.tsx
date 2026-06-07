import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { ScoreButtons } from '@/components/ScoreButtons';
import { useSession } from '@/hooks/useSession';
import { useThemeContext } from '@/context/ThemeContext';

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * SessionScreen Component
 *
 * Displays a flashcard session with progress tracking and scoring.
 * Cards come from the currently selected theme via useTheme.
 */
export function SessionScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { currentTheme } = useThemeContext();
  const { currentIndex, results, recordResult, nextCard, resetSession } = useSession();
  const [isFlipped, setIsFlipped] = useState(false);
  const prevThemeId = useRef<string | undefined>(undefined);

  // Reset session when theme changes
  useEffect(() => {
    if (prevThemeId.current !== undefined && prevThemeId.current !== currentTheme?.id) {
      resetSession();
      setIsFlipped(false);
    }
    prevThemeId.current = currentTheme?.id;
  }, [currentTheme?.id, resetSession]);

  // Shuffle cards once per theme — stable across re-renders
  const cards = useMemo(
    () => shuffle(currentTheme?.cards ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTheme?.id]
  );
  const totalCards = cards.length;
  const currentCard = cards[currentIndex];
  const isSessionComplete = currentIndex >= totalCards;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleScore = useCallback(
    (known: boolean) => {
      if (currentCard) {
        recordResult(currentCard.id, known);
      }
      setIsFlipped(false);
      nextCard();

      if (currentIndex + 1 >= totalCards) {
        navigate('/results');
      }
    },
    [currentCard, recordResult, nextCard, currentIndex, totalCards, navigate],
  );

  if (totalCards === 0) {
    return (
      <div className="flex items-center justify-center flex-grow bg-background text-foreground">
        <p>No cards available for this session.</p>
      </div>
    );
  }

  if (isSessionComplete) {
    navigate('/results');
    return (
      <div className="flex items-center justify-center flex-grow bg-background text-foreground">
        <p>Session complete. Redirecting to results...</p>
      </div>
    );
  }

  const knownCount = results.filter((r) => r.known).length;

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-background text-foreground gap-8 p-8">

      {/* Stats row — score left, position right */}
      <div className="w-full max-w-sm flex justify-between text-sm font-medium text-muted-foreground">
        <span>✅ {knownCount} / {totalCards}</span>
        <span>{currentIndex + 1} / {totalCards}</span>
      </div>

      <FlashcardDisplay
        key={currentCard.id}
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        className="w-full max-w-sm"
      />

      {/* Reserved space for score buttons — always same height to prevent layout shift */}
      <div className="h-12 flex items-center justify-center">
        {isFlipped && <ScoreButtons onScore={handleScore} />}
      </div>
    </div>
  );
}

export default SessionScreen;
