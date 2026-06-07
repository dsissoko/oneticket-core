import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { ProgressBar } from '@/components/ProgressBar';
import { ScoreButtons } from '@/components/ScoreButtons';
import { useSession } from '@/hooks/useSession';
import { useThemeContext } from '@/context/ThemeContext';

/**
 * SessionScreen Component
 *
 * Displays a flashcard session with progress tracking and scoring.
 * Cards come from the currently selected theme via useTheme.
 */
export function SessionScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { currentTheme } = useThemeContext();
  const { currentIndex, recordResult, nextCard } = useSession();
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = currentTheme?.cards ?? [];
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

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-background text-foreground gap-8 p-8">
      <ProgressBar current={currentIndex + 1} total={totalCards} />

      <FlashcardDisplay
        key={currentCard.id}
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      {/* Reserved space for score buttons — always same height to prevent layout shift */}
      <div className="h-12 flex items-center justify-center">
        {isFlipped && <ScoreButtons onScore={handleScore} />}
      </div>
    </div>
  );
}

export default SessionScreen;
