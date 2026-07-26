import { PALETTE } from './palette'
import { LOGICAL_H, LOGICAL_W, type SpritePattern } from './types'

/**
 * Display commands in draw order.
 * Rects stay blocky; tri / diag / para are drawn as true smooth geometry
 * at screen resolution (μPD777 parallelogram / ⊿ look — not stair-step dots).
 */
type DrawCmd =
  | { k: 'clear'; c: number }
  | { k: 'rect'; x: number; y: number; w: number; h: number; c: number }
  | {
      k: 'tri'
      x0: number
      y0: number
      x1: number
      y1: number
      x2: number
      y2: number
      c: number
    }
  | {
      k: 'diag'
      x: number
      y: number
      len: number
      thick: number
      dir: 1 | -1
      c: number
    }
  | {
      k: 'para'
      x: number
      y: number
      w: number
      h: number
      skew: number
      c: number
    }

export class Renderer {
  private screen: HTMLCanvasElement
  private sctx: CanvasRenderingContext2D
  private cmds: DrawCmd[] = []
  spriteCount = 0

  constructor(screen: HTMLCanvasElement) {
    this.screen = screen
    const sctx = screen.getContext('2d')
    if (!sctx) throw new Error('2d context missing')
    this.sctx = sctx
  }

  beginFrame(): void {
    this.spriteCount = 0
    this.cmds = []
    this.clear(0)
  }

  clear(colorIndex: number): void {
    this.cmds.push({ k: 'clear', c: colorIndex & 7 })
  }

  setPixel(x: number, y: number, colorIndex: number): void {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    if (xi < 0 || yi < 0 || xi >= LOGICAL_W || yi >= LOGICAL_H) return
    this.cmds.push({ k: 'rect', x: xi, y: yi, w: 1, h: 1, c: colorIndex & 7 })
  }

  fillRect(x: number, y: number, w: number, h: number, colorIndex: number): void {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const ww = Math.floor(w)
    const hh = Math.floor(h)
    if (ww <= 0 || hh <= 0) return
    this.cmds.push({ k: 'rect', x: x0, y: y0, w: ww, h: hh, c: colorIndex & 7 })
  }

  /**
   * Solid triangle ⊿ — smooth edges at present (not stair-step pixels).
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
    this.cmds.push({
      k: 'tri',
      x0,
      y0,
      x1,
      y1,
      x2,
      y2,
      c: colorIndex & 7,
    })
  }

  /** Isosceles pine canopy tip-up */
  fillPine(cx: number, top: number, halfW: number, height: number, colorIndex: number): void {
    this.fillTriangle(cx, top, cx - halfW, top + height, cx + halfW, top + height, colorIndex)
  }

  /**
   * Thick diagonal stroke — smooth line at present.
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
    this.cmds.push({
      k: 'diag',
      x,
      y,
      len: Math.max(1, length),
      thick: Math.max(1, thickness),
      dir,
      c: colorIndex & 7,
    })
  }

  /** True parallelogram (skewed quad), smooth edges */
  fillParallelogram(
    x: number,
    y: number,
    w: number,
    h: number,
    skew: number,
    colorIndex: number,
  ): void {
    this.cmds.push({
      k: 'para',
      x,
      y,
      w,
      h,
      skew,
      c: colorIndex & 7,
    })
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

  drawBigDigit(n: number, x: number, y: number, colorIndex: number): void {
    const g = BIG_DIGIT[n % 10] ?? BIG_DIGIT[0]!
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row]! & (16 >> col)) this.fillRect(x + col, y + row, 1, 1, colorIndex)
      }
    }
  }

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
    const ctx = this.sctx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.imageSmoothingEnabled = false

    for (const cmd of this.cmds) {
      switch (cmd.k) {
        case 'clear':
          ctx.fillStyle = PALETTE[cmd.c]!
          ctx.fillRect(0, 0, w, h)
          break
        case 'rect':
          ctx.fillStyle = PALETTE[cmd.c]!
          ctx.fillRect(cmd.x * scale, cmd.y * scale, cmd.w * scale, cmd.h * scale)
          break
        case 'tri': {
          // Smooth ⊿ at display resolution (not logical stair-steps)
          ctx.fillStyle = PALETTE[cmd.c]!
          ctx.beginPath()
          ctx.moveTo(cmd.x0 * scale, cmd.y0 * scale)
          ctx.lineTo(cmd.x1 * scale, cmd.y1 * scale)
          ctx.lineTo(cmd.x2 * scale, cmd.y2 * scale)
          ctx.closePath()
          ctx.fill()
          break
        }
        case 'diag': {
          ctx.strokeStyle = PALETTE[cmd.c]!
          ctx.lineWidth = Math.max(1, cmd.thick * scale)
          ctx.lineCap = 'square'
          ctx.lineJoin = 'miter'
          ctx.beginPath()
          const x0 = cmd.x * scale
          const y0 = cmd.y * scale
          const x1 = (cmd.x + cmd.len * cmd.dir) * scale
          const y1 = (cmd.y + cmd.len) * scale
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.stroke()
          break
        }
        case 'para': {
          ctx.fillStyle = PALETTE[cmd.c]!
          const x = cmd.x * scale
          const y = cmd.y * scale
          const ww = cmd.w * scale
          const hh = cmd.h * scale
          const sk = cmd.skew * scale
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + ww, y)
          ctx.lineTo(x + ww + sk, y + hh)
          ctx.lineTo(x + sk, y + hh)
          ctx.closePath()
          ctx.fill()
          break
        }
      }
    }
  }
}

/** 5x7 chunky digits */
const BIG_DIGIT: number[][] = [
  [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  [0b01110, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b01110],
  [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
]

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
