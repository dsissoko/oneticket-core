import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';
import { engineRegistry, normalizeCardSide } from '@/engine/EngineRegistry';

interface FlashcardDisplayProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

/**
 * FlashcardDisplay renders a card with front and back via resolved render engines.
 * Tap/click triggers a 3D flip animation revealing the answer.
 */
export function FlashcardDisplay({
  card,
  isFlipped,
  onFlip,
  className,
}: FlashcardDisplayProps) {
  const frontRef = React.useRef<HTMLDivElement>(null);
  const backRef = React.useRef<HTMLDivElement>(null);

  const frontSide = normalizeCardSide(card.front);
  const backSide = normalizeCardSide(card.back);

  const frontEngine = engineRegistry.resolve(frontSide.renderEngineId);
  const backEngine = engineRegistry.resolve(backSide.renderEngineId);

  // Render front face via engine
  React.useEffect(() => {
    if (frontRef.current) {
      frontEngine.render(frontSide.data, frontRef.current);
    }
  }, [card.id, isFlipped, frontEngine, frontSide.data]);

  // Render back face via engine
  React.useEffect(() => {
    if (backRef.current) {
      backEngine.render(backSide.data, backRef.current);
    }
  }, [card.id, isFlipped, backEngine, backSide.data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={cn('animate-in fade-in zoom-in-95 duration-300', className)}
      data-testid="flashcard-container"
    >
      <div className="perspective-1000 h-64 w-full">
        <button
          type="button"
          onClick={onFlip}
          onKeyDown={handleKeyDown}
          aria-label={isFlipped ? 'Show country name' : 'Show capital'}
          className="relative h-full w-full cursor-pointer bg-transparent p-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
        {/* Front face — rendered via engine */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-border bg-card text-card-foreground text-center text-2xl font-semibold shadow-md backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
          data-testid="flashcard-front"
          ref={frontRef}
        />

        {/* Back face — rendered via engine */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-border bg-card text-card-foreground text-center text-2xl font-semibold shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          data-testid="flashcard-back"
          ref={backRef}
        />
      </button>
      </div>
    </div>
  );
}
