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

/**
 * Draw Mosaku as solid orange silhouette + cyan axe stick (CV look).
 * phase: idle | walk0 | walk1 | up | down | back | jump | stun | angel
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
    // wings via diagonal thick lines + body
    r.drawDiagThick(x - 2, y + 1, 4, 2, -1, C.angel)
    r.drawDiagThick(x + 6, y + 1, 4, 2, 1, C.angel)
    r.fillRect(x + 2, y + 2, 4, 6, C.angel)
    return
  }

  // head
  r.fillRect(x + 2, y, 4, 3, body)
  // torso
  r.fillRect(x + 1, y + 3, 6, 3, body)

  // legs by pose
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
    // idle / stun / chop — wide stance like screenshot
    r.fillRect(x + 1, y + 6, 2, 3, body)
    r.fillRect(x + 5, y + 6, 2, 3, body)
  }

  // axe (cyan) — position by chop phase
  if (phase === 'up') {
    // raised behind head
    const ax = f === 1 ? x - 1 : x + 7
    r.fillRect(ax, y - 2, 2, 5, axe)
  } else if (phase === 'down') {
    // swung forward low
    const ax = f === 1 ? x + 7 : x - 2
    r.fillRect(ax, y + 3, 2, 5, axe)
    r.fillRect(ax + (f === 1 ? 0 : -1), y + 7, 3, 2, axe)
  } else if (phase === 'back') {
    const ax = f === 1 ? x + 6 : x - 1
    r.fillRect(ax, y + 1, 2, 4, axe)
  } else {
    // vertical stick at side (screenshot idle)
    const ax = f === 1 ? x + 7 : x - 1
    r.fillRect(ax, y + 1, 2, 6, axe)
  }

  if (phase === 'stun') {
    r.fillRect(x + 3, y - 3, 1, 2, C.hudCyan)
  }
}

/** Magenta boar with diagonal / trapezoid body (CV slanted dots) */
export function drawBoar(r: Renderer, x: number, y: number, facingLeft: boolean): void {
  const c = C.boar
  // body as parallelogram (skewed)
  const skew = facingLeft ? -3 : 3
  r.fillParallelogram(x + (facingLeft ? 3 : 0), y + 1, 8, 4, skew, c)
  // snout diagonal
  if (facingLeft) {
    r.drawDiagThick(x + 1, y + 2, 3, 2, -1, c)
  } else {
    r.drawDiagThick(x + 9, y + 2, 3, 2, 1, c)
  }
  // legs
  r.fillRect(x + 2, y + 5, 2, 2, c)
  r.fillRect(x + 7, y + 5, 2, 2, c)
}

/** Green snake — thick diagonal segments */
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

/** Cyan bird — simple V / block with diagonal wings */
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

/** Yosaku pine: two stacked green triangles + grey trunk */
export function drawPineTree(
  r: Renderer,
  trunkX: number,
  groundY: number,
  leftHits: number,
  rightHits: number,
  fallen: boolean,
  fallT: number,
): void {
  const cx = trunkX + 2
  if (fallen) {
    const lean = Math.floor(Math.min(1, fallT) * 16)
    r.fillRect(trunkX - 2 + lean, groundY - 3, 14, 3, C.trunk)
    r.fillPine(cx + lean, groundY - 10, 7, 7, C.foliage)
    return
  }

  // two stacked solid triangles (screenshot)
  r.fillPine(cx, 6, 8, 10, C.foliage)
  r.fillPine(cx, 14, 10, 11, C.foliage)
  // trunk
  r.fillRect(trunkX + 1, 24, 3, groundY - 24, C.trunk)

  // cut notches (discolor) on sides
  for (let i = 0; i < 7; i++) {
    const y = 30 + i * 2
    if (leftHits > i) r.fillRect(trunkX - 1, y, 2, 2, i < leftHits - 2 ? C.cut : C.mosaku)
    if (rightHits > i) r.fillRect(trunkX + 4, y, 2, 2, i < rightHits - 2 ? C.cut : C.mosaku)
  }
  if (leftHits >= 7) r.fillRect(trunkX + 1, 36, 1, 8, C.sky)
  if (rightHits >= 7) r.fillRect(trunkX + 3, 36, 1, 8, C.sky)
}

export function drawDrop(r: Renderer, x: number, y: number): void {
  // small diagonal chip (screenshot projectile-ish)
  r.drawDiagThick(x, y, 3, 2, 1, C.drop)
  r.setPixel(x + 2, y + 1, C.bird)
}

export function drawBranch(r: Renderer, x: number, y: number): void {
  r.drawDiagThick(x, y, 4, 2, 1, C.branch)
}
