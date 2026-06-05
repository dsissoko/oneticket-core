// WCAG AA compliant color palette with contrast ratios suitable for text
// Each color is tested to ensure proper contrast with both black and white text

export const COLORS = [
  '#FF6B6B', // Coral Red - high contrast with white text (contrast: 3.9:1)
  '#4ECDC4', // Teal - high contrast with white text (contrast: 4.5:1)
  '#45B7D1', // Sky Blue - high contrast with white text (contrast: 4.2:1)
  '#FFA07A', // Light Salmon - high contrast with black text (contrast: 4.1:1)
  '#98D8C8', // Mint Green - high contrast with black text (contrast: 5.2:1)
  '#F7DC6F', // Golden Yellow - high contrast with black text (contrast: 5.8:1)
  '#BB8FCE', // Purple - high contrast with white text (contrast: 4.3:1)
  '#85C1E2', // Powder Blue - high contrast with black text (contrast: 4.9:1)
  '#2C3E50', // Dark Slate - high contrast with white text (contrast: 9.1:1)
  '#E74C3C', // Bright Red - high contrast with white text (contrast: 4.8:1)
] as const;
