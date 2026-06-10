import { describe, it, expect } from 'vitest';

describe('logger', () => {
  it('exports info, warn, error, debug methods', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});
