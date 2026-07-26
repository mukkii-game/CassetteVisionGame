import type { CVEngine } from '../../engine/engine'
import { LOGICAL_H, LOGICAL_W, type Scene } from '../../engine/types'
import { scriptAfterStage } from './adv'
import { AdvScene } from './advScene'
import { STAGES, type StageConfig } from './stages'
import {
  ANGEL,
  AXE,
  BOAR,
  BRANCH,
  BIRD,
  DROPPING,
  MOSAKU,
  SNAKE,
} from './sprites'
import { TitleScene } from './title'

const GROUND_Y = 52
const PLAYER_W = 7
const PLAYER_H = 7
const HITS_NEEDED = 7
const STUN_TIME = 5
const START_LIVES = 6

type Mode = 'story' | 'timeattack'

interface Tree {
  x: number
  leftHits: number
  rightHits: number
  fallen: boolean
  fallT: number
}

interface Enemy {
  kind: 'snake' | 'boar'
  x: number
  y: number
  vx: number
  alive: boolean
}

interface Hazard {
  kind: 'drop' | 'branch'
  x: number
  y: number
  vy: number
}

export interface GameStartOpts {
  mode: Mode
  stageIndex?: number
  lives?: number
  score?: number
  flags?: Set<string>
  time?: number
}

export class MosakuGame implements Scene {
  private eng: CVEngine
  private mode: Mode
  private stageIndex: number
  private stage!: StageConfig

  private px = 36
  private facing: 1 | -1 = 1
  private vy = 0
  private onGround = true
  private chopping = 0
  private stun = 0
  private invuln = 0

  private trees: Tree[] = []
  private enemies: Enemy[] = []
  private hazards: Hazard[] = []
  private birdX = 20
  private birdDir = 1

  private snakeTimer = 0
  private boarTimer = 0
  private birdTimer = 0

  private lives: number
  private score: number
  private time: number
  private phase: 'play' | 'death' | 'clear' | 'gameover' = 'play'
  private phaseT = 0
  private angelY = 0
  private freezeHorror = 0
  private flags: Set<string>
  private carryLives: number | undefined
  private carryScore: number | undefined
  private carryTime: number | undefined

  constructor(eng: CVEngine, opts: GameStartOpts) {
    this.eng = eng
    this.mode = opts.mode
    this.stageIndex = opts.stageIndex ?? 0
    this.lives = opts.lives ?? START_LIVES
    this.score = opts.score ?? 0
    this.time = opts.time ?? 0
    this.flags = opts.flags ?? new Set<string>()
    this.carryLives = opts.lives
    this.carryScore = opts.score
    this.carryTime = opts.time
  }

  enter(): void {
    this.loadStage(this.stageIndex)
    this.eng.sound.ensure()
  }

