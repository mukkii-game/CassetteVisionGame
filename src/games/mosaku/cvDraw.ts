import type { Renderer } from '../../engine/renderer'

/** Colors matching Yosaku screenshot: 1-color bodies */
export const C = {
  sky: 0,
  ground: 4,
  foliage: 4,
  trunk: 7,
  mosaku: 6,
  axe: 5,
  boar: 3,
  snake: 4,
  bird: 5,
  drop: 3,
  branch: 7,
  angel: 7,
  hudCyan: 5,
  hudGreen: 4,
  cut: 2,
} as const

/** Hits to carve halfway through from one side (片側は半分までしか切れない) */
export const HITS_PER_SIDE = 7
/** Blink-out duration after both halves are cut */
export const TREE_BLINK_TIME = 0.85

/**
 * Draw Mosaku as solid orange silhouette + cyan axe stick (CV look).
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
    r.drawDiagThick(x - 2, y + 1, 4, 2, -1, C.angel)
    r.drawDiagThick(x + 6, y + 1, 4, 2, 1, C.angel)
    r.fillRect(x + 2, y + 2, 4, 6, C.angel)
    return
  }

  r.fillRect(x + 2, y, 4, 3, body)
  r.fillRect(x + 1, y + 3, 6, 3, body)

  if (phase === 'jump') {
    r.fillRect(x + 2, y + 6, 2, 2, body)
    r.fillRect(x + 5, y + 6, 2, 2, body)
  } else if (phase === 'walk1') {
    r.fillRect(x + 1, y + 6, 2, 3, body)
    r.fillRect(x + 5, y + 6, 2, 2, body)
  } else if (phase === 'walk0') {
    r.fillRect(x + 2, y + 6, 2, 2, body)
    r.fillRect(x + 5, y + 6, 2, 3, body)
  } else {
    r.fillRect(x + 1, y + 6, 2, 3, body)
    r.fillRect(x + 5, y + 6, 2, 3, body)
  }

  if (phase === 'up') {
    const ax = f === 1 ? x - 1 : x + 7
    r.fillRect(ax, y - 2, 2, 5, axe)
  } else if (phase === 'down') {
    const ax = f === 1 ? x + 7 : x - 2
    r.fillRect(ax, y + 3, 2, 5, axe)
    r.fillRect(ax + (f === 1 ? 0 : -1), y + 7, 3, 2, axe)
  } else if (phase === 'back') {
    const ax = f === 1 ? x + 6 : x - 1
    r.fillRect(ax, y + 1, 2, 4, axe)
  } else {
    const ax = f === 1 ? x + 7 : x - 1
    r.fillRect(ax, y + 1, 2, 6, axe)
  }

  if (phase === 'stun') {
    r.fillRect(x + 3, y - 3, 1, 2, C.hudCyan)
  }
}

export function drawBoar(r: Renderer, x: number, y: number, facingLeft: boolean): void {
  const c = C.boar
  const skew = facingLeft ? -3 : 3
  r.fillParallelogram(x + (facingLeft ? 3 : 0), y + 1, 8, 4, skew, c)
  if (facingLeft) {
    r.drawDiagThick(x + 1, y + 2, 3, 2, -1, c)
  } else {
    r.drawDiagThick(x + 9, y + 2, 3, 2, 1, c)
  }
  r.fillRect(x + 2, y + 5, 2, 2, c)
  r.fillRect(x + 7, y + 5, 2, 2, c)
}

export function drawSnake(r: Renderer, x: number, y: number, emerging: boolean): void {
  const c = C.snake
  if (emerging) {
    r.fillParallelogram(x + 1, y + 2, 5, 3, 2, c)
    r.fillRect(x + 2, y + 4, 4, 1, 7)
    return
  }
  r.drawDiagThick(x, y + 1, 4, 2, 1, c)
  r.fillRect(x + 3, y + 3, 4, 2, c)
  r.drawDiagThick(x + 6, y + 2, 3, 2, -1, c)
}

export function drawBird(r: Renderer, x: number, y: number, flap: boolean): void {
  const c = C.bird
  r.fillRect(x + 2, y + 1, 3, 2, c)
  if (flap) {
    r.drawDiagThick(x - 1, y + 1, 3, 2, 1, c)
    r.drawDiagThick(x + 5, y + 1, 3, 2, -1, c)
  } else {
    r.fillRect(x, y + 2, 2, 1, c)
    r.fillRect(x + 5, y + 2, 2, 1, c)
  }
}

/**
 * Yosaku-style pine:
 * - Carve BASE from left / right; each side only reaches the center (半分まで)
 * - When BOTH sides reach half → blink then vanish
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
  const cx = trunkX + 3
  const trunkW = 6
  const trunkLeft = trunkX + 1
  const canopyBottom = 25
  const chopTop = groundY - 10
  const chopH = groundY - chopTop
  const halfW = trunkW / 2

  // Gone after blink-out
  if (fallen && fallT >= TREE_BLINK_TIME) return

  // Blink: show/hide whole tree while vanishing
  if (fallen) {
    const flash = Math.floor(fallT * 12) % 2 === 0
    if (!flash) return
  }

  // Canopy (two stacked ⊿)
  r.fillPine(cx, 6, 8, 10, C.foliage)
  r.fillPine(cx, 14, 10, 11, C.foliage)

  // Upper trunk
  r.fillRect(trunkLeft, canopyBottom, trunkW, chopTop - canopyBottom, C.trunk)

  // Base trunk
  r.fillRect(trunkLeft, chopTop, trunkW, chopH, C.trunk)

  const max = HITS_PER_SIDE
  // Each side max depth = exactly half the trunk (cannot cut through alone)
  const leftDepth = (Math.min(leftHits, max) / max) * halfW
  const rightDepth = (Math.min(rightHits, max) / max) * halfW

  if (leftHits > 0) {
    const d = Math.max(0.8, leftDepth)
    r.fillTriangle(
      trunkLeft - 0.5,
      chopTop + 1,
      trunkLeft + d,
      chopTop + chopH * 0.45,
      trunkLeft - 0.5,
      chopTop + chopH - 1,
      C.sky,
    )
    r.fillRect(trunkLeft, chopTop + 2, Math.ceil(d), chopH - 4, C.sky)
  }

  if (rightHits > 0) {
    const d = Math.max(0.8, rightDepth)
    const right = trunkLeft + trunkW
    r.fillTriangle(
      right + 0.5,
      chopTop + 1,
      right - d,
      chopTop + chopH * 0.45,
      right + 0.5,
      chopTop + chopH - 1,
      C.sky,
    )
    r.fillRect(right - Math.ceil(d), chopTop + 2, Math.ceil(d), chopH - 4, C.sky)
  }

  // Half from left complete → left half of base gone (center remains until right also done)
  if (leftHits >= max) {
    r.fillRect(trunkLeft, chopTop, Math.floor(halfW), chopH, C.sky)
  }
  // Half from right complete
  if (rightHits >= max) {
    r.fillRect(trunkLeft + Math.ceil(halfW), chopTop, Math.floor(halfW), chopH, C.sky)
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 3, 2, 1, C.drop)
  r.setPixel(x + 2, y + 1, C.bird)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 4, 2, 1, C.branch)
}
