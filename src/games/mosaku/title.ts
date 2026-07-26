import type { CVEngine } from '../../engine/engine'
import { LOGICAL_W, type Scene } from '../../engine/types'
import { MosakuGame } from './game'
import { HEART, MOSAKU_IDLE, TORIKO } from './sprites'

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

  constructor(eng: CVEngine, extras: TitleExtras = {}) {
    this.eng = eng
    this.extras = extras
    if (extras.ending) this.cursor = 0
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

  private showHelp = false

  draw(): void {
    const r = this.eng.renderer
    r.clear(1)
    r.fillRect(0, 48, LOGICAL_W, 12, 4)

    if (this.extras.ending) {
      r.drawText('MOSAKU', 24, 8, 7)
      r.drawText('CLEAR', 26, 16, 6)
      r.drawText(`SCORE ${this.extras.score ?? 0}`, 14, 24, 7)
      if (this.extras.flags?.has('date')) {
        r.drawSprite(TORIKO, 20, 32)
        r.drawSprite(HEART, 34, 34)
        r.drawSprite(MOSAKU_IDLE, 44, 30)
        r.drawText('DATE?', 28, 42, 3)
      } else if (this.extras.flags?.has('cursed')) {
        r.drawText('THE WOOD', 20, 34, 2)
        r.drawText('REMEMBERS', 18, 42, 0)
      } else {
        r.drawText('THE END', 24, 36, 7)
      }
      if (Math.floor(this.blink * 2) % 2 === 0) r.drawText('ENTER', 28, 52, 7)
      return
    }

    r.drawText('MOSAKU', 24, 6, 7)
    r.drawText('CV SOFT', 22, 13, 5)
    r.drawSprite(MOSAKU_IDLE, 16, 20)
    r.drawSprite(TORIKO, 50, 22)

    if (this.showHelp) {
      r.fillRect(2, 32, 71, 26, 0)
      r.drawText('AD MOVE', 4, 34, 7)
      r.drawText('L-CLICK AXE', 4, 40, 7)
      r.drawText('R-CLICK JUMP', 4, 46, 7)
      r.drawText('F/SPACE OK', 4, 52, 5)
      return
    }

    let y = 34
    this.items.forEach((item, i) => {
      const col = i === this.cursor ? 6 : 7
      const mark = i === this.cursor && Math.floor(this.blink * 4) % 2 === 0 ? '>' : ' '
      r.drawText(`${mark}${item}`, 12, y, col)
      y += 6
    })

    if (this.extras.taResult !== undefined) {
      r.drawText(`TA ${this.extras.taResult.toFixed(2)}S`, 8, 1, 6)
    }
  }
}
