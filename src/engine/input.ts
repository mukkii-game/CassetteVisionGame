import type { Button, InputState } from './types'

const empty = (): InputState => ({
  left: false,
  right: false,
  axe: false,
  jump: false,
  start: false,
  select: false,
})

export class Input {
  private keys = empty()
  private touch = empty()
  private frame = empty()
  private prev = empty()
  private pressed = empty()
  useTouch = false

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  beginFrame(): void {
    const pad = this.readGamepad()
    const src = empty()
    for (const k of Object.keys(src) as Button[]) {
      src[k] = this.keys[k] || pad[k] || (this.useTouch && this.touch[k])
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
      KeyZ: 'axe',
      KeyJ: 'axe',
      KeyX: 'jump',
      KeyK: 'jump',
      Space: 'jump',
      Enter: 'start',
      ShiftLeft: 'select',
      ShiftRight: 'select',
    }
    const btn = map[code]
    if (btn) this.keys[btn] = down
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault()
    this.setKey(e.code, true)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.setKey(e.code, false)
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
