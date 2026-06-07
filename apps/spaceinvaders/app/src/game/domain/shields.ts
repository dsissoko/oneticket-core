export const SHIELD_COUNT = 4;
export const SHIELD_MAX_DURABILITY = 10;

const SHIELD_ZONE_TOP_RATIO = 0.5;
const SHIELD_ZONE_BOTTOM_RATIO = 0.74;
const SHIELD_WIDTH_RATIO = 0.11;
const SHIELD_HEIGHT_RATIO = 0.05;

export type ShieldDamageStage = 0 | 1 | 2 | 3 | 4;

export type Shield = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  durability: number;
  maxDurability: number;
  damageStage: ShieldDamageStage;
};

type Missile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ShieldCollisionDebug = {
  shieldId: string;
  fromDurability: number;
  toDurability: number;
};

export type MissileShieldCollisionResult<TPlayerMissile extends Missile, TEnemyMissile extends Missile> = {
  playerMissiles: TPlayerMissile[];
  enemyMissiles: TEnemyMissile[];
  shields: Shield[];
  durabilityTransitions: ShieldCollisionDebug[];
};

export function createShields(playfieldWidth: number, playfieldHeight: number): Shield[] {
  const safeWidth = Math.max(1, playfieldWidth);
  const safeHeight = Math.max(1, playfieldHeight);

  const shieldWidth = Math.max(22, safeWidth * SHIELD_WIDTH_RATIO);
  const shieldHeight = Math.max(12, safeHeight * SHIELD_HEIGHT_RATIO);
  const totalShieldsWidth = SHIELD_COUNT * shieldWidth;
  const availableGapWidth = Math.max(0, safeWidth - totalShieldsWidth);
  const gapWidth = availableGapWidth / (SHIELD_COUNT + 1);

  const shieldBandTop = safeHeight * SHIELD_ZONE_TOP_RATIO;
  const shieldBandBottom = safeHeight * SHIELD_ZONE_BOTTOM_RATIO;
  const y = Math.min(
    Math.max(shieldBandTop, shieldBandBottom - shieldHeight),
    safeHeight - shieldHeight,
  );

  const shields: Shield[] = [];
  for (let index = 0; index < SHIELD_COUNT; index += 1) {
    shields.push({
      id: `shield-${index + 1}`,
      x: gapWidth + index * (shieldWidth + gapWidth),
      y,
      width: shieldWidth,
      height: shieldHeight,
      durability: SHIELD_MAX_DURABILITY,
      maxDurability: SHIELD_MAX_DURABILITY,
      damageStage: 0,
    });
  }

  return shields;
}

export function resolveMissileShieldCollisions<
  TPlayerMissile extends Missile,
  TEnemyMissile extends Missile,
>(
  playerMissiles: TPlayerMissile[],
  enemyMissiles: TEnemyMissile[],
  shields: Shield[],
): MissileShieldCollisionResult<TPlayerMissile, TEnemyMissile> {
  const nextShields = shields.map(cloneShield);
  const transitions: ShieldCollisionDebug[] = [];

  const survivingPlayerMissiles = filterMissilesAfterShieldCollisions(
    playerMissiles,
    nextShields,
    transitions,
  );
  const survivingEnemyMissiles = filterMissilesAfterShieldCollisions(
    enemyMissiles,
    nextShields,
    transitions,
  );

  return {
    playerMissiles: survivingPlayerMissiles,
    enemyMissiles: survivingEnemyMissiles,
    shields: nextShields,
    durabilityTransitions: transitions,
  };
}

function filterMissilesAfterShieldCollisions<TMissile extends Missile>(
  missiles: TMissile[],
  shields: Shield[],
  transitions: ShieldCollisionDebug[],
): TMissile[] {
  const survivors: TMissile[] = [];

  for (const missile of missiles) {
    const hitShield = shields.find((shield) => shield.durability > 0 && intersects(missile, shield));
    if (!hitShield) {
      survivors.push(missile);
      continue;
    }

    const fromDurability = hitShield.durability;
    const toDurability = Math.max(0, fromDurability - 1);
    hitShield.durability = toDurability;
    hitShield.damageStage = getShieldDamageStage(hitShield.durability, hitShield.maxDurability);

    transitions.push({
      shieldId: hitShield.id,
      fromDurability,
      toDurability,
    });
  }

  return survivors;
}

function intersects(a: Missile, b: Shield): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function cloneShield(shield: Shield): Shield {
  return {
    ...shield,
  };
}

function getShieldDamageStage(durability: number, maxDurability: number): ShieldDamageStage {
  const safeMax = Math.max(1, maxDurability);
  const clampedDurability = Math.min(safeMax, Math.max(0, durability));
  const damage = safeMax - clampedDurability;

  if (damage <= 0) {
    return 0;
  }

  if (damage >= safeMax) {
    return 4;
  }

  const stage = Math.ceil((damage * 4) / safeMax);
  return Math.min(4, Math.max(1, stage)) as ShieldDamageStage;
}
