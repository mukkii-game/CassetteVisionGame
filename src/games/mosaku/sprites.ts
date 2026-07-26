import type { SpritePattern } from '../../engine/types'

const T = -1

function pat(w: number, h: number, pixels: number[]): SpritePattern {
  return { w, h, pixels }
}

/**
 * Mosaku frames — Cassette Vision–like chunky 7–9px lumberjack.
 * Facing RIGHT; flipX for left.
 * Palette: 0 blk, 2 red shirt, 6 orange/skin-hat, 7 white face, 1 pants
 */

/** Idle: axe on shoulder */
export const MOSAKU_IDLE: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, 7, 7,
  T, T, 7, 7, 7, 7, 7, 7, T,
  T, T, 7, 0, 7, 0, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, 1, 1, 1, 1, T, T, T,
  T, 0, 0, T, T, 0, 0, T, T,
  T, T, T, T, T, T, T, T, T,
])

/** Walk A — left leg forward, 1px bob applied in code */
export const MOSAKU_WALK_A: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, 7, 7,
  T, T, 7, 7, 7, 7, 7, 7, T,
  T, T, 7, 0, 7, 0, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, 1, 1, 1, 1, T, T, T,
  0, 0, T, T, T, T, 0, 0, T,
  T, T, T, T, T, T, T, T, T,
])

/** Walk B — right leg forward */
export const MOSAKU_WALK_B: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, 7, T,
  T, T, 7, 7, 7, 7, 7, 7, 7,
  T, T, 7, 0, 7, 0, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, 1, 1, 1, 1, T, T, T,
  T, T, 0, 0, T, 0, 0, T, T,
  T, T, T, T, T, T, T, T, T,
])

/** Chop wind-up: axe raised high behind */
export const MOSAKU_CHOP_UP: SpritePattern = pat(9, 9, [
  7, 7, T, 6, 6, 6, T, T, T,
  T, 7, 7, 7, 7, 7, 7, T, T,
  T, T, 7, 0, 7, 0, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  6, 6, 2, 2, 2, 2, T, T, T,
  T, 6, 1, 1, 1, 1, T, T, T,
  T, 0, 0, T, T, 0, 0, T, T,
  T, T, T, T, T, T, T, T, T,
])

/** Chop swing: axe arcing forward/down */
export const MOSAKU_CHOP_DOWN: SpritePattern = pat(11, 9, [
  T, T, T, 6, 6, 6, T, T, T, T, T,
  T, T, 7, 7, 7, 7, 7, T, T, T, T,
  T, T, 7, 0, 7, 0, 7, T, T, T, T,
  T, T, T, 7, 7, 7, 2, 2, T, T, T,
  T, 2, 2, 2, 2, 2, 2, 6, 6, 7, 7,
  T, T, 2, 2, 2, 2, T, T, 6, 6, T,
  T, T, 1, 1, 1, 1, T, T, T, T, T,
  T, 0, 0, T, T, 0, 0, T, T, T, T,
  T, T, T, T, T, T, T, T, T, T, T,
])

/** Chop recover: axe returning (enemy hit window) */
export const MOSAKU_CHOP_BACK: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, 7, T,
  T, T, 7, 7, 7, 7, 7, 7, 7,
  T, T, 7, 0, 7, 0, 7, 6, 6,
  T, T, T, 7, 7, 7, 6, 6, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, 1, 1, 1, 1, T, T, T,
  T, 0, 0, T, T, 0, 0, T, T,
  T, T, T, T, T, T, T, T, T,
])

/** Jump pose */
export const MOSAKU_JUMP: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, 7, 7,
  T, T, 7, 7, 7, 7, 7, 7, T,
  T, T, 7, 0, 7, 0, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  2, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, T, 1, 1, T, T, T, T,
  T, T, 0, 0, 0, 0, T, T, T,
  T, T, T, T, T, T, T, T, T,
])

/** Stun / paralyzed */
export const MOSAKU_STUN: SpritePattern = pat(9, 9, [
  T, T, T, 6, 6, 6, T, T, T,
  T, T, 7, 7, 7, 7, 7, T, T,
  T, T, 7, 3, 7, 3, 7, T, T,
  T, T, T, 7, 7, 7, T, T, T,
  T, 2, 2, 2, 2, 2, 2, T, T,
  T, T, 2, 2, 2, 2, T, T, T,
  T, T, 1, 1, 1, 1, T, T, T,
  T, 0, 0, T, T, 0, 0, T, T,
  T, T, T, T, T, T, T, T, T,
])

// legacy alias
export const MOSAKU = MOSAKU_IDLE
export const AXE = MOSAKU_CHOP_DOWN

export const SNAKE: SpritePattern = pat(7, 5, [
  T, 4, 4, 4, T, T, T,
  4, 4, 0, 4, 4, 4, T,
  T, 4, 4, 4, 4, T, T,
  T, T, 4, 4, T, T, T,
  T, 4, T, T, 4, T, T,
])

export const SNAKE_DIG: SpritePattern = pat(7, 4, [
  T, T, 4, 4, T, T, T,
  T, 4, 0, 4, 4, T, T,
  6, 6, 4, 4, 6, 6, T,
  T, 6, 6, 6, 6, T, T,
])

export const BOAR: SpritePattern = pat(9, 6, [
  T, 0, T, T, T, T, 0, T, T,
  6, 6, 6, 6, 6, 6, 6, 6, T,
  6, 0, 6, 6, 6, 6, 0, 6, T,
  6, 6, 6, 6, 6, 6, 6, 6, T,
  T, 6, 6, 6, 6, 6, 6, T, T,
  T, 0, T, T, T, T, 0, T, T,
])

export const BIRD: SpritePattern = pat(7, 5, [
  T, T, 0, 0, T, T, T,
  T, 7, 7, 7, 7, T, T,
  7, 0, 7, 7, 0, 7, T,
  T, 7, 7, 7, 7, T, T,
  7, T, T, T, T, 7, T,
])

export const BIRD_FLAP: SpritePattern = pat(7, 5, [
  7, T, 0, 0, T, T, 7,
  T, 7, 7, 7, 7, 7, T,
  T, 7, 0, 7, 0, 7, T,
  T, T, 7, 7, 7, T, T,
  T, T, T, T, T, T, T,
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

export const ANGEL: SpritePattern = pat(9, 8, [
  T, 7, T, T, T, T, T, 7, T,
  7, 7, 7, 7, 7, 7, 7, 7, 7,
  T, 7, 0, 7, 7, 0, 7, T, T,
  T, T, 7, 7, 7, 7, T, T, T,
  T, 7, 7, 7, 7, 7, 7, T, T,
  7, T, T, 7, 7, T, T, 7, T,
  T, T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T, T,
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
