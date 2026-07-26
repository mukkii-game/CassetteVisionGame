import type { Button, InputState } from './types'

const empty = (): InputState => ({
  left: false,
  right: false,
  axe: false,
  jump: false,
  start: false,
  select: false,
})

/**
 * PC default:
 * - WASD / arrows: move
 * - Mouse L / F: axe (primary — Zは避ける)
 * - Mouse R / Space: jump
 * N/M は利き手から遠いので補助のみ。
 */
export class Input {
  private keys = empty()
  private mouse = empty()
  private touch = empty()
  private frame = empty()
  private prev = empty()
  private pressed = empty()
  useTouch = false
  private canvas: HTMLElement | null = null

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  bindMouse(target: HTMLElement): void {
    this.canvas = target
    target.addEventListener('mousedown', this.onMouseDown)
    target.addEventListener('mouseup', this.onMouseUp)
    target.addEventListener('mouseleave', this.onMouseLeave)
    target.addEventListener('contextmenu', this.onContext)
    // pointer events for reliability
    target.addEventListener('pointerdown', this.onPointerDown)
    target.addEventListener('pointerup', this.onPointerUp)
    target.addEventListener('pointercancel', this.onPointerUp)
    target.addEventListener('lostpointercapture', this.onPointerUp)
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    const t = this.canvas
    if (t) {
      t.removeEventListener('mousedown', this.onMouseDown)
      t.removeEventListener('mouseup', this.onMouseUp)
      t.removeEventListener('mouseleave', this.onMouseLeave)
      t.removeEventListener('contextmenu', this.onContext)
      t.removeEventListener('pointerdown', this.onPointerDown)
      t.removeEventListener('pointerup', this.onPointerUp)
      t.removeEventListener('pointercancel', this.onPointerUp)
      t.removeEventListener('lostpointercapture', this.onPointerUp)
    }
  }

  beginFrame(): void {
    const pad = this.readGamepad()
    const src = empty()
    for (const k of Object.keys(src) as Button[]) {
      src[k] =
        this.keys[k] ||
        this.mouse[k] ||
        pad[k] ||
        (this.useTouch && this.touch[k])
      this.pressed[k] = src[k] && !this.prev[k]
      this.prev[k] = src[k]
      this.frame[k] = src[k]
    }
  }

  isDown(b: Button): boolean {
    return this.frame[b]
  }

  justPressed(b: Button): boolean {
    return this.pressed[b]
  }

  setTouchButton(b: Button, down: boolean): void {
    this.touch[b] = down
  }

  clearTouch(): void {
    this.touch = empty()
  }

  private setKey(code: string, down: boolean): void {
    const map: Record<string, Button> = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      // primary keyboard axe: F (PCアクション定番)。N は補助。
      KeyF: 'axe',
      KeyN: 'axe',
      KeyJ: 'axe',
      KeyZ: 'axe', // legacy
      Space: 'jump',
      KeyW: 'jump', // WASD の上＝ジャンプ（2D横スクロール定番）
      KeyM: 'jump', // 補助
      KeyX: 'jump',
      KeyK: 'jump',
      Enter: 'start',
      ShiftLeft: 'select',
      ShiftRight: 'select',
      Escape: 'select',
    }
    const btn = map[code]
    if (btn) this.keys[btn] = down
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (
      e.code === 'Space' ||
      e.code.startsWith('Arrow') ||
      e.code === 'KeyW' ||
      e.code === 'KeyA' ||
      e.code === 'KeyS' ||
      e.code === 'KeyD'
    ) {
      e.preventDefault()
    }
    this.setKey(e.code, true)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.setKey(e.code, false)
  }

  private applyMouseButton(button: number, down: boolean): void {
    if (button === 0) this.mouse.axe = down
    if (button === 2) this.mouse.jump = down
    // middle unused
  }

  private onMouseDown = (e: MouseEvent): void => {
    e.preventDefault()
    this.applyMouseButton(e.button, true)
  }

  private onMouseUp = (e: MouseEvent): void => {
    this.applyMouseButton(e.button, false)
  }

  private onMouseLeave = (): void => {
    this.mouse.axe = false
    this.mouse.jump = false
  }

  private onContext = (e: Event): void => {
    e.preventDefault()
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return // touch UI handles separately
    if (e.button === 0 || e.button === 2) {
      e.preventDefault()
      this.applyMouseButton(e.button, true)
      try {
        this.canvas?.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return
    this.applyMouseButton(e.button, false)
    // release both if capture lost
    if (e.type === 'pointercancel' || e.type === 'lostpointercapture') {
      this.mouse.axe = false
      this.mouse.jump = false
    }
  }

  private readGamepad(): InputState {
    const out = empty()
    const pads = navigator.getGamepads?.() ?? []
    for (const pad of pads) {
      if (!pad) continue
      const ax = pad.axes[0] ?? 0
      if (pad.buttons[14]?.pressed || ax < -0.4) out.left = true
      if (pad.buttons[15]?.pressed || ax > 0.4) out.right = true
      if (pad.buttons[0]?.pressed) out.axe = true
      if (pad.buttons[1]?.pressed) out.jump = true
      if (pad.buttons[9]?.pressed) out.start = true
      if (pad.buttons[8]?.pressed) out.select = true
    }
    return out
  }
}
