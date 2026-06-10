import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { ScoreButtons } from '@/components/ScoreButtons';
import { useSession } from '@/hooks/useSession';
import { ThemeContext } from '@/context/ThemeContext';
import { engineRegistry, normalizeCardSide } from '@/engine/EngineRegistry';
import type { Card } from '@/types';

interface SessionScreenProps {
  cards?: Card[];
}

/** Fisher-Yates shuffle — returns a new shuffled array of IDs */
function shuffleIds(cards: { id: string }[]): string[] {
  const ids = cards.map(c => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

/**
 * SessionScreen Component
 *
 * Displays a flashcard session with progress tracking and scoring.
 * Cards are drawn randomly from remaining (unplayed) cards only.
 */
export function SessionScreen({ cards: propCards }: SessionScreenProps = {}): React.ReactElement {
  const navigate = useNavigate();
  const themeCtx = useContext(ThemeContext);
  const currentTheme = themeCtx?.currentTheme;
  const { results, recordResult, resetSession } = useSession();
  const [isFlipped, setIsFlipped] = useState(false);
  const [remainingIds, setRemainingIds] = useState<string[]>([]);
  const [precomputePromise, setPrecomputePromise] = useState<Promise<void> | null>(null);
  const prevThemeId = useRef<string | undefined>(undefined);

  // Support optional cards prop for testing, fallback to theme cards
  const allCards = propCards ?? currentTheme?.cards ?? [];
  const totalCards = allCards.length;

  // Reset on mount — fresh start every time the user navigates to /session
  useEffect(() => {
    resetSession();
    setRemainingIds(shuffleIds(currentTheme?.cards ?? []));
    setIsFlipped(false);
    prevThemeId.current = currentTheme?.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset when theme changes
  useEffect(() => {
    if (prevThemeId.current !== undefined && prevThemeId.current !== currentTheme?.id) {
      resetSession();
      setRemainingIds(shuffleIds(currentTheme?.cards ?? []));
      setIsFlipped(false);
    }
    prevThemeId.current = currentTheme?.id;
  }, [currentTheme?.id, resetSession, currentTheme?.cards]);

  const currentCard = allCards.find(c => c.id === remainingIds[0]);
  const isSessionComplete = remainingIds.length === 0 && totalCards > 0;

  // Precompute back side when a new card is displayed (not flipped yet)
  useEffect(() => {
    if (!currentCard || isFlipped) return;
    const backEngine = engineRegistry.resolve(normalizeCardSide(currentCard.back).renderEngineId);
    const promise = backEngine.precompute?.(normalizeCardSide(currentCard.back).data);
    setPrecomputePromise(promise ?? null);
  }, [currentCard, isFlipped, currentCard?.back]);

  const handleFlip = useCallback(async () => {
    if (precomputePromise) {
      try {
        await precomputePromise;
      } catch {
        // Fallback: proceed with flip even if precompute failed
      }
    }
    setIsFlipped((prev) => !prev);
  }, [precomputePromise]);

  const handleScore = useCallback(
    (known: boolean) => {
      if (currentCard) {
        recordResult(currentCard.id, known);
      }
      setIsFlipped(false);
      setRemainingIds(prev => {
        const next = prev.slice(1);
        if (next.length === 0) {
          navigate('/results');
        }
        return next;
      });
    },
    [currentCard, recordResult, navigate],
  );

  if (totalCards === 0) {
    return (
      <div className="flex items-center justify-center flex-grow bg-background text-foreground">
        <p>No cards available for this session.</p>
      </div>
    );
  }

  if (isSessionComplete || !currentCard) {
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
        <span>{results.length} / {totalCards}</span>
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
