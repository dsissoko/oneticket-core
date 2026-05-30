/**
 * Logger — loglevel + optional remote dispatch
 *
 * Level is controlled by VITE_LOG_LEVEL env var (default: debug).
 * Remote dispatch is activated by VITE_OTLP_ENDPOINT env var (default: off).
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info('App starting')
 *   logger.error('Something failed', error)
 */
import log from 'loglevel';

// loglevel-plugin-remote has no official types — minimal declaration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remote = (await import('loglevel-plugin-remote')).default as any;

const endpoint = import.meta.env.VITE_OTLP_ENDPOINT as string | undefined;

if (endpoint) {
  remote.apply(log, {
    url: endpoint,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    format: remote.json,
    level: 'debug',
    interval: 1000,
    capacity: 500,
  });
}

const configuredLevel = import.meta.env.VITE_LOG_LEVEL as log.LogLevelDesc | undefined;
const effectiveLevel: log.LogLevelDesc = configuredLevel || 'debug';

if (!configuredLevel) {
  // eslint-disable-next-line no-console
  console.warn('[logger] VITE_LOG_LEVEL not set — falling back to "debug"');
}

log.setLevel(effectiveLevel);

export const logger = log;
