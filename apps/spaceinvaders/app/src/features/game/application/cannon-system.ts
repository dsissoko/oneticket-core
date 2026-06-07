import {
  clampReloadDelayMs,
  createCannonSystem as createCannonSystemDomain,
  type CannonSystem,
  type CannonSystemConfig,
} from '@/features/game/domain/cannon-system';

export { clampReloadDelayMs };

export function createCannonSystem(
  config: Partial<CannonSystemConfig> = {},
): CannonSystem {
  return createCannonSystemDomain(config);
}
