import type { Renderer } from '../../engine/renderer'

export const C = {
  sky: 0,
  ground: 4,
  foliage: 4, // green ⊿ canopy (CV diagonal look)
  canopyAccent: 6, // orange top accent
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
export const TRUNK_W = 4
/** Body footprint used for tip math (keep in sync with drawMosaku) */
export const MOSAKU_W = 7
export const MOSAKU_H = 9

/** Axe tip X in logical pixels — symmetric for L/R facing */
export function axeTipX(px: number, facing: 1 | -1): number {
  // tip sits 2px past the front of the body on both sides
  return facing === 1 ? px + MOSAKU_W + 1 : px - 2
}

export function axeTipY(py: number, phase: string): number {
  if (phase === 'up') return py - 1
  if (phase === 'down') return py + 7 // tip toward ground / tree base
  if (phase === 'back') return py + 2
  // idle = wind-up (振りかぶり)
  return py - 2
}

/**
 * Human-like Mosaku: head / torso / legs + cyan axe.
 * Idle = wind-up; down = tip stretched to hit tree base.
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
    r.fillRect(x + 2, y + 2, 3, 5, C.angel)
    return
  }

  // head
  r.fillRect(x + 2, y, 3, 3, body)
  // neck
  r.fillRect(x + 3, y + 3, 1, 1, body)
  // torso
  r.fillRect(x + 1, y + 4, 5, 2, body)

  // legs
  if (phase === 'jump') {
    r.fillRect(x + 2, y + 6, 1, 2, body)
    r.fillRect(x + 4, y + 6, 1, 2, body)
  } else if (phase === 'walk1') {
    r.fillRect(x + 1, y + 6, 1, 3, body)
    r.fillRect(x + 4, y + 6, 1, 2, body)
  } else if (phase === 'walk0') {
    r.fillRect(x + 2, y + 6, 1, 2, body)
    r.fillRect(x + 5, y + 6, 1, 3, body)
  } else {
    // wide stance
    r.fillRect(x + 1, y + 6, 1, 3, body)
    r.fillRect(x + 5, y + 6, 1, 3, body)
  }

  // --- axe poses ---
  if (phase === 'up' || phase === 'idle' || phase === 'stun' || phase.startsWith('walk')) {
    // 振りかぶり: shaft up behind / over head, tip high
    if (f === 1) {
      r.fillRect(x + 5, y - 3, 1, 5, axe) // shaft
      r.fillRect(x + 4, y - 4, 3, 1, axe) // blade tip up
    } else {
      r.fillRect(x + 1, y - 3, 1, 5, axe)
      r.fillRect(x, y - 4, 3, 1, axe)
    }
  } else if (phase === 'down') {
    // 振り下ろし: tip reaches forward-down to tree base height
    if (f === 1) {
      r.drawDiagThick(x + 5, y + 2, 4, 2, 1, axe)
      r.fillRect(x + MOSAKU_W + 1, y + 6, 2, 2, axe) // tip
    } else {
      r.drawDiagThick(x + 1, y + 2, 4, 2, -1, axe)
      r.fillRect(x - 2, y + 6, 2, 2, axe)
    }
  } else if (phase === 'back') {
    if (f === 1) {
      r.fillRect(x + 6, y + 1, 1, 4, axe)
      r.fillRect(x + 5, y + 1, 2, 1, axe)
    } else {
      r.fillRect(x, y + 1, 1, 4, axe)
      r.fillRect(x, y + 1, 2, 1, axe)
    }
  }

  if (phase === 'stun') r.fillRect(x + 3, y - 5, 1, 1, C.hudCyan)
}

/** Magenta boar — parallelogram + diagonal snout */
export function drawBoar(r: Renderer, x: number, y: number, facingLeft: boolean): void {
  const c = C.boar
  const skew = facingLeft ? -3 : 3
  r.fillParallelogram(x + (facingLeft ? 2 : 0), y + 1, 7, 3, skew, c)
  if (facingLeft) r.drawDiagThick(x, y + 1, 3, 2, -1, c)
  else r.drawDiagThick(x + 8, y + 1, 3, 2, 1, c)
  r.fillRect(x + 2, y + 4, 1, 1, c)
  r.fillRect(x + 5, y + 4, 1, 1, c)
}

/** Mamushi — jagged / diagonal rise from ground */
export function drawSnake(r: Renderer, x: number, y: number, emerge: number): void {
  const c = C.snake
  const h = Math.max(1, Math.floor(emerge * 6))
  for (let i = 0; i < h; i++) {
    const py = y + (6 - h) + i
    r.drawDiagThick(x, py, 2, 2, i % 2 === 0 ? 1 : -1, c)
  }
}

export function drawBird(r: Renderer, x: number, y: number, flap: boolean): void {
  const c = C.bird
  r.fillRect(x + 1, y + 1, 2, 1, c)
  if (flap) {
    r.drawDiagThick(x - 1, y, 2, 1, 1, c)
    r.drawDiagThick(x + 3, y, 2, 1, -1, c)
  } else {
    r.fillRect(x, y + 1, 1, 1, c)
    r.fillRect(x + 3, y + 1, 1, 1, c)
  }
}

/**
 * Green ⊿ canopy (smooth diagonal) + pale trunk.
 * Cuts: recolor ground-contact dots (5 hits = half).
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
  const trunkW = TRUNK_W
  const trunkLeft = trunkX
  const cx = trunkLeft + trunkW / 2

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  // smooth ⊿ foliage (μPD777 slant) — green stacked pines + orange tip
  r.fillPine(cx, 6, 5, 7, C.canopyAccent)
  r.fillPine(cx, 11, 7, 9, C.foliage)
  r.fillPine(cx, 17, 9, 8, C.foliage)

  const trunkTop = 22
  r.fillRect(trunkLeft, trunkTop, trunkW, groundY - trunkTop, C.trunk)

  const max = HITS_PER_SIDE
  const half = Math.floor(trunkW / 2)
  const baseY = groundY - 1

  for (let i = 0; i < half; i++) {
    const threshold = Math.ceil(((i + 1) * max) / half)
    if (leftHits >= threshold) {
      const deep = leftHits >= max
      r.fillRect(trunkLeft + i, baseY, 1, 1, deep ? C.cutDeep : C.cutLite)
      if (leftHits >= 2) r.fillRect(trunkLeft + i, baseY - 1, 1, 1, deep ? C.cutDeep : C.cutLite)
    }
  }
  for (let i = 0; i < half; i++) {
    const threshold = Math.ceil(((i + 1) * max) / half)
    if (rightHits >= threshold) {
      const deep = rightHits >= max
      const px = trunkLeft + trunkW - 1 - i
      r.fillRect(px, baseY, 1, 1, deep ? C.cutDeep : C.cutLite)
      if (rightHits >= 2) r.fillRect(px, baseY - 1, 1, 1, deep ? C.cutDeep : C.cutLite)
    }
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 2, 2, 1, C.drop)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 3, 2, 1, C.branch)
}
