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
  /** Same green as ground — screenshot confirmed */
  foliage: 4,
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

/** Height of carved gap when a trunk side is fully cut */
const CUT_GAP_H = 4

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

/**
 * Boar — low pink charge silhouette (Pattern 40h/41h homage + screenshot).
 * Body uses para + diag snout (spec §5).
 */
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
  const bob = frame % 2
  // Low trapezoid body (skew toward charge direction)
  const skew = facingLeft ? -3 : 3
  r.fillParallelogram(x + (facingLeft ? 3 : 0), y + 1, 6, 3, skew, c)
  // Thick mid slab
  r.fillRect(x + 1, y + 2, 8, 2, c)
  // Snout / tusk diag at front
  if (facingLeft) {
    r.drawDiagThick(x - 1, y + 1, 3, 2, -1, c)
    r.fillRect(x, y + 2, 2, 2, c)
    r.fillRect(x + 2, y + 4 + bob, 1, 1, c)
    r.fillRect(x + 6, y + 4 + (1 - bob), 1, 1, c)
  } else {
    r.drawDiagThick(x + 8, y + 1, 3, 2, 1, c)
    r.fillRect(x + 8, y + 2, 2, 2, c)
    r.fillRect(x + 2, y + 4 + bob, 1, 1, c)
    r.fillRect(x + 6, y + 4 + (1 - bob), 1, 1, c)
  }
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

/**
 * Tree — green triangle canopy + 2px pale trunk.
 * Mid hits: base dots recolor. Side fully cut: those dots vanish (gap).
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
  const tl = trunkX
  const cx = tl + TRUNK_W / 2
  const max = HITS_PER_SIDE

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  // Green canopy (same as ground)
  r.fillPine(cx, 7, 6, 8, C.foliage)
  r.fillPine(cx, 13, 8, 9, C.foliage)

  const trunkTop = 20
  const baseY = groundY - 1
  const leftCut = leftHits >= max
  const rightCut = rightHits >= max

  // Draw trunk column-by-column so cut sides can erase base dots
  for (let col = 0; col < TRUNK_W; col++) {
    const sideCut = col === 0 ? leftCut : rightCut
    const hits = col === 0 ? leftHits : rightHits
    const bottom = sideCut ? baseY - CUT_GAP_H : baseY
    const h = bottom - trunkTop + 1
    if (h > 0) r.fillRect(tl + col, trunkTop, 1, h, C.trunk)

    // Progressive recolor before the side is fully severed
    if (!sideCut && hits > 0) {
      r.setPixel(tl + col, baseY, hits >= 3 ? C.cutDeep : C.cutLite)
      if (hits >= 2) r.setPixel(tl + col, baseY - 1, hits >= 4 ? C.cutDeep : C.cutLite)
      if (hits >= 4) r.setPixel(tl + col, baseY - 2, C.cutDeep)
    }
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.fillRect(x, y, 1, 1, C.drop)
  r.fillRect(x, y + 1, 1, 1, C.cutDeep)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 4, 2, 1, C.branch)
}
