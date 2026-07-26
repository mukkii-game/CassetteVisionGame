import type { Renderer } from '../../engine/renderer'
import type { SpritePattern } from '../../engine/types'
import {
  P_ANGEL,
  P_BIRD_A,
  P_BIRD_B,
  P_BOAR_A,
  P_BOAR_B,
  P_BRANCH,
  P_CANOPY,
  P_DROP,
  P_SNAKE,
  P_TRUNK,
  P_YOSAKU_IDLE,
  P_YOSAKU_JUMP,
  P_YOSAKU_SWING_DN,
  P_YOSAKU_SWING_UP,
  P_YOSAKU_WALK_A,
  P_YOSAKU_WALK_B,
} from './patterns'

export const C = {
  sky: 0,
  ground: 4,
  foliage: 6, // orange-gold canopy like CV Yosaku
  trunk: 7,
  mosaku: 6,
  axe: 5,
  boar: 3,
  snake: 3,
  bird: 5,
  drop: 6,
  branch: 7,
  angel: 7,
  hudCyan: 5,
  hudGreen: 4,
  cutLite: 6,
  cutDeep: 2,
} as const

export const HITS_PER_SIDE = 5
export const TREE_BLINK_TIME = 0.85
export const TRUNK_W = 2
export const MOSAKU_W = 8
export const MOSAKU_H = 8

/** Axe tip — matches swing_dn silhouette tip (ROM homage) */
export function axeTipX(px: number, facing: 1 | -1): number {
  return facing === 1 ? px + 7 : px
}

export function axeTipY(py: number, phase: string): number {
  if (phase === 'up') return py
  if (phase === 'down') return py + 7
  return py + 4
}

function drawTinted(
  r: Renderer,
  pat: SpritePattern,
  x: number,
  y: number,
  color: number,
  flipX = false,
  axeMask: boolean[] | null = null,
): void {
  for (let py = 0; py < pat.h; py++) {
    for (let px = 0; px < pat.w; px++) {
      const sx = flipX ? pat.w - 1 - px : px
      const v = pat.pixels[py * pat.w + sx]!
      if (v < 0) continue
      const isAxe = axeMask ? axeMask[py * pat.w + sx]! : false
      r.setPixel(x + px, y + py, isAxe ? C.axe : color)
    }
  }
}

/** Mask: which pixels of swing patterns are the cyan axe */
function axeMaskUp(): boolean[] {
  // tip high behind (top-left of unflipped right-facing)
  const m = Array(64).fill(false)
  const marks = [
    [0, 0],
    [1, 1],
    [2, 2],
  ]
  for (const [x, y] of marks) m[y * 8 + x] = true
  return m
}

function axeMaskDown(): boolean[] {
  const m = Array(64).fill(false)
  const marks = [
    [6, 3],
    [6, 4],
    [7, 5],
    [5, 6],
    [4, 7],
  ]
  for (const [x, y] of marks) m[y * 8 + x] = true
  return m
}

function axeMaskIdle(): boolean[] {
  // vertical cyan L in front — drawn as overlay instead
  return Array(64).fill(false)
}

/**
 * Mosaku — μPD777 Yosaku Pattern ROM homage silhouettes + cyan axe.
 * Idle: upright axe in front. Swing: wind-up high → tip to trunk base.
 */
export function drawMosaku(
  r: Renderer,
  x: number,
  y: number,
  facing: 1 | -1,
  phase: string,
): void {
  const flip = facing < 0

  if (phase === 'angel') {
    drawTinted(r, P_ANGEL, x, y, C.angel, flip)
    return
  }

  if (phase === 'jump') {
    drawTinted(r, P_YOSAKU_JUMP, x, y, C.mosaku, flip)
    // small cyan axe held
    const ax = flip ? x : x + 6
    r.fillRect(ax, y + 2, 1, 3, C.axe)
    return
  }

  if (phase === 'up') {
    drawTinted(r, P_YOSAKU_SWING_UP, x, y, C.mosaku, flip, axeMaskUp())
    return
  }

  if (phase === 'down') {
    drawTinted(r, P_YOSAKU_SWING_DN, x, y, C.mosaku, flip, axeMaskDown())
    return
  }

  if (phase === 'back') {
    drawTinted(r, P_YOSAKU_SWING_UP, x, y, C.mosaku, flip, axeMaskUp())
    return
  }

  if (phase === 'walk0') {
    drawTinted(r, P_YOSAKU_WALK_A, x, y, C.mosaku, flip, axeMaskIdle())
  } else if (phase === 'walk1') {
    drawTinted(r, P_YOSAKU_WALK_B, x, y, C.mosaku, flip, axeMaskIdle())
  } else {
    drawTinted(r, P_YOSAKU_IDLE, x, y, C.mosaku, flip, axeMaskIdle())
  }

  // Idle / walk: cyan vertical axe in front (screenshot L-shape)
  if (flip) {
    r.fillRect(x, y + 1, 1, 4, C.axe)
    r.fillRect(x, y + 4, 2, 1, C.axe)
  } else {
    r.fillRect(x + 6, y + 1, 1, 4, C.axe)
    r.fillRect(x + 5, y + 4, 2, 1, C.axe)
  }

  if (phase === 'stun') r.fillRect(x + 3, y - 2, 1, 1, C.hudCyan)
}

