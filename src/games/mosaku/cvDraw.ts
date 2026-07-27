/**
 * Drawing per docs/YOSAKU_ART_SPEC.md
 * Diagonals / triangles / parallelograms are REQUIRED where marked.
 *
 * Note: drawDiagThick always draws downward (y+). Start point = higher end of shaft.
 */
import type { Renderer } from '../../engine/renderer'

export const C = {
  sky: 0,
  ground: 4,
  foliage: 6,
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
export const MOSAKU_W = 7
export const MOSAKU_H = 10

/** Tip X — idle front L; wind-up behind; strike stump; recover front mid (boar) */
export function axeTipX(px: number, facing: 1 | -1, phase: string): number {
  if (phase === 'up') return facing === 1 ? px - 1 : px + MOSAKU_W
  if (phase === 'down') return facing === 1 ? px + MOSAKU_W + 1 : px - 2
  if (phase === 'back') return facing === 1 ? px + MOSAKU_W : px - 1
  return facing === 1 ? px + MOSAKU_W : px - 1
}

export function axeTipY(py: number, phase: string): number {
  if (phase === 'up') return py - 2
  if (phase === 'down') return py + 8
  if (phase === 'back') return py + 3
  return py + 5
}

/**
 * Mosaku — 2×2 head, thin torso, open legs; cyan axe.
 * Wind-up / strike / recover USE diag for shaft (spec §3.2).
 */
export function drawMosaku(
  r: Renderer,
  x: number,
  y: number,
  facing: 1 | -1,
  phase: string,
): void {
  const f = facing
  const body = C.mosaku
  const axe = C.axe

  if (phase === 'angel') {
    r.drawDiagThick(x - 1, y + 1, 3, 2, -1, C.angel)
    r.drawDiagThick(x + 5, y + 1, 3, 2, 1, C.angel)
    r.fillRect(x + 2, y + 2, 3, 2, C.angel)
    r.fillRect(x + 3, y + 4, 1, 3, C.angel)
    return
  }

  // head 2×2
  r.fillRect(x + 2, y, 2, 2, body)
  r.fillRect(x + 2, y + 2, 2, 1, body)
  r.fillRect(x + 2, y + 3, 2, 2, body)

  if (phase === 'jump') {
    r.fillRect(x + 1, y + 5, 2, 2, body)
    r.fillRect(x + 4, y + 5, 2, 2, body)
  } else if (phase === 'walk0') {
    r.fillRect(x + 1, y + 5, 1, 3, body)
    r.fillRect(x + 1, y + 7, 2, 1, body)
    r.fillRect(x + 4, y + 5, 1, 2, body)
  } else if (phase === 'walk1') {
    r.fillRect(x + 2, y + 5, 1, 2, body)
    r.fillRect(x + 4, y + 5, 1, 3, body)
    r.fillRect(x + 3, y + 7, 2, 1, body)
  } else {
    r.fillRect(x + 1, y + 5, 1, 4, body)
    r.fillRect(x + 4, y + 5, 1, 4, body)
  }

  // --- axe ---
  if (phase === 'up') {
    // 13h: tip high behind head; shaft diag down toward hands
    if (f === 1) {
      r.fillRect(x - 1, y - 2, 2, 2, axe)
      r.drawDiagThick(x - 1, y - 1, 4, 1, 1, axe) // ＼ toward body
    } else {
      r.fillRect(x + 6, y - 2, 2, 2, axe)
      r.drawDiagThick(x + 7, y - 1, 4, 1, -1, axe) // ／ toward body
    }
  } else if (phase === 'down') {
    // 14h: tip at stump; shaft from mid torso down-forward
    if (f === 1) {
      r.drawDiagThick(x + 3, y + 3, 5, 1, 1, axe)
      r.fillRect(x + MOSAKU_W + 1, y + 7, 2, 2, axe)
    } else {
      r.drawDiagThick(x + 2, y + 3, 5, 1, -1, axe)
      r.fillRect(x - 2, y + 7, 2, 2, axe)
    }
  } else if (phase === 'back') {
    // recover: tip mid-front (boar window), shaft rising diag
    if (f === 1) {
      r.fillRect(x + MOSAKU_W, y + 2, 2, 2, axe)
      r.drawDiagThick(x + 4, y + 2, 3, 1, 1, axe)
    } else {
      r.fillRect(x - 1, y + 2, 2, 2, axe)
      r.drawDiagThick(x + 1, y + 2, 3, 1, -1, axe)
    }
  } else {
    // idle / walk / stun / jump: vertical L in front
    if (f === 1) {
      r.fillRect(x + 5, y + 1, 1, 5, axe)
      r.fillRect(x + 5, y + 5, 2, 1, axe)
    } else {
      r.fillRect(x + 1, y + 1, 1, 5, axe)
      r.fillRect(x, y + 5, 2, 1, axe)
    }
  }

  if (phase === 'stun') r.fillRect(x + 2, y - 2, 1, 1, C.hudCyan)
}

/** Boar — para body + diag snout (spec §5) */
export function drawBoar(
  r: Renderer,
  x: number,
  y: number,
  facingLeft: boolean,
  frame = 0,
  dying = false,
): void {
  if (dying && Math.floor(frame) % 2 === 0) return
  const c = C.boar
  const skew = facingLeft ? -2 : 2
  r.fillParallelogram(x + (facingLeft ? 2 : 0), y + 1, 7, 3, skew, c)
  if (facingLeft) r.drawDiagThick(x, y + 1, 3, 2, -1, c)
  else r.drawDiagThick(x + 8, y + 1, 3, 2, 1, c)
  const bob = frame % 2
  r.fillRect(x + 2, y + 4 + bob, 1, 1, c)
  r.fillRect(x + 6, y + 4 + (1 - bob), 1, 1, c)
}

/** Mamushi — jagged diag stack rising from ground (spec §6) */
export function drawSnake(r: Renderer, x: number, yGround: number, emerge: number): void {
  const c = C.snake
  const h = Math.max(1, Math.floor(emerge * 7))
  for (let i = 0; i < h; i++) {
    const py = yGround - 1 - i
    if (i % 2 === 0) r.drawDiagThick(x, py, 2, 2, 1, c)
    else r.drawDiagThick(x + 1, py, 2, 2, -1, c)
  }
}

export function drawBird(r: Renderer, x: number, y: number, flap: boolean): void {
  const c = C.bird
  r.fillRect(x + 1, y + 1, 3, 1, c)
  if (flap) {
    r.drawDiagThick(x - 1, y, 2, 1, 1, c)
    r.drawDiagThick(x + 4, y, 2, 1, -1, c)
  } else {
    r.fillRect(x, y + 1, 1, 1, c)
    r.fillRect(x + 4, y + 1, 1, 1, c)
  }
}

/** Tree — triangle canopy + 2px trunk + ground-contact color cuts */
export function drawPineTree(
  r: Renderer,
  trunkX: number,
  groundY: number,
  leftHits: number,
  rightHits: number,
  fallen: boolean,
  fallT: number,
): void {
  const tl = trunkX
  const cx = tl + TRUNK_W / 2

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  r.fillPine(cx, 7, 6, 8, C.foliage)
  r.fillPine(cx, 13, 8, 9, C.foliage)
  r.fillRect(tl, 20, TRUNK_W, groundY - 20, C.trunk)

  const baseY = groundY - 1
  const max = HITS_PER_SIDE
  if (leftHits > 0) {
    const deep = leftHits >= max
    r.setPixel(tl, baseY, deep ? C.cutDeep : C.cutLite)
    if (leftHits >= 2) r.setPixel(tl, baseY - 1, deep ? C.cutDeep : C.cutLite)
    if (leftHits >= 4) r.setPixel(tl, baseY - 2, C.cutDeep)
  }
  if (rightHits > 0) {
    const deep = rightHits >= max
    r.setPixel(tl + 1, baseY, deep ? C.cutDeep : C.cutLite)
    if (rightHits >= 2) r.setPixel(tl + 1, baseY - 1, deep ? C.cutDeep : C.cutLite)
    if (rightHits >= 4) r.setPixel(tl + 1, baseY - 2, C.cutDeep)
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.fillRect(x, y, 1, 1, C.drop)
  r.fillRect(x, y + 1, 1, 1, C.cutDeep)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 4, 2, 1, C.branch)
}
