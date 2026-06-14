// Shared TypeScript types for Jungle Op game

export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'victory';

export interface AnimalDef {
  emoji: string;
  maxHp: number;
}

export const ANIMAL_DEFS: AnimalDef[] = [
  { emoji: '\u{1F981}', maxHp: 20 },  // Lion
  { emoji: '\u{1F42D}', maxHp: 5 },   // Mouse
  { emoji: '\u{1F992}', maxHp: 15 },  // Giraffe
  { emoji: '\u{1F418}', maxHp: 25 },  // Elephant
];

export interface Animal {
  def: AnimalDef;
  x: number;          // top-left x position
  y: number;          // top-left y position
  hp: number;
  width: number;      // rendering width (emoji size)
  height: number;     // rendering height (emoji size)
}

export interface FireJet {
  x: number;          // center x
  y: number;          // center y
  radius: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; alpha: number }[];
}

export type BallBehavior = 'regular' | 'barrage' | 'erratic';

export interface SprinklerBall {
  x: number;          // center x
  y: number;          // center y
  radius: number;
  angle: number;      // current rotation angle (radians)
  rotationSpeed: number; // radians per second
  shootInterval: number; // seconds between shots
  shootTimer: number;
  // Behavior cycle state
  behavior: BallBehavior;
  behaviorTimer: number;   // seconds remaining in current behavior phase
  jetsPerSpawn: number;    // how many jets to spawn per tick
  erraticDir: number;      // -1 (left) or +1 (right) for erratic movement
  erraticChangeTimer: number; // time until next erratic direction change
  lastBarrageProgress: number; // last progression % where barrage was triggered (avoid re-trigger)
}

export interface JungleState {
  phase: GamePhase;
  sprinkler: SprinklerBall;
  fireJets: FireJet[];
  currentAnimal: Animal | null;
  animalIndex: number;       // which animal in ANIMAL_DEFS is next
  score: number;
  speedMultiplier: number;
  jungleZoneY: number;       // y-coordinate where jungle zone starts
}
