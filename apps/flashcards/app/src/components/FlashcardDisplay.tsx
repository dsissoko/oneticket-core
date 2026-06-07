import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

interface FlashcardDisplayProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

/**
 * FlashcardDisplay renders a card with front (country) and back (capital).
 * Tap/click triggers a 3D flip animation revealing the answer.
 */
export function FlashcardDisplay({
  card,
  isFlipped,
  onFlip,
  className,
}: FlashcardDisplayProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={cn('perspective-1000', className)}
      data-testid="flashcard-container"
    >
      <button
        type="button"
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        aria-label={isFlipped ? 'Show country name' : 'Show capital'}
        className="relative h-64 w-full cursor-pointer style-none bg-transparent p-0 [transform-style:preserve-3d] transition-transform duration-500 [transform:rotateY(180deg)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Front face — country name */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-border bg-card text-center text-2xl font-semibold shadow-md backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
          data-testid="flashcard-front"
        >
          <span>{card.front}</span>
        </div>

        {/* Back face — capital */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-border bg-primary text-center text-2xl font-semibold text-primary-foreground shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          data-testid="flashcard-back"
        >
          <span>{card.back}</span>
        </div>
      </button>
    </div>
  );
}