import { PALETTE } from './palette'
import { LOGICAL_H, LOGICAL_W, type SpritePattern } from './types'

export class Renderer {
  readonly logical: HTMLCanvasElement
  private lctx: CanvasRenderingContext2D
  private screen: HTMLCanvasElement
  private sctx: CanvasRenderingContext2D
  private pixels: Uint8ClampedArray
  private imageData: ImageData
  spriteCount = 0

  constructor(screen: HTMLCanvasElement) {
    this.screen = screen
    const sctx = screen.getContext('2d')
    if (!sctx) throw new Error('2d context missing')
    this.sctx = sctx
    this.sctx.imageSmoothingEnabled = false

    this.logical = document.createElement('canvas')
    this.logical.width = LOGICAL_W
    this.logical.height = LOGICAL_H
    const lctx = this.logical.getContext('2d', { willReadFrequently: true })
    if (!lctx) throw new Error('logical 2d missing')
    this.lctx = lctx
    this.lctx.imageSmoothingEnabled = false
    this.imageData = this.lctx.createImageData(LOGICAL_W, LOGICAL_H)
    this.pixels = this.imageData.data
  }

  beginFrame(): void {
    this.spriteCount = 0
    this.clear(0)
  }

  clear(colorIndex: number): void {
    const [r, g, b] = hexToRgb(PALETTE[colorIndex & 7]!)
    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] = r
      this.pixels[i + 1] = g
      this.pixels[i + 2] = b
      this.pixels[i + 3] = 255
    }
  }

  setPixel(x: number, y: number, colorIndex: number): void {
    if (x < 0 || y < 0 || x >= LOGICAL_W || y >= LOGICAL_H) return
    const i = (y * LOGICAL_W + x) * 4
    const [r, g, b] = hexToRgb(PALETTE[colorIndex & 7]!)
    this.pixels[i] = r
    this.pixels[i + 1] = g
    this.pixels[i + 2] = b
    this.pixels[i + 3] = 255
  }

  fillRect(x: number, y: number, w: number, h: number, colorIndex: number): void {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const ww = Math.floor(w)
    const hh = Math.floor(h)
    for (let yy = 0; yy < hh; yy++) {
      for (let xx = 0; xx < ww; xx++) {
        this.setPixel(x0 + xx, y0 + yy, colorIndex)
      }
    }
  }

  /**
   * Filled triangle (stepped / aliased). μPD777-style solid wedge used for pine tops etc.
   * Points in any order.
   */
  fillTriangle(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colorIndex: number,
  ): void {
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)))
    const maxY = Math.min(LOGICAL_H - 1, Math.ceil(Math.max(y0, y1, y2)))
    for (let y = minY; y <= maxY; y++) {
      const xs: number[] = []
      edgeX(x0, y0, x1, y1, y, xs)
      edgeX(x1, y1, x2, y2, y, xs)
      edgeX(x2, y2, x0, y0, y, xs)
      if (xs.length < 2) continue
      let lo = Math.min(...xs)
      let hi = Math.max(...xs)
      lo = Math.max(0, Math.floor(lo))
      hi = Math.min(LOGICAL_W - 1, Math.ceil(hi))
      for (let x = lo; x <= hi; x++) this.setPixel(x, y, colorIndex)
    }
  }

  /** Isosceles pine canopy: tip up, base down (solid triangle) */
  fillPine(cx: number, top: number, halfW: number, height: number, colorIndex: number): void {
    this.fillTriangle(cx, top, cx - halfW, top + height, cx + halfW, top + height, colorIndex)
  }

  /**
   * Thick diagonal stroke (CV 「斜めの太い線」).
   * dir: 1 = ＼, -1 = ／
   */
  drawDiagThick(
    x: number,
    y: number,
    length: number,
    thickness: number,
    dir: 1 | -1,
    colorIndex: number,
  ): void {
    const steps = Math.max(1, Math.floor(length))
    for (let i = 0; i < steps; i++) {
      const px = Math.floor(x + i * dir)
      const py = Math.floor(y + i)
      this.fillRect(px, py, thickness, thickness, colorIndex)
    }
  }

  /**
   * Soft parallelogram / skewed rect (μPD777 平行四辺形ドットの近似).
   * Each row shifts by `skew` pixels to the right.
   */
  fillParallelogram(
    x: number,
    y: number,
    w: number,
    h: number,
    skew: number,
    colorIndex: number,
  ): void {
    for (let row = 0; row < h; row++) {
      const shift = Math.floor((skew * row) / Math.max(1, h - 1))
      this.fillRect(x + shift, y + row, w, 1, colorIndex)
    }
  }

  drawSprite(pattern: SpritePattern, x: number, y: number, flipX = false): void {
    this.spriteCount++
    for (let py = 0; py < pattern.h; py++) {
      for (let px = 0; px < pattern.w; px++) {
        const sx = flipX ? pattern.w - 1 - px : px
        const c = pattern.pixels[py * pattern.w + sx]!
        if (c < 0) continue
        this.setPixel(x + px, y + py, c)
      }
    }
  }

  /** Large 7-segment-ish digit for CV HUD */
  drawBigDigit(n: number, x: number, y: number, colorIndex: number): void {
    const g = BIG_DIGIT[n % 10] ?? BIG_DIGIT[0]!
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row]! & (16 >> col)) this.fillRect(x + col, y + row, 1, 1, colorIndex)
      }
    }
  }

  /** Tiny 3x5 digit font for HUD */
  drawText(text: string, x: number, y: number, colorIndex: number): void {
    let cx = x
    for (const ch of text) {
      const g = FONT[ch] ?? FONT['?']!
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          if (g[row]! & (4 >> col)) this.setPixel(cx + col, y + row, colorIndex)
        }
      }
      cx += 4
    }
  }

  present(): void {
    this.lctx.putImageData(this.imageData, 0, 0)
    const scale = Math.max(
      1,
      Math.floor(
        Math.min(
          this.screen.clientWidth / LOGICAL_W,
          this.screen.clientHeight / LOGICAL_H,
        ),
      ),
    )
    const w = LOGICAL_W * scale
    const h = LOGICAL_H * scale
    this.screen.width = w
    this.screen.height = h
    this.sctx.imageSmoothingEnabled = false
    this.sctx.fillStyle = '#111'
    this.sctx.fillRect(0, 0, w, h)
    this.sctx.drawImage(this.logical, 0, 0, w, h)
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function edgeX(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  y: number,
  out: number[],
): void {
  if ((y < y0 && y < y1) || (y > y0 && y > y1)) return
  if (y0 === y1) {
    out.push(x0, x1)
    return
  }
  const t = (y - y0) / (y1 - y0)
  out.push(x0 + t * (x1 - x0))
}

/** 5x7 chunky digits */
const BIG_DIGIT: number[][] = [
  [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110], // 0
  [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110], // 1
  [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111], // 2
  [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110], // 3
  [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010], // 4
  [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110], // 5
  [0b01110, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b01110], // 6
  [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000], // 7
  [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110], // 8
  [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110], // 9
]

/** 3x5 bitmap font (bit2=left) */
const FONT: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0],
  '0': [7, 5, 5, 5, 7],
  '1': [2, 6, 2, 2, 7],
  '2': [7, 1, 7, 4, 7],
  '3': [7, 1, 7, 1, 7],
  '4': [5, 5, 7, 1, 1],
  '5': [7, 4, 7, 1, 7],
  '6': [7, 4, 7, 5, 7],
  '7': [7, 1, 1, 1, 1],
  '8': [7, 5, 7, 5, 7],
  '9': [7, 5, 7, 1, 7],
  A: [7, 5, 7, 5, 5],
  B: [6, 5, 6, 5, 6],
  C: [7, 4, 4, 4, 7],
  D: [6, 5, 5, 5, 6],
  E: [7, 4, 6, 4, 7],
  F: [7, 4, 6, 4, 4],
  G: [7, 4, 5, 5, 7],
  H: [5, 5, 7, 5, 5],
  I: [7, 2, 2, 2, 7],
  J: [1, 1, 1, 5, 7],
  K: [5, 5, 6, 5, 5],
  L: [4, 4, 4, 4, 7],
  M: [5, 7, 7, 5, 5],
  N: [5, 7, 7, 7, 5],
  O: [7, 5, 5, 5, 7],
  P: [7, 5, 7, 4, 4],
  Q: [7, 5, 5, 7, 1],
  R: [7, 5, 6, 5, 5],
  S: [7, 4, 7, 1, 7],
  T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7],
  V: [5, 5, 5, 5, 2],
  W: [5, 5, 7, 7, 5],
  X: [5, 5, 2, 5, 5],
  Y: [5, 5, 7, 2, 2],
  Z: [7, 1, 2, 4, 7],
  '-': [0, 0, 7, 0, 0],
  ':': [0, 2, 0, 2, 0],
  '!': [2, 2, 2, 0, 2],
  '?': [7, 1, 2, 0, 2],
  '.': [0, 0, 0, 0, 2],
  '/': [1, 1, 2, 4, 4],
}
