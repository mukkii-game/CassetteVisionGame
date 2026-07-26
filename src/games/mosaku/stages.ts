export interface StageConfig {
  id: number
  name: string
  night: boolean
  snakeInterval: number
  boarInterval: number
  birdInterval: number
  branchChance: number
  enemySpeed: number
  livesBonus: number
}

/** Spawn intervals ~2x previous (約半分の頻度) */
export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'ASAHI',
    night: false,
    snakeInterval: 9.0,
    boarInterval: 15.0,
    birdInterval: 11.0,
    branchChance: 0.08,
    enemySpeed: 28,
    livesBonus: 0,
  },
  {
    id: 2,
    name: 'MORI',
    night: false,
    snakeInterval: 7.6,
    boarInterval: 13.0,
    birdInterval: 9.6,
    branchChance: 0.1,
    enemySpeed: 32,
    livesBonus: 0,
  },
  {
    id: 3,
    name: 'KAWA',
    night: false,
    snakeInterval: 6.4,
    boarInterval: 11.0,
    birdInterval: 8.4,
    branchChance: 0.12,
    enemySpeed: 36,
    livesBonus: 0,
  },
  {
    id: 4,
    name: 'YUU',
    night: true,
    snakeInterval: 6.0,
    boarInterval: 10.0,
    birdInterval: 7.6,
    branchChance: 0.15,
    enemySpeed: 38,
    livesBonus: 1,
  },
  {
    id: 5,
    name: 'YAMI',
    night: true,
    snakeInterval: 5.2,
    boarInterval: 8.8,
    birdInterval: 6.8,
    branchChance: 0.18,
    enemySpeed: 42,
    livesBonus: 0,
  },
  {
    id: 6,
    name: 'ARASHI',
    night: false,
    snakeInterval: 4.6,
    boarInterval: 7.6,
    birdInterval: 6.0,
    branchChance: 0.2,
    enemySpeed: 46,
    livesBonus: 0,
  },
  {
    id: 7,
    name: 'ONI',
    night: true,
    snakeInterval: 4.0,
    boarInterval: 6.8,
    birdInterval: 5.2,
    branchChance: 0.22,
    enemySpeed: 50,
    livesBonus: 1,
  },
  {
    id: 8,
    name: 'OWARI',
    night: true,
    snakeInterval: 3.4,
    boarInterval: 5.6,
    birdInterval: 4.4,
    branchChance: 0.25,
    enemySpeed: 54,
    livesBonus: 0,
  },
]