  private loadStage(index: number): void {
    this.stageIndex = index
    this.stage = STAGES[Math.min(index, STAGES.length - 1)]!
    this.px = 36
    this.facing = 1
    this.vy = 0
    this.onGround = true
    this.chopping = 0
    this.stun = 0
    this.invuln = 0
    this.enemies = []
    this.hazards = []
    this.birdX = 20
    this.birdDir = 1
    this.snakeTimer = this.stage.snakeInterval * 0.5
    this.boarTimer = this.stage.boarInterval * 0.7
    this.birdTimer = this.stage.birdInterval * 0.4
    this.phase = 'play'
    this.phaseT = 0
    if (this.mode === 'timeattack') {
      this.time = 0
      this.lives = START_LIVES
      this.score = 0
    } else if (this.carryLives !== undefined) {
      this.lives = this.carryLives + this.stage.livesBonus
      this.score = this.carryScore ?? 0
      this.time = this.carryTime ?? 0
    } else {
      this.lives = START_LIVES + this.stage.livesBonus
      this.score = 0
      this.time = 0
      this.flags = new Set()
    }
    this.trees = [
      { x: 14, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
      { x: 54, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
    ]
    if (this.flags.has('horror_look') && this.stage.night) {
      this.freezeHorror = 0.8
    }
  }

  update(dt: number): void {
    const { input, sound } = this.eng

    if (this.phase === 'gameover') {
      this.phaseT += dt
      if (input.justPressed('start') || input.justPressed('axe')) {
        this.eng.setScene(new TitleScene(this.eng))
      }
      return
    }

    if (this.phase === 'death') {
      this.phaseT += dt
      this.angelY -= 18 * dt
      if (this.phaseT > 2.8) {
        if (this.lives <= 0) {
          this.phase = 'gameover'
          this.phaseT = 0
        } else {
          this.phase = 'play'
          this.px = 36
          this.vy = 0
          this.onGround = true
          this.stun = 0
          this.invuln = 1.5
          this.enemies = []
          this.hazards = []
        }
      }
      return
    }

    if (this.phase === 'clear') {
      this.phaseT += dt
      if (this.phaseT > 1.4) this.advanceAfterClear()
      return
    }

    if (this.freezeHorror > 0) {
      this.freezeHorror -= dt
      if (this.freezeHorror <= 0 && this.stage.night) sound.horrorGlitch()
      return
    }

    this.time += dt
    if (this.invuln > 0) this.invuln -= dt
    if (this.stun > 0) this.stun -= dt
    if (this.chopping > 0) this.chopping -= dt

    const canControl = this.stun <= 0

    // Jump
    if (canControl && this.onGround && input.justPressed('jump')) {
      this.vy = -78
      this.onGround = false
      sound.jump()
    }

    // Horizontal
    if (canControl) {
      const spd = 38
      if (input.isDown('left')) {
        this.px -= spd * dt
        this.facing = -1
      }
      if (input.isDown('right')) {
        this.px += spd * dt
        this.facing = 1
      }
    }
    this.px = Math.max(2, Math.min(LOGICAL_W - PLAYER_W - 2, this.px))

    // Gravity
    if (!this.onGround) {
      this.vy += 220 * dt
    }
    const py = this.playerY()
    // use foot position via jump offset
    void py
    this.applyJump(dt)

    // Axe
    if (canControl && this.chopping <= 0 && input.justPressed('axe')) {
      this.chopping = 0.22
      this.tryChop()
      sound.chop()
    }

    this.spawnTimers(dt)
    this.updateEnemies(dt)
    this.updateHazards(dt)
    this.updateBird(dt)
    this.checkCollisions()

    // Tree fall anim
    for (const t of this.trees) {
      if (t.fallen && t.fallT < 1) t.fallT += dt
    }

    if (this.trees.every((t) => t.fallen && t.fallT >= 0.5)) {
      this.phase = 'clear'
      this.phaseT = 0
      sound.clear()
      this.score += 500 + Math.max(0, 200 - Math.floor(this.time) * 2)
    }
  }

  private playerY(): number {
    // base standing y
    return GROUND_Y - PLAYER_H
  }

  private jumpOffset = 0

  private applyJump(dt: number): void {
    if (this.onGround && this.vy === 0) {
      this.jumpOffset = 0
      return
    }
    this.jumpOffset += this.vy * dt
    if (this.jumpOffset >= 0) {
      this.jumpOffset = 0
      this.vy = 0
      this.onGround = true
    } else {
      this.onGround = false
    }
  }

  private tryChop(): void {
    const axeX = this.facing === 1 ? this.px + PLAYER_W : this.px - 3
    for (const tree of this.trees) {
      if (tree.fallen) continue
      const trunk = tree.x + 3
      const dist = Math.abs(axeX - trunk)
      // sweet spot: not too close, not too far
      if (dist < 3 || dist > 11) continue
      const fromLeft = this.px + PLAYER_W / 2 < trunk
      if (fromLeft) {
        if (tree.leftHits < HITS_NEEDED) {
          tree.leftHits++
          this.score += 10
          if (tree.leftHits >= HITS_NEEDED && tree.rightHits >= HITS_NEEDED) {
            tree.fallen = true
            tree.fallT = 0
            this.score += 100
          }
        }
      } else if (tree.rightHits < HITS_NEEDED) {
        tree.rightHits++
        this.score += 10
        if (tree.leftHits >= HITS_NEEDED && tree.rightHits >= HITS_NEEDED) {
          tree.fallen = true
          tree.fallT = 0
          this.score += 100
        }
      }
      // branch chance when chopping
      if (Math.random() < this.stage.branchChance) {
        this.hazards.push({
          kind: 'branch',
          x: trunk - 2,
          y: 8,
          vy: 30 + Math.random() * 20,
        })
      }
      break
    }
  }

  private spawnTimers(dt: number): void {
    this.snakeTimer -= dt
    this.boarTimer -= dt
    this.birdTimer -= dt
    if (this.snakeTimer <= 0) {
      this.snakeTimer = this.stage.snakeInterval * (0.7 + Math.random() * 0.6)
      const fromLeft = Math.random() < 0.5
      this.enemies.push({
        kind: 'snake',
        x: fromLeft ? -8 : LOGICAL_W + 2,
        y: GROUND_Y - 5,
        vx: (fromLeft ? 1 : -1) * this.stage.enemySpeed * 0.7,
        alive: true,
      })
    }
    if (this.boarTimer <= 0) {
      this.boarTimer = this.stage.boarInterval * (0.7 + Math.random() * 0.6)
      const fromLeft = Math.random() < 0.5
      this.enemies.push({
        kind: 'boar',
        x: fromLeft ? -10 : LOGICAL_W + 2,
        y: GROUND_Y - 6,
        vx: (fromLeft ? 1 : -1) * this.stage.enemySpeed,
        alive: true,
      })
    }
    if (this.birdTimer <= 0) {
      this.birdTimer = this.stage.birdInterval * (0.8 + Math.random() * 0.5)
      this.hazards.push({
        kind: 'drop',
        x: this.birdX + 2,
        y: 10,
        vy: 28,
      })
    }
  }

  private updateBird(dt: number): void {
    this.birdX += this.birdDir * 22 * dt
    if (this.birdX < 4) this.birdDir = 1
    if (this.birdX > LOGICAL_W - 12) this.birdDir = -1
  }

  private updateEnemies(dt: number): void {
    const { input, sound } = this.eng
    for (const e of this.enemies) {
      if (!e.alive) continue
      e.x += e.vx * dt
      // axe hit
      if (this.chopping > 0.05) {
        const axeX = this.facing === 1 ? this.px + 5 : this.px - 4
        const ax = axeX
        const ay = this.playerY() + this.jumpOffset + 2
        if (Math.abs(ax - (e.x + 3)) < 6 && Math.abs(ay - e.y) < 8) {
          e.alive = false
          this.score += e.kind === 'boar' ? 50 : 30
          sound.hitEnemy()
        }
      }
      if (e.x < -16 || e.x > LOGICAL_W + 16) e.alive = false
    }
    this.enemies = this.enemies.filter((e) => e.alive)
    void input
  }

  private updateHazards(dt: number): void {
    for (const h of this.hazards) {
      h.y += h.vy * dt
    }
    this.hazards = this.hazards.filter((h) => h.y < LOGICAL_H + 4)
  }

  private checkCollisions(): void {
    if (this.invuln > 0 || this.phase !== 'play') return
    const pr = {
      x: this.px + 1,
      y: this.playerY() + this.jumpOffset + 1,
      w: 5,
      h: 6,
    }

    // jump avoids ground enemies if high enough
    const high = this.jumpOffset < -10

    for (const e of this.enemies) {
      if (!e.alive) continue
      const er = { x: e.x, y: e.y, w: e.kind === 'boar' ? 8 : 7, h: e.kind === 'boar' ? 6 : 5 }
      if (overlap(pr, er)) {
        if (high) continue
        this.miss()
        return
      }
    }

    for (const h of this.hazards) {
      const hr = {
        x: h.x,
        y: h.y,
        w: h.kind === 'drop' ? 3 : 5,
        h: h.kind === 'drop' ? 3 : 3,
      }
      if (overlap(pr, hr)) {
        this.hazards = this.hazards.filter((x) => x !== h)
        this.stun = STUN_TIME
        this.eng.sound.stun()
        return
      }
    }
  }

  private miss(): void {
    this.lives--
    this.phase = 'death'
    this.phaseT = 0
    this.angelY = this.playerY() + this.jumpOffset
    this.eng.sound.funeralMarch()
  }

  private advanceAfterClear(): void {
    if (this.mode === 'timeattack') {
      this.eng.setScene(new TitleScene(this.eng, {
        taResult: this.time,
      }))
      return
    }
    const clearedId = this.stage.id
    const script = scriptAfterStage(clearedId)
    const nextIndex = this.stageIndex + 1
    if (script) {
      this.eng.setScene(
        new AdvScene(this.eng, script, this.flags, () => {
          if (nextIndex >= STAGES.length) {
            this.eng.setScene(new TitleScene(this.eng, { ending: true, flags: this.flags, score: this.score }))
          } else {
            this.eng.setScene(
              new MosakuGame(this.eng, {
                mode: 'story',
                stageIndex: nextIndex,
                lives: this.lives,
                score: this.score,
                flags: this.flags,
                time: this.time,
              }),
            )
          }
        }),
      )
      return
    }
    if (nextIndex >= STAGES.length) {
      this.eng.setScene(new TitleScene(this.eng, { ending: true, flags: this.flags, score: this.score }))
    } else {
      this.eng.setScene(
        new MosakuGame(this.eng, {
          mode: 'story',
          stageIndex: nextIndex,
          lives: this.lives,
          score: this.score,
          flags: this.flags,
          time: this.time,
        }),
      )
    }
  }

  draw(): void {
    const r = this.eng.renderer
    const sky = this.stage.night ? 0 : 1
    const ground = this.stage.night ? 4 : 4
    r.clear(sky)
    // ground
    r.fillRect(0, GROUND_Y, LOGICAL_W, LOGICAL_H - GROUND_Y, ground)
    r.fillRect(0, GROUND_Y, LOGICAL_W, 1, this.stage.night ? 0 : 6)

    // trees
    for (const t of this.trees) {
      this.drawTree(t)
    }

    // bird
    r.drawSprite(BIRD, Math.floor(this.birdX), 4, this.birdDir < 0)

    // hazards
    for (const h of this.hazards) {
      r.drawSprite(h.kind === 'drop' ? DROPPING : BRANCH, Math.floor(h.x), Math.floor(h.y))
    }

    // enemies
    for (const e of this.enemies) {
      if (!e.alive) continue
      const flip = e.vx < 0
      r.drawSprite(e.kind === 'boar' ? BOAR : SNAKE, Math.floor(e.x), Math.floor(e.y), flip)
    }

    // player / angel
    if (this.phase === 'death' || this.phase === 'gameover') {
      r.drawSprite(ANGEL, Math.floor(this.px), Math.floor(this.angelY))
    } else {
      const py = Math.floor(this.playerY() + this.jumpOffset)
      const flash = this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0
      if (!flash) {
        r.drawSprite(MOSAKU, Math.floor(this.px), py, this.facing < 0)
        if (this.chopping > 0) {
          const ax = this.facing === 1 ? this.px + 4 : this.px - 5
          r.drawSprite(AXE, ax, py - 1, this.facing < 0)
        }
      }
      if (this.stun > 0) {
        r.drawText('Z', Math.floor(this.px) + 2, py - 6, 7)
      }
    }

    // HUD
    r.fillRect(0, 0, LOGICAL_W, 7, 0)
    r.drawText(`L${this.lives}`, 1, 1, 7)
    r.drawText(`S${this.score}`, 16, 1, 6)
    r.drawText(`ST${this.stage.id}`, 48, 1, 5)
    if (this.mode === 'timeattack') {
      r.drawText(`${this.time.toFixed(1)}`, 58, 1, 7)
    }

    if (this.phase === 'clear') {
      r.drawText('CLEAR', 26, 28, 7)
    }
    if (this.phase === 'gameover') {
      r.drawText('GAME OVER', 18, 26, 2)
      r.drawText('ENTER', 28, 34, 7)
    }
    if (this.freezeHorror > 0) {
      // frozen frame effect: dark vignette bars
      r.fillRect(0, 20, LOGICAL_W, 1, 0)
      r.fillRect(0, 40, LOGICAL_W, 1, 0)
    }
  }

  private drawTree(t: Tree): void {
    const r = this.eng.renderer
    if (t.fallen) {
      const lean = Math.min(1, t.fallT) * 8
      r.fillRect(t.x, GROUND_Y - 3, 10 + lean, 3, 6)
      return
    }
    // trunk
    r.fillRect(t.x + 3, 18, 3, GROUND_Y - 18, 6)
    // canopy
    r.fillRect(t.x, 10, 9, 10, 4)
    // damage markers left / right
    const lh = t.leftHits
    const rh = t.rightHits
    for (let i = 0; i < HITS_NEEDED; i++) {
      if (i < lh) r.setPixel(t.x + 1, 30 + i * 2, 2)
      if (i < rh) r.setPixel(t.x + 7, 30 + i * 2, 2)
    }
  }
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
