import type { Renderer } from '../../engine/renderer'

/** Screenshot-matched colors */
export const C = {
  sky: 0,
  ground: 4,
  canopy: 6, // orange-yellow stepped foliage
  trunk: 7, // pale
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
  cutLite: 6, // first cuts — orange
  cutDeep: 2, // deeper — red
} as const

/** 5 hits = half trunk from one side */
export const HITS_PER_SIDE = 5
export const TREE_BLINK_TIME = 0.85

/** Compact 7×7-ish Mosaku (CV sprite scale) */
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
    r.fillRect(x + 1, y + 1, 5, 5, C.angel)
    r.fillRect(x, y + 2, 1, 2, C.angel)
    r.fillRect(x + 6, y + 2, 1, 2, C.angel)
    return
  }

  // head 3×2
  r.fillRect(x + 2, y, 3, 2, body)
  // torso
  r.fillRect(x + 1, y + 2, 5, 2, body)

  if (phase === 'jump') {
    r.fillRect(x + 2, y + 4, 1, 2, body)
    r.fillRect(x + 4, y + 4, 1, 2, body)
  } else if (phase === 'walk1') {
    r.fillRect(x + 1, y + 4, 1, 3, body)
    r.fillRect(x + 4, y + 4, 1, 2, body)
  } else if (phase === 'walk0') {
    r.fillRect(x + 2, y + 4, 1, 2, body)
    r.fillRect(x + 5, y + 4, 1, 3, body)
  } else {
    r.fillRect(x + 1, y + 4, 1, 3, body)
    r.fillRect(x + 5, y + 4, 1, 3, body)
  }

  // cyan axe
  if (phase === 'up') {
    const ax = f === 1 ? x : x + 6
    r.fillRect(ax, y - 1, 1, 4, axe)
  } else if (phase === 'down') {
    const ax = f === 1 ? x + 6 : x
    r.fillRect(ax, y + 3, 1, 3, axe)
    r.fillRect(ax + (f === 1 ? 0 : -1), y + 5, 2, 1, axe)
  } else if (phase === 'back') {
    const ax = f === 1 ? x + 6 : x
    r.fillRect(ax, y + 1, 1, 3, axe)
  } else {
    // L-shaped axe in front (screenshot)
    const ax = f === 1 ? x + 6 : x
    r.fillRect(ax, y + 1, 1, 4, axe)
    r.fillRect(ax + (f === 1 ? 0 : -1), y + 4, 2, 1, axe)
  }

  if (phase === 'stun') r.fillRect(x + 3, y - 2, 1, 1, C.hudCyan)
}

export function drawBoar(r: Renderer, x: number, y: number, facingLeft: boolean): void {
  const c = C.boar
  // compact 1-color boar ~8×5
  r.fillRect(x + 1, y + 1, 6, 3, c)
  if (facingLeft) {
    r.fillRect(x, y + 2, 2, 2, c)
  } else {
    r.fillRect(x + 6, y + 2, 2, 2, c)
  }
  r.fillRect(x + 2, y + 4, 1, 1, c)
  r.fillRect(x + 5, y + 4, 1, 1, c)
}

/**
 * Mamushi: jagged magenta stack rising from underground (screenshot sawtooth).
 * emerge 0..1 = how far out of the ground
 */
export function drawSnake(r: Renderer, x: number, y: number, emerge: number): void {
  const c = C.snake
  const h = Math.max(1, Math.floor(emerge * 6))
  // stacked right-pointing teeth (like screenshot)
  for (let i = 0; i < h; i++) {
    const py = y + (6 - h) + i
    const w = 1 + (i % 3 === 0 ? 2 : 1)
    r.fillRect(x, py, w, 1, c)
    if (i % 2 === 0) r.fillRect(x + w, py, 1, 1, c)
    else r.fillRect(x - 1, py, 1, 1, 0) // notch
  }
}

export function drawBird(r: Renderer, x: number, y: number, flap: boolean): void {
  const c = C.bird
  r.fillRect(x + 1, y + 1, 2, 1, c)
  if (flap) {
    r.fillRect(x, y, 1, 1, c)
    r.fillRect(x + 3, y, 1, 1, c)
  } else {
    r.fillRect(x, y + 1, 1, 1, c)
    r.fillRect(x + 3, y + 1, 1, 1, c)
  }
}

/**
 * Stepped canopy (not smooth ⊿) + pale trunk — match CV screenshot density.
 * Cuts: recolor ground-contact dots only (5 hits → half side).
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
  const trunkW = 4
  const trunkLeft = trunkX
  const cx = trunkLeft + Math.floor(trunkW / 2)

  if (fallen && fallT >= TREE_BLINK_TIME) return
  if (fallen && Math.floor(fallT * 12) % 2 !== 0) return

  // Stepped orange canopy (mushroom / trapezoid — stair-step edges)
  // top flat
  r.fillRect(cx - 3, 8, 7, 2, C.canopy)
  r.fillRect(cx - 4, 10, 9, 2, C.canopy)
  r.fillRect(cx - 5, 12, 11, 2, C.canopy)
  r.fillRect(cx - 6, 14, 13, 3, C.canopy)

  // pale trunk down to ground
  const trunkTop = 17
  r.fillRect(trunkLeft, trunkTop, trunkW, groundY - trunkTop, C.trunk)

  // --- Chop zone: ONLY the ground-contact row(s) ---
  const max = HITS_PER_SIDE
  const half = Math.floor(trunkW / 2) // 2 px each side for trunkW=4
  const baseY = groundY - 1 // 地面と接するドット

  // Left half: recolor progressively (pale → orange → red)
  for (let i = 0; i < half; i++) {
    const threshold = Math.ceil(((i + 1) * max) / half)
    if (leftHits >= threshold) {
      const deep = leftHits >= max || leftHits >= threshold + 1
      r.fillRect(trunkLeft + i, baseY, 1, 1, deep ? C.cutDeep : C.cutLite)
      // slight second row just above contact for readability
      if (leftHits >= 2) {
        r.fillRect(trunkLeft + i, baseY - 1, 1, 1, deep ? C.cutDeep : C.cutLite)
      }
    }
  }

  // Right half
  for (let i = 0; i < half; i++) {
    const threshold = Math.ceil(((i + 1) * max) / half)
    if (rightHits >= threshold) {
      const deep = rightHits >= max || rightHits >= threshold + 1
      const px = trunkLeft + trunkW - 1 - i
      r.fillRect(px, baseY, 1, 1, deep ? C.cutDeep : C.cutLite)
      if (rightHits >= 2) {
        r.fillRect(px, baseY - 1, 1, 1, deep ? C.cutDeep : C.cutLite)
      }
    }
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.fillRect(x, y, 1, 1, C.drop)
  r.fillRect(x, y + 1, 1, 1, C.cutDeep)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.fillRect(x, y, 3, 1, C.branch)
  r.fillRect(x + 1, y + 1, 2, 1, C.branch)
}
