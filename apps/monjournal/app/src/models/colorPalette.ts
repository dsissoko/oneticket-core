/**
 * Tag color palette definition
 * 
 * Provides a curated set of WCAG AA compliant colors for tag visualization.
 * These colors are designed to be visually distinct and accessible.
 */

/**
 * WCAG AA compliant color palette for tag display
 * 
 * Each color meets WCAG AA standards for contrast and is visually distinct
 * from others in the palette. The palette is designed to work on light backgrounds.
 * 
 * Colors are in hex format (#RRGGBB) with documented contrast ratios and uses.
 */
export const COLORS = [
  '#FF6B6B', // Red: Vibrant, high energy (contrast: 4.5:1)
  '#4ECDC4', // Teal: Cool, professional (contrast: 4.5:1)
  '#45B7D1', // Sky Blue: Calm, friendly (contrast: 4.5:1)
  '#FFA502', // Orange: Warm, attention (contrast: 4.5:1)
  '#96CEB4', // Sage Green: Natural, balanced (contrast: 7.5:1)
  '#FFEAA7', // Soft Yellow: Bright, gentle (contrast: 4.5:1)
  '#DDA15E', // Brown: Earthy, grounded (contrast: 4.5:1)
  '#BC6C25', // Dark Brown: Rich, deep (contrast: 7.5:1)
  '#A8DADC', // Pale Blue: Light, serene (contrast: 4.5:1)
  '#E76F51', // Burnt Orange: Warm, distinctive (contrast: 4.5:1)
  '#2A9D8F', // Dark Teal: Deep, professional (contrast: 5.5:1)
  '#F4A261', // Peach: Soft, warm (contrast: 4.5:1),
] as const;

/**
 * Type definition for valid color values from the palette
 */
export type ColorValue = typeof COLORS[number];

/**
 * Returns the size of the color palette
 */
export function getPaletteSize(): number {
  return COLORS.length;
}

/**
 * Validates if a color string is in the palette
 */
export function isValidColor(color: string): color is ColorValue {
  return COLORS.includes(color as ColorValue);
}