export function drawBoar(r: Renderer, x: number, y: number, facingLeft: boolean, frame = 0): void {
  drawTinted(r, frame % 2 === 0 ? P_BOAR_A : P_BOAR_B, x, y, C.boar, facingLeft)
}

/** Mamushi — rises from underground using ROM-like jagged segment */
export function drawSnake(r: Renderer, x: number, y: number, emerge: number): void {
  const h = Math.max(1, Math.floor(emerge * 8))
  // stack clipped from bottom of snake pattern
  for (let row = 8 - h; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const v = P_SNAKE.pixels[row * 8 + col]!
      if (v < 0) continue
      r.setPixel(x + col, y + (row - (8 - h)), C.snake)
    }
  }
}

export function drawBird(r: Renderer, x: number, y: number, flap: boolean): void {
  drawTinted(r, flap ? P_BIRD_A : P_BIRD_B, x, y, C.bird, false)
}

/**
 * Tree: ROM canopy triangle + 2px trunk; ground-contact color cuts.
 */
export function drawPineTree(
  r: Renderer,
  trunkX: number,
  groundY: number,
  leftHits: number,
  rightHits: number,
  fallen: boolean,
  fallT: number,
): void {
  const trunkLeft = trunkX
  const cx = trunkLeft

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  // canopy stacked (inverted triangle silhouette from ROM 1Eh)
  drawTinted(r, P_CANOPY, cx - 3, 8, C.foliage, false)
  drawTinted(r, P_CANOPY, cx - 2, 12, C.foliage, false)

  // trunk tiles from canopy to ground (2px wide like ROM)
  for (let ty = 16; ty < groundY; ty += 8) {
    const h = Math.min(8, groundY - ty)
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < 2; col++) {
        r.setPixel(trunkLeft + col, ty + row, C.trunk)
      }
    }
  }

  // ground-contact cut colors (5 hits = half)
  const max = HITS_PER_SIDE
  const baseY = groundY - 1
  // left column of 2px trunk
  if (leftHits > 0) {
    const deep = leftHits >= max
    r.setPixel(trunkLeft, baseY, deep ? C.cutDeep : C.cutLite)
    if (leftHits >= 3) r.setPixel(trunkLeft, baseY - 1, deep ? C.cutDeep : C.cutLite)
  }
  // right column
  if (rightHits > 0) {
    const deep = rightHits >= max
    r.setPixel(trunkLeft + 1, baseY, deep ? C.cutDeep : C.cutLite)
    if (rightHits >= 3) r.setPixel(trunkLeft + 1, baseY - 1, deep ? C.cutDeep : C.cutLite)
  }

  // progressive notches up a couple rows (ROM cut trunk frames)
  if (leftHits >= 2) r.setPixel(trunkLeft, baseY - 2, C.cutLite)
  if (leftHits >= 4) r.setPixel(trunkLeft, baseY - 3, C.cutDeep)
  if (rightHits >= 2) r.setPixel(trunkLeft + 1, baseY - 2, C.cutLite)
  if (rightHits >= 4) r.setPixel(trunkLeft + 1, baseY - 3, C.cutDeep)

  void P_TRUNK
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  drawTinted(r, P_DROP, x - 2, y - 1, C.drop, false)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  drawTinted(r, P_BRANCH, x, y, C.branch, false)
}
