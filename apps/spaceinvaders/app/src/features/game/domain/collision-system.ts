import type {
  AlienState,
  CannonState,
  MissileState,
  ShieldState,
} from '@/game/types';

const MISSILE_WIDTH = 2;
const MISSILE_HEIGHT = 12;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CollisionSystemInput {
  playerMissiles: MissileState[];
  alienMissiles: MissileState[];
  aliens: AlienState[];
  cannon: CannonState | null;
  shields: ShieldState[];
}

export interface CollisionEvent {
  type: 'missile-shield' | 'missile-alien' | 'missile-cannon';
  missileId: string;
  targetId: string;
}

export interface CollisionResolution {
  playerMissiles: MissileState[];
  alienMissiles: MissileState[];
  aliens: AlienState[];
  shieldImpacts: string[];
  cannonHit: boolean;
  events: CollisionEvent[];
}

export interface CollisionSystem {
  resolve: (input: CollisionSystemInput) => CollisionResolution;
}

function intersects(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function getEntityRect(
  entity: Pick<AlienState, 'x' | 'y' | 'width' | 'height'>,
): Rect {
  return {
    left: entity.x,
    top: entity.y,
    right: entity.x + entity.width,
    bottom: entity.y + entity.height,
  };
}

function getShieldRect(shield: ShieldState): Rect {
  return {
    left: shield.x - shield.width / 2,
    top: shield.y - shield.height / 2,
    right: shield.x + shield.width / 2,
    bottom: shield.y + shield.height / 2,
  };
}

function getCannonRect(cannon: CannonState): Rect {
  return {
    left: cannon.x - cannon.width / 2,
    top: cannon.y - cannon.height / 2,
    right: cannon.x + cannon.width / 2,
    bottom: cannon.y + cannon.height / 2,
  };
}

function getMissileRect(missile: MissileState): Rect {
  const isPlayerMissile = missile.velocityY < 0;
  return {
    left: missile.x - MISSILE_WIDTH / 2,
    right: missile.x + MISSILE_WIDTH / 2,
    top: isPlayerMissile ? missile.y - MISSILE_HEIGHT : missile.y,
    bottom: isPlayerMissile ? missile.y : missile.y + MISSILE_HEIGHT,
  };
}

export function createCollisionSystem(): CollisionSystem {
  return {
    resolve: ({ playerMissiles, alienMissiles, aliens, cannon, shields }) => {
      const activeShields = shields.filter((shield) => shield.durability > 0);
      const remainingAlienIds = new Set(aliens.map((alien) => alien.id));
      const removedPlayerMissiles = new Set<string>();
      const removedAlienMissiles = new Set<string>();
      const shieldImpacts: string[] = [];
      const events: CollisionEvent[] = [];
      let cannonHit = false;

      for (const missile of playerMissiles) {
        const missileRect = getMissileRect(missile);
        const hitShield = activeShields.find((shield) => intersects(missileRect, getShieldRect(shield)));
        if (hitShield) {
          removedPlayerMissiles.add(missile.id);
          shieldImpacts.push(hitShield.id);
          events.push({
            type: 'missile-shield',
            missileId: missile.id,
            targetId: hitShield.id,
          });
          continue;
        }

        const hitAlien = aliens.find(
          (alien) => remainingAlienIds.has(alien.id) && intersects(missileRect, getEntityRect(alien)),
        );
        if (hitAlien) {
          removedPlayerMissiles.add(missile.id);
          remainingAlienIds.delete(hitAlien.id);
          events.push({
            type: 'missile-alien',
            missileId: missile.id,
            targetId: hitAlien.id,
          });
        }
      }

      for (const missile of alienMissiles) {
        const missileRect = getMissileRect(missile);
        const hitShield = activeShields.find((shield) => intersects(missileRect, getShieldRect(shield)));
        if (hitShield) {
          removedAlienMissiles.add(missile.id);
          shieldImpacts.push(hitShield.id);
          events.push({
            type: 'missile-shield',
            missileId: missile.id,
            targetId: hitShield.id,
          });
          continue;
        }

        if (cannon && intersects(missileRect, getCannonRect(cannon))) {
          removedAlienMissiles.add(missile.id);
          cannonHit = true;
          events.push({
            type: 'missile-cannon',
            missileId: missile.id,
            targetId: 'cannon',
          });
        }
      }

      return {
        playerMissiles: playerMissiles.filter((missile) => !removedPlayerMissiles.has(missile.id)),
        alienMissiles: alienMissiles.filter((missile) => !removedAlienMissiles.has(missile.id)),
        aliens: aliens.filter((alien) => remainingAlienIds.has(alien.id)),
        shieldImpacts,
        cannonHit,
        events,
      };
    },
  };
}
