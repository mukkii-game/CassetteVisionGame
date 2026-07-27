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
  /** Yellow canopy — user screenshots (labeled sheet) */
  foliage: 6,
  trunk: 7,
  mosaku: 6,
  axe: 5,
  boar: 3,
  snake: 3,
  bird: 5,
  drop: 6,
  branch: 7,
  /** Death spirit: mint/cyan body + yellow halo */
  angel: 5,
  angelHalo: 6,
  hudCyan: 5,
  hudGreen: 4,
  cutLite: 6,
  cutDeep: 2,
} as const

/** Height of carved gap when a trunk side is fully cut */
const CUT_GAP_H = 4

export const HITS_PER_SIDE = 5
export const TREE_BLINK_TIME = 0.85
export const TRUNK_W = 3
export const MOSAKU_W = 7
export const MOSAKU_H = 10
export const BOAR_W = 10
export const BOAR_H = 5

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
 * Death = green/cyan cross + yellow halo (user screenshot), not winged angel.
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
    // Yellow ring (わっか) on the head — clear 2-row halo, not just a thin bar
    r.fillRect(x + 1, y, 6, 1, C.angelHalo)
    r.setPixel(x, y + 1, C.angelHalo)
    r.setPixel(x + 7, y + 1, C.angelHalo)
    r.fillRect(x + 1, y + 2, 6, 1, C.angelHalo)
    // Blue ghost body (cross) — head sits under the ring
    r.fillRect(x + 3, y + 3, 2, 6, C.angel)
    r.fillRect(x, y + 5, 8, 1, C.angel)
    r.fillRect(x, y + 6, 1, 2, C.angel)
    r.fillRect(x + 7, y + 6, 1, 2, C.angel)
    r.fillRect(x + 2, y + 8, 4, 1, C.angel)
    return
  }

  // head 2×2 — sprite bottom is y+9 so feet meet ground (playerY = groundY - 10)
  r.fillRect(x + 2, y, 2, 2, body)
  r.fillRect(x + 2, y + 2, 2, 1, body)
  r.fillRect(x + 2, y + 3, 2, 2, body)

  if (phase === 'jump') {
    r.fillRect(x + 1, y + 5, 2, 3, body)
    r.fillRect(x + 4, y + 5, 2, 3, body)
  } else if (phase === 'walk0') {
    r.fillRect(x + 1, y + 5, 1, 5, body)
    r.fillRect(x + 1, y + 9, 2, 1, body)
    r.fillRect(x + 4, y + 5, 1, 4, body)
    r.fillRect(x + 4, y + 9, 1, 1, body)
  } else if (phase === 'walk1') {
    r.fillRect(x + 2, y + 5, 1, 4, body)
    r.fillRect(x + 2, y + 9, 1, 1, body)
    r.fillRect(x + 4, y + 5, 1, 5, body)
    r.fillRect(x + 3, y + 9, 2, 1, body)
  } else {
    // idle / chop / stun — both feet on ground row (local y+9)
    r.fillRect(x + 1, y + 5, 1, 5, body)
    r.fillRect(x + 4, y + 5, 1, 5, body)
  }

  // --- axe ---
  if (phase === 'up') {
    if (f === 1) {
      r.fillRect(x - 1, y - 2, 2, 2, axe)
      r.drawDiagThick(x - 1, y - 1, 4, 1, 1, axe)
    } else {
      r.fillRect(x + 6, y - 2, 2, 2, axe)
      r.drawDiagThick(x + 7, y - 1, 4, 1, -1, axe)
    }
  } else if (phase === 'down') {
    if (f === 1) {
      r.drawDiagThick(x + 3, y + 3, 5, 1, 1, axe)
      r.fillRect(x + MOSAKU_W + 1, y + 7, 2, 2, axe)
    } else {
      r.drawDiagThick(x + 2, y + 3, 5, 1, -1, axe)
      r.fillRect(x - 2, y + 7, 2, 2, axe)
    }
  } else if (phase === 'back') {
    if (f === 1) {
      r.fillRect(x + MOSAKU_W, y + 2, 2, 2, axe)
      r.drawDiagThick(x + 4, y + 2, 3, 1, 1, axe)
    } else {
      r.fillRect(x - 1, y + 2, 2, 2, axe)
      r.drawDiagThick(x + 1, y + 2, 3, 1, -1, axe)
    }
  } else {
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
 * Boar — low pink charge block (user screenshots).
 * Body: para + stepped snout; short stub legs (2-frame bob).
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

  // Core low body — forward-leaning parallelogram
  const skew = facingLeft ? -2 : 2
  r.fillParallelogram(x + (facingLeft ? 2 : 1), y + 1, 7, 2, skew, c)
  // Solid mid slab (blocky look from screenshots)
  r.fillRect(x + 1, y + 1, 8, 2, c)

  if (facingLeft) {
    // Pointed snout on left (charge direction)
    r.fillRect(x, y + 1, 2, 2, c)
    r.setPixel(x - 1, y + 2, c)
    r.drawDiagThick(x - 1, y + 1, 2, 1, -1, c)
    // Short legs (4 stubs / 2 pairs) with run bob
    r.fillRect(x + 1, y + 3 + bob, 1, 1, c)
    r.fillRect(x + 3, y + 3 + (1 - bob), 1, 1, c)
    r.fillRect(x + 6, y + 3 + bob, 1, 1, c)
    r.fillRect(x + 8, y + 3 + (1 - bob), 1, 1, c)
  } else {
    r.fillRect(x + 8, y + 1, 2, 2, c)
    r.setPixel(x + 10, y + 2, c)
    r.drawDiagThick(x + 9, y + 1, 2, 1, 1, c)
    r.fillRect(x + 1, y + 3 + bob, 1, 1, c)
    r.fillRect(x + 3, y + 3 + (1 - bob), 1, 1, c)
    r.fillRect(x + 6, y + 3 + bob, 1, 1, c)
    r.fillRect(x + 8, y + 3 + (1 - bob), 1, 1, c)
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
 * Tree — stepped yellow canopy + pale trunk.
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
  const cx = Math.floor(tl + TRUNK_W / 2)
  const max = HITS_PER_SIDE

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  // Stepped yellow canopy (screenshot tiers) + triangle fill for slant
  r.fillPine(cx, 6, 3, 5, C.foliage)
  r.fillPine(cx, 10, 5, 6, C.foliage)
  r.fillPine(cx, 15, 7, 6, C.foliage)

  const trunkTop = 20
  const baseY = groundY - 1
  const leftCut = leftHits >= max
  const rightCut = rightHits >= max

  for (let col = 0; col < TRUNK_W; col++) {
    // Outer columns cut with left/right; middle follows whichever side is deeper
    let sideCut = false
    let hits = 0
    if (col === 0) {
      sideCut = leftCut
      hits = leftHits
    } else if (col === TRUNK_W - 1) {
      sideCut = rightCut
      hits = rightHits
    } else {
      // center column vanishes only when both sides cut (tree falling)
      sideCut = leftCut && rightCut
      hits = Math.min(leftHits, rightHits)
    }
    const bottom = sideCut ? baseY - CUT_GAP_H : baseY
    const h = bottom - trunkTop + 1
    if (h > 0) r.fillRect(tl + col, trunkTop, 1, h, C.trunk)

    if (!sideCut && hits > 0 && (col === 0 || col === TRUNK_W - 1)) {
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
