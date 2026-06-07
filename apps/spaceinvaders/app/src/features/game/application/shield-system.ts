import {
  createShieldSystem as createShieldSystemDomain,
  type ShieldSystem,
} from '@/features/game/domain/shield-system';

export function createShieldSystem(): ShieldSystem {
  return createShieldSystemDomain();
}
