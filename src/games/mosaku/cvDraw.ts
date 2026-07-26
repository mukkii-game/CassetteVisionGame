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

export const HITS_TO_FELL_SIDE = 7

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
 * - Chop the BASE from left / right (actually carve wood away — no red/orange tally marks)
 * - Several hits deepen that side's cut until the side is severed
 * - Both sides severed → tree tips over then vanishes
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
  const trunkW = 5
  const trunkLeft = trunkX + 1
  const canopyBottom = 25
  const chopTop = groundY - 10
  const chopH = groundY - chopTop

  // Gone after fall animation
  if (fallen && fallT >= 0.55) return

  if (fallen) {
    // Brief tip-over then disappear
    const lean = Math.floor(Math.min(1, fallT / 0.55) * 18)
    const dir = leftHits >= rightHits ? 1 : -1
    r.fillPine(cx + lean * dir, groundY - 12, 8, 9, C.foliage)
    r.fillRect(trunkLeft + lean * dir, groundY - 4, 10, 3, C.trunk)
    return
  }

  // Canopy (two stacked ⊿)
  r.fillPine(cx, 6, 8, 10, C.foliage)
  r.fillPine(cx, 14, 10, 11, C.foliage)

  // Upper trunk (uncut)
  r.fillRect(trunkLeft, canopyBottom, trunkW, chopTop - canopyBottom, C.trunk)

  // Base trunk — carve from sides with smooth wedges (sky punches)
  r.fillRect(trunkLeft, chopTop, trunkW, chopH, C.trunk)

  const max = HITS_TO_FELL_SIDE
  // Depth into trunk from each side (0 .. trunkW/2+, full side when hits max)
  const leftDepth = (Math.min(leftHits, max) / max) * (trunkW * 0.55 + 0.5)
  const rightDepth = (Math.min(rightHits, max) / max) * (trunkW * 0.55 + 0.5)

  // Left axe bites: triangular notch eating into base from the left
  if (leftHits > 0) {
    const d = Math.max(1.2, leftDepth)
    // upper bite + lower bite → V cut from left
    r.fillTriangle(
      trunkLeft - 0.5,
      chopTop + 1,
      trunkLeft + d,
      chopTop + chopH * 0.45,
      trunkLeft - 0.5,
      chopTop + chopH - 1,
      C.sky,
    )
    // deepen: also clear a rect band so wood is truly gone
    r.fillRect(trunkLeft, chopTop + 2, Math.ceil(d), chopH - 4, C.sky)
  }

  // Right axe bites
  if (rightHits > 0) {
    const d = Math.max(1.2, rightDepth)
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

  // Side fully severed: clear that half of the base completely
  if (leftHits >= max) {
    r.fillRect(trunkLeft, chopTop, Math.ceil(trunkW / 2), chopH, C.sky)
  }
  if (rightHits >= max) {
    r.fillRect(trunkLeft + Math.floor(trunkW / 2), chopTop, Math.ceil(trunkW / 2), chopH, C.sky)
  }
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 3, 2, 1, C.drop)
  r.setPixel(x + 2, y + 1, C.bird)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 4, 2, 1, C.branch)
}
