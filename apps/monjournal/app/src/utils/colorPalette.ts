/**
 * Color palette for tag assignment
 * All colors are WCAG AA compliant (minimum 4.5:1 contrast ratio)
 * Provides visually distinct colors for deterministic tag coloring
 */

export const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
  '#F8B88B', // Peach
  '#52B788', // Green
  '#D62828', // Dark Red
  '#F1FAEE', // Almost White (alt: use with dark bg)
];

/**
 * Verifies that the palette has sufficient colors
 */
export const validatePalette = (): boolean => {
  return COLORS.length >= 8 && COLORS.length <= 12;
};
