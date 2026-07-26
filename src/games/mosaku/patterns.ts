/** Homage silhouettes tuned to μPD777-005 Yosaku Pattern ROM sheet. */
import type { SpritePattern } from '../../engine/types'

const T = -1
function p(pixels: number[], w = 8, h = 8): SpritePattern { return { w, h, pixels } }

export const P_YOSAKU_IDLE = p([
  T, T, 1, 1, T, T, T, T,
  T, T, 1, 1, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, 1, T, 1, T, 1, T, T,
  T, 1, T, T, T, 1, T, T,
  1, 1, T, T, T, 1, 1, T,
  1, 1, T, T, T, 1, 1, T,
])

export const P_YOSAKU_WALK_A = p([
  T, T, 1, 1, T, T, T, T,
  T, T, 1, 1, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, 1, T, 1, T, 1, T, T,
  1, 1, T, T, T, 1, T, T,
  1, T, T, T, T, 1, 1, T,
  T, T, T, T, T, 1, 1, T,
])

export const P_YOSAKU_WALK_B = p([
  T, T, 1, 1, T, T, T, T,
  T, T, 1, 1, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, 1, T, 1, T, 1, T, T,
  T, 1, T, T, T, 1, 1, T,
  1, 1, T, T, T, T, 1, T,
  1, 1, T, T, T, T, T, T,
])

export const P_YOSAKU_SWING_UP = p([
  1, T, T, T, T, T, T, T,
  T, 1, T, T, 1, 1, T, T,
  T, T, 1, T, 1, 1, T, T,
  T, T, T, 1, 1, T, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, 1, T, 1, T, 1, T, T,
  1, 1, T, T, T, 1, 1, T,
  1, 1, T, T, T, 1, 1, T,
])

export const P_YOSAKU_SWING_DN = p([
  T, T, 1, 1, T, T, T, T,
  T, T, 1, 1, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, 1, 1, 1, T, 1, T,
  T, 1, T, 1, T, T, 1, T,
  T, 1, T, T, T, 1, T, 1,
  1, 1, T, T, 1, T, T, T,
  1, 1, T, 1, T, T, T, T,
])

export const P_YOSAKU_JUMP = p([
  T, T, 1, 1, T, T, T, T,
  T, T, 1, 1, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, 1, 1, 1, 1, 1, T, T,
  T, 1, T, 1, T, 1, T, T,
  T, T, 1, T, 1, T, T, T,
  T, 1, T, T, T, 1, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_ANGEL = p([
  1, T, T, T, T, T, 1, T,
  T, 1, T, T, T, 1, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, 1, 1, 1, 1, 1, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, T, 1, T, 1, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_TRUNK = p([
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
])

export const P_CANOPY = p([
  1, 1, 1, 1, 1, 1, 1, 1,
  T, 1, 1, 1, 1, 1, 1, T,
  T, T, 1, 1, 1, 1, T, T,
  T, T, T, 1, 1, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_BOAR_A = p([
  T, T, T, T, T, T, T, T,
  T, 1, 1, 1, 1, T, T, T,
  1, 1, 1, 1, 1, 1, T, T,
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, T, T, T, T, 1, 1,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_BOAR_B = p([
  T, T, T, T, T, T, T, T,
  T, T, 1, 1, 1, 1, T, T,
  T, 1, 1, 1, 1, 1, 1, T,
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, T, T, T, T, T, 1,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_SNAKE = p([
  T, T, T, T, T, T, T, T,
  T, 1, 1, T, T, T, T, T,
  1, 1, 1, 1, T, T, T, T,
  T, 1, 1, T, 1, T, T, T,
  T, T, T, 1, 1, 1, T, T,
  T, T, T, T, 1, 1, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_BIRD_A = p([
  1, 1, 1, 1, 1, 1, 1, 1,
  T, T, T, T, T, T, T, T,
  T, T, 1, T, T, 1, T, T,
  T, 1, T, 1, 1, T, 1, T,
  1, T, T, 1, 1, T, T, 1,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_BIRD_B = p([
  T, 1, 1, 1, 1, 1, 1, T,
  T, T, T, T, T, T, T, T,
  T, 1, T, T, T, T, 1, T,
  1, T, 1, 1, T, 1, 1, T,
  T, T, 1, T, T, 1, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_DROP = p([
  T, T, T, T, T, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, 1, 1, 1, T, T, T,
  T, T, T, 1, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])

export const P_BRANCH = p([
  T, T, T, T, T, T, T, T,
  1, 1, 1, 1, 1, T, T, T,
  T, T, 1, 1, 1, T, 1, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T,
])
