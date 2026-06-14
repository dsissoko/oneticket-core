// Shared TypeScript types for Jungle Op game

export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'victory';

export interface AnimalDef {
  emoji: string;
  maxHp: number;
}

export const ANIMAL_DEFS: AnimalDef[] = [
  { emoji: '\u{1F981}', maxHp: 7 },   // Lion
  { emoji: '\u{1F42D}', maxHp: 2 },   // Mouse
  { emoji: '\u{1F992}', maxHp: 5 },   // Giraffe
  { emoji: '\u{1F418}', maxHp: 8 },   // Elephant
];

export interface Animal {
  def: AnimalDef;
  x: number;
  y: number;
  hp: number;
  width: number;
  height: number;
}

export interface FireJet {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; alpha: number }[];
}

export type BallBehavior = 'barrage' | 'erratic';

export interface SprinklerBall {
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotationSpeed: number;
  shootInterval: number;
  shootTimer: number;
  behavior: BallBehavior;
  behaviorTimer: number;
  jetsPerSpawn: number;
  erraticTargetX: number;
  lastBarrageProgress: number;
}

export interface JungleState {
  phase: GamePhase;
  sprinkler: SprinklerBall;
  fireJets: FireJet[];
  currentAnimal: Animal | null;
  animalIndex: number;
  savedCount: number;
  score: number;
  speedMultiplier: number;
  jungleZoneY: number;
}
