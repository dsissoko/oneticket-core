import {
  createCollisionSystem as createCollisionSystemDomain,
  type CollisionSystem,
} from '@/features/game/domain/collision-system';

export function createCollisionSystem(): CollisionSystem {
  return createCollisionSystemDomain();
}
