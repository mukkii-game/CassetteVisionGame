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
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        this.setPixel(x + xx, y + yy, colorIndex)
      }
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
