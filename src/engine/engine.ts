import { Input } from './input'
import { Renderer } from './renderer'
import { Sound } from './sound'
import type { Scene } from './types'

export class CVEngine {
  readonly renderer: Renderer
  readonly input: Input
  readonly sound: Sound
  private scene: Scene | null = null
  private last = 0
  private raf = 0
  private running = false

  constructor(screen: HTMLCanvasElement) {
    this.renderer = new Renderer(screen)
    this.input = new Input()
    this.sound = new Sound()
  }

  setScene(scene: Scene): void {
    this.scene?.exit?.()
    this.scene = scene
    this.scene.enter?.()
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const loop = (now: number) => {
      if (!this.running) return
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.input.beginFrame()
      this.scene?.update(dt)
      this.renderer.beginFrame()
      this.scene?.draw()
      this.renderer.present()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
  }
}
