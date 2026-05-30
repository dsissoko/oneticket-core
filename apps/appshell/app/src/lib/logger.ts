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
  });
}

log.setLevel((import.meta.env.VITE_LOG_LEVEL || 'debug') as log.LogLevelDesc);

export const logger = log;
