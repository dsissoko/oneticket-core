/**
 * Component: SurpriseButton
 *
 * Action button to trigger the surprise feature, displayed in the main navigation.
 * Provides clear label with dice emoji and accessibility support.
 *
 * Features:
 * - Clear, compelling label: "🎲 Surprise" or "🎲 Découvrir"
 * - Keyboard accessible (Tab, Enter, Space)
 * - WCAG 2.1 AA compliant
 * - Optional disabled state
 * - Integration with primary navigation
 */

import React from 'react';
import { Button } from '@primer/react';
import { DiceIcon } from '@primer/octicons-react';

/**
 * Props for SurpriseButton component
 */
export interface SurpriseButtonProps {
  /**
   * Called when user clicks the button
   */
  onClick: () => void;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Display label for the button
   * @default "🎲 Surprise"
   */
  label?: string;

  /**
   * Optional CSS class for styling
   */
  className?: string;

  /**
   * Additional aria-label for accessibility
   */
  ariaLabel?: string;
}

/**
 * SurpriseButton - Trigger button for the surprise feature in main navigation
 *
 * @example
 * <SurpriseButton
 *   onClick={() => setSurpriseActive(true)}
 *   label="🎲 Découvrir"
 * />
 */
export function SurpriseButton({
  onClick,
  disabled = false,
  label = '🎲 Surprise',
  className,
  ariaLabel = 'Découvrir une entrée aléatoire du passé',
}: SurpriseButtonProps): JSX.Element {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      leadingVisual={DiceIcon}
      className={className}
      data-testid="surprise-button"
      aria-label={ariaLabel}
      title="Découvrir une entrée aléatoire du passé"
    >
      {label}
    </Button>
  );
}
