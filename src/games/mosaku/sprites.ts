import type { SpritePattern } from '../../engine/types'

const T = -1

function pat(w: number, h: number, pixels: number[]): SpritePattern {
  return { w, h, pixels }
}

/** 7x7 lumberjack facing right */
export const MOSAKU: SpritePattern = pat(7, 7, [
  T, T, 6, 6, 6, T, T,
  T, 7, 7, 7, 7, 7, T,
  T, 7, 0, 7, 0, 7, T,
  T, T, 7, 7, 7, T, T,
  2, 2, 2, 2, 2, 2, T,
  T, T, 1, 1, 1, T, T,
  T, 0, 0, T, 0, 0, T,
])

/** axe swing overlay 7x7 */
export const AXE: SpritePattern = pat(7, 7, [
  T, T, T, T, 7, 7, T,
  T, T, T, 7, 7, T, T,
  T, T, 6, 6, T, T, T,
  T, 6, 6, T, T, T, T,
  6, 6, T, T, T, T, T,
  T, T, T, T, T, T, T,
  T, T, T, T, T, T, T,
])

export const SNAKE: SpritePattern = pat(7, 5, [
  T, 4, 4, 4, T, T, T,
  4, 4, 0, 4, 4, 4, T,
  T, 4, 4, 4, 4, T, T,
  T, T, 4, 4, T, T, T,
  T, 4, T, T, 4, T, T,
])

export const BOAR: SpritePattern = pat(8, 6, [
  T, 0, 0, T, T, 0, 0, T,
  6, 6, 6, 6, 6, 6, 6, T,
  6, 0, 6, 6, 6, 0, 6, T,
  6, 6, 6, 6, 6, 6, 6, T,
  T, 6, 6, 6, 6, 6, T, T,
  T, 0, T, T, T, 0, T, T,
])

export const BIRD: SpritePattern = pat(7, 5, [
  T, T, 0, 0, T, T, T,
  T, 7, 7, 7, 7, T, T,
  7, 0, 7, 7, 0, 7, T,
  T, 7, 7, 7, 7, T, T,
  7, T, T, T, T, 7, T,
])

export const DROPPING: SpritePattern = pat(3, 3, [
  T, 7, T,
  7, 7, 7,
  T, 7, T,
])

export const BRANCH: SpritePattern = pat(5, 3, [
  6, 6, 6, 6, T,
  T, 6, 6, 6, 6,
  6, 6, T, T, T,
])

export const ANGEL: SpritePattern = pat(7, 7, [
  T, 7, T, T, T, 7, T,
  7, 7, 7, 7, 7, 7, 7,
  T, 7, 0, 7, 0, 7, T,
  T, T, 7, 7, 7, T, T,
  T, 7, 7, 7, 7, 7, T,
  7, T, T, T, T, T, 7,
  T, T, T, T, T, T, T,
])

export const HEART: SpritePattern = pat(5, 5, [
  T, 2, T, 2, T,
  2, 2, 2, 2, 2,
  2, 2, 2, 2, 2,
  T, 2, 2, 2, T,
  T, T, 2, T, T,
])

export const TORIKO: SpritePattern = pat(7, 7, [
  T, T, 3, 3, 3, T, T,
  T, 7, 7, 7, 7, 7, T,
  T, 7, 3, 7, 3, 7, T,
  T, T, 7, 7, 7, T, T,
  3, 3, 3, 3, 3, 3, T,
  T, T, 1, T, 1, T, T,
  T, 7, T, T, T, 7, T,
])
