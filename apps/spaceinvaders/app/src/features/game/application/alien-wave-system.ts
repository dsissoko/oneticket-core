import {
  createAlienWaveSystem as createAlienWaveSystemDomain,
  type AlienWaveSystem,
  type AlienWaveSystemConfig,
} from '@/features/game/domain/alien-wave-system';

export function createAlienWaveSystem(
  config: Partial<AlienWaveSystemConfig> = {},
): AlienWaveSystem {
  return createAlienWaveSystemDomain(config);
}
