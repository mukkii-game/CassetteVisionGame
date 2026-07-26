import type { CVEngine } from '../../engine/engine'
import { LOGICAL_W, type Scene } from '../../engine/types'
import type { AdvNode, AdvScript } from './adv'
import { HEART, TORIKO } from './sprites'

export class AdvScene implements Scene {
  private eng: CVEngine
  private script: AdvScript
  private flags: Set<string>
  private onDone: () => void
  private node!: AdvNode
  private lineIndex = 0
  private choice = 0
  private blink = 0
  private horrorPulse = 0

  constructor(eng: CVEngine, script: AdvScript, flags: Set<string>, onDone: () => void) {
    this.eng = eng
    this.script = script
    this.flags = flags
    this.onDone = onDone
  }

  enter(): void {
    this.node = this.script.nodes[this.script.start]!
    this.lineIndex = 0
    this.choice = 0
    if (this.node.tone === 'horror') this.eng.sound.horrorGlitch()
  }

  update(dt: number): void {
    this.blink += dt
    if (this.node.tone === 'horror') this.horrorPulse += dt
    const { input } = this.eng
    const choices = this.node.choices

    if (choices && this.lineIndex >= this.node.lines.length - 1) {
      if (input.justPressed('left')) this.choice = Math.max(0, this.choice - 1)
      if (input.justPressed('right')) this.choice = Math.min(choices.length - 1, this.choice + 1)
      if (input.justPressed('axe') || input.justPressed('start')) {
        const c = choices[this.choice]!
        if (c.flag) this.flags.add(c.flag)
        this.goto(c.next)
      }
      return
    }

    if (input.justPressed('axe') || input.justPressed('start') || input.justPressed('jump')) {
      if (this.lineIndex < this.node.lines.length - 1) {
        this.lineIndex++
      } else if (this.node.next) {
        this.goto(this.node.next)
      } else {
        this.onDone()
      }
    }
  }

  private goto(id: string): void {
    const n = this.script.nodes[id]
    if (!n) {
      this.onDone()
      return
    }
    this.node = n
    this.lineIndex = 0
    this.choice = 0
    if (n.flag) this.flags.add(n.flag)
    if (n.tone === 'horror') this.eng.sound.horrorGlitch()
  }

  draw(): void {
    const r = this.eng.renderer
    const bg = this.node.tone === 'horror' ? 0 : this.node.tone === 'romance' ? 3 : 1
    r.clear(bg)

    if (this.node.tone === 'horror' && Math.floor(this.horrorPulse * 8) % 7 === 0) {
      // glitch bars
      r.fillRect(0, 10 + Math.floor(this.horrorPulse * 20) % 40, LOGICAL_W, 2, 2)
    }

    r.drawSprite(TORIKO, 6, 10)
    if (this.node.tone === 'romance') r.drawSprite(HEART, 20, 8)

    r.fillRect(0, 36, LOGICAL_W, 24, 0)
    r.drawText(this.node.speaker.slice(0, 10), 2, 38, 6)
    const line = this.node.lines[this.lineIndex] ?? ''
    r.drawText(line.slice(0, 17), 2, 46, 7)

    const choices = this.node.choices
    if (choices && this.lineIndex >= this.node.lines.length - 1) {
      let x = 2
      choices.forEach((c, i) => {
        const col = i === this.choice ? 6 : 5
        const mark = i === this.choice ? '>' : ' '
        r.drawText(`${mark}${c.label}`, x, 53, col)
        x += 4 + (c.label.length + 1) * 4
      })
    } else if (Math.floor(this.blink * 3) % 2 === 0) {
      r.drawText('Z', 68, 53, 7)
    }
  }
}
