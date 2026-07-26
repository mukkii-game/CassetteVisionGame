import type { CVEngine } from '../../engine/engine'
import { LOGICAL_H, LOGICAL_W, type Scene } from '../../engine/types'
import { C, drawBoar, drawMosaku, drawPineTree } from './cvDraw'
import { MosakuGame } from './game'

export interface TitleExtras {
  taResult?: number
  ending?: boolean
  flags?: Set<string>
  score?: number
}

export class TitleScene implements Scene {
  private eng: CVEngine
  private extras: TitleExtras
  private cursor = 0
  private blink = 0
  private readonly items = ['STORY', 'TIME ATTACK', 'HELP'] as const
  private showHelp = false

  constructor(eng: CVEngine, extras: TitleExtras = {}) {
    this.eng = eng
    this.extras = extras
  }

  enter(): void {
    this.eng.sound.ensure()
  }

  update(dt: number): void {
    this.blink += dt
    const { input } = this.eng

    if (this.extras.ending) {
      if (input.justPressed('start') || input.justPressed('axe')) {
        this.extras = {}
      }
      return
    }

    if (input.justPressed('left') || input.justPressed('select')) {
      this.cursor = (this.cursor + this.items.length - 1) % this.items.length
      this.showHelp = false
    }
    if (input.justPressed('right') || input.justPressed('jump')) {
      this.cursor = (this.cursor + 1) % this.items.length
      this.showHelp = false
    }
    if (input.justPressed('start') || input.justPressed('axe')) {
      const choice = this.items[this.cursor]
      if (choice === 'STORY') {
        this.eng.setScene(new MosakuGame(this.eng, { mode: 'story', stageIndex: 0 }))
      } else if (choice === 'TIME ATTACK') {
        this.eng.setScene(new MosakuGame(this.eng, { mode: 'timeattack', stageIndex: 0 }))
      } else {
        this.showHelp = !this.showHelp
      }
    }
  }

  draw(): void {
    const r = this.eng.renderer
    const groundY = 40
    r.clear(C.sky)
    r.fillRect(0, groundY, LOGICAL_W, LOGICAL_H - groundY, C.ground)
    drawPineTree(r, 18, groundY, 0, 0, false, 0)
    drawPineTree(r, 52, groundY, 0, 0, false, 0)

    if (this.extras.ending) {
      r.drawText('MOSAKU', 24, 4, C.hudCyan)
      r.drawText('CLEAR', 26, 12, C.hudGreen)
      r.drawText(`S${this.extras.score ?? 0}`, 22, 20, C.mosaku)
      drawMosaku(r, 28, 28, 1, 'idle')
      if (this.extras.flags?.has('date')) {
        r.fillRect(40, 30, 5, 5, C.cut)
        r.drawText('DATE', 48, 32, C.boar)
      } else if (this.extras.flags?.has('cursed')) {
        r.drawText('CURSED', 42, 32, C.cut)
      }
      if (Math.floor(this.blink * 2) % 2 === 0) r.drawText('ENTER', 28, 52, C.hudCyan)
      return
    }

    r.drawText('MOSAKU', 24, 2, C.hudCyan)
    drawMosaku(r, 28, 28, 1, Math.floor(this.blink * 4) % 2 === 0 ? 'walk0' : 'walk1')
    drawBoar(r, 48, 33, true)

    if (this.showHelp) {
      r.fillRect(2, 44, 71, 14, 0)
      r.drawText('AD MOVE', 4, 46, C.hudGreen)
      r.drawText('L AXE R JMP', 4, 52, C.hudCyan)
      return
    }

    let y = 46
    this.items.forEach((item, i) => {
      const col = i === this.cursor ? C.mosaku : C.hudGreen
      const mark = i === this.cursor && Math.floor(this.blink * 4) % 2 === 0 ? '>' : ' '
      r.drawText(`${mark}${item}`, 8, y, col)
      y += 5
    })

    if (this.extras.taResult !== undefined) {
      r.drawText(`TA ${this.extras.taResult.toFixed(2)}`, 40, 2, C.mosaku)
    }
  }
}
