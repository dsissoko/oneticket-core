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
// Synchronous import — loglevel-plugin-remote is a runtime dependency always available.
// Dynamic import (await import(...)) would be cleaner but requires top-level await,
// which is only supported from ES2022. Current target is ES2020 (tsconfig.json).
// To use dynamic import: bump target to "ES2022" in tsconfig.json and vite.config.ts build.target.
import remote from 'loglevel-plugin-remote';

const endpoint = import.meta.env.VITE_OTLP_ENDPOINT as string | undefined;

const configuredLevel = import.meta.env.VITE_LOG_LEVEL as log.LogLevelDesc | undefined;
const effectiveLevel: log.LogLevelDesc = configuredLevel || 'debug';

if (!configuredLevel) {
  // eslint-disable-next-line no-console
  console.warn('[logger] VITE_LOG_LEVEL not set — falling back to "debug"');
}

log.setLevel(effectiveLevel);

if (endpoint) {
  remote.apply(log, {
    url: endpoint,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    format: remote.json,
    level: effectiveLevel,
    interval: 1000,
    capacity: 500,
  });
}

export const logger = log;
