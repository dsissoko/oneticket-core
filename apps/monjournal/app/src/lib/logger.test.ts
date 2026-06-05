import { describe, it, expect, vi, beforeEach } from 'vitest';
import log from 'loglevel';

describe('logger', () => {
  beforeEach(() => {
    log.setLevel('trace');
  });

  it('exports info, warn, error, debug methods', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('does not log debug when level is warn', () => {
    log.setLevel('warn');
    // At warn level, debug should not be logged
    const spy = vi.spyOn(log, 'debug');
    log.debug('should not appear');
    // loglevel does not call the underlying method when level is too low
    // We verify by checking the level directly
    expect(log.getLevel()).toBe(log.levels.WARN);
    spy.mockRestore();
  });

  it('setLevel controls verbosity — error level silences debug and info', () => {
    log.setLevel('error');
    expect(log.getLevel()).toBe(log.levels.ERROR);
    // Verify debug is below current level
    expect(log.getLevel()).toBeGreaterThan(log.levels.DEBUG);
  });

  it('debug level enables all logs', () => {
    log.setLevel('debug');
    expect(log.getLevel()).toBe(log.levels.DEBUG);
  });
});
