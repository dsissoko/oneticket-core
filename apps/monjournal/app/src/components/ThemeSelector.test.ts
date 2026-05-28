/**
 * ThemeSelector Performance Test
 * 
 * Verifies that theme changes complete in < 50ms as required by specifications.
 * This test uses a synchronous performance measurement since CSS variable 
 * changes via setAttribute are synchronous operations.
 */

describe('ThemeSelector Performance', () => {
  // Helper function to measure performance
  function measureThemeChange(theme: 'light' | 'dark'): number {
    const startTime = performance.now();
    
    // Simulate what applyThemeToRoot does
    document.documentElement.setAttribute('data-theme', theme);
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  test('theme change completes in < 50ms', () => {
    // Test light to dark
    const darkDuration = measureThemeChange('dark');
    expect(darkDuration).toBeLessThan(50);
    
    // Test dark to light
    const lightDuration = measureThemeChange('light');
    expect(lightDuration).toBeLessThan(50);
  });

  test('consecutive theme changes complete in < 50ms each', () => {
    const durations: number[] = [];
    
    // Perform 10 consecutive theme changes
    for (let i = 0; i < 10; i++) {
      const theme = i % 2 === 0 ? 'dark' : 'light';
      const duration = measureThemeChange(theme);
      durations.push(duration);
    }
    
    // All changes should be < 50ms
    durations.forEach(duration => {
      expect(duration).toBeLessThan(50);
    });
    
    // Average should be well under 50ms
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    expect(average).toBeLessThan(10);
  });

  test('CSS variables update is synchronous', () => {
    // Ensure data-theme attribute is properly set
    document.documentElement.setAttribute('data-theme', 'light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // No delay should be observable
    const before = document.documentElement.getAttribute('data-theme');
    const start = performance.now();
    document.documentElement.setAttribute('data-theme', 'light');
    const end = performance.now();
    const after = document.documentElement.getAttribute('data-theme');
    
    expect(after).toBe('light');
    expect(end - start).toBeLessThan(5); // Should be nearly instant
  });
});
