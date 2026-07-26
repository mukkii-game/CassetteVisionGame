export interface StageConfig {
  id: number
  name: string
  night: boolean
  /** hits already at 7/7 — difficulty via spawn */
  snakeInterval: number
  boarInterval: number
  birdInterval: number
  branchChance: number
  enemySpeed: number
  livesBonus: number
}

/** ~8 stages: novice ~30min total, skilled ~10min */
export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'ASAHI',
    night: false,
    snakeInterval: 4.5,
    boarInterval: 7.5,
    birdInterval: 5.5,
    branchChance: 0.15,
    enemySpeed: 28,
    livesBonus: 0,
  },
  {
    id: 2,
    name: 'MORI',
    night: false,
    snakeInterval: 3.8,
    boarInterval: 6.5,
    birdInterval: 4.8,
    branchChance: 0.2,
    enemySpeed: 32,
    livesBonus: 0,
  },
  {
    id: 3,
    name: 'KAWA',
    night: false,
    snakeInterval: 3.2,
    boarInterval: 5.5,
    birdInterval: 4.2,
    branchChance: 0.25,
    enemySpeed: 36,
    livesBonus: 0,
  },
  {
    id: 4,
    name: 'YUU',
    night: true,
    snakeInterval: 3.0,
    boarInterval: 5.0,
    birdInterval: 3.8,
    branchChance: 0.3,
    enemySpeed: 38,
    livesBonus: 1,
  },
  {
    id: 5,
    name: 'YAMI',
    night: true,
    snakeInterval: 2.6,
    boarInterval: 4.4,
    birdInterval: 3.4,
    branchChance: 0.35,
    enemySpeed: 42,
    livesBonus: 0,
  },
  {
    id: 6,
    name: 'ARASHI',
    night: false,
    snakeInterval: 2.3,
    boarInterval: 3.8,
    birdInterval: 3.0,
    branchChance: 0.4,
    enemySpeed: 46,
    livesBonus: 0,
  },
  {
    id: 7,
    name: 'ONI',
    night: true,
    snakeInterval: 2.0,
    boarInterval: 3.4,
    birdInterval: 2.6,
    branchChance: 0.45,
    enemySpeed: 50,
    livesBonus: 1,
  },
  {
    id: 8,
    name: 'OWARI',
    night: true,
    snakeInterval: 1.7,
    boarInterval: 2.8,
    birdInterval: 2.2,
    branchChance: 0.5,
    enemySpeed: 54,
    livesBonus: 0,
  },
]
