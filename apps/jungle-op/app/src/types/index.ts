// Shared TypeScript types for Jungle Op game

export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'victory';

export interface AnimalDef {
  emoji: string;
  maxHp: number;
}

export const ANIMAL_DEFS: AnimalDef[] = [
  { emoji: '\u{1F981}', maxHp: 7 },   // Lion  (20/3 ≈ 7)
  { emoji: '\u{1F42D}', maxHp: 2 },   // Mouse (special: 2 PV)
  { emoji: '\u{1F992}', maxHp: 5 },   // Giraffe (15/3 = 5)
  { emoji: '\u{1F418}', maxHp: 8 },   // Elephant (25/3 ≈ 8)
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
  erraticTargetX: number;  // cible X vers laquelle la boule fonce en mode erratique
  regularTime: number;     // temps accumulé pour le mouvement sinusoïdal en mode regular (conservé, désactivé)
  lastBarrageProgress: number; // last progression % where barrage was triggered (avoid re-trigger)
}

export interface JungleState {
  phase: GamePhase;
  sprinkler: SprinklerBall;
  fireJets: FireJet[];
  currentAnimal: Animal | null;
  animalIndex: number;       // which animal in ANIMAL_DEFS is next
  savedCount: number;        // how many animals successfully crossed
  score: number;
  speedMultiplier: number;
  jungleZoneY: number;       // y-coordinate where jungle zone starts
}
