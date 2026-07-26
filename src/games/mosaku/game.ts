import type { CVEngine } from '../../engine/engine'
import { LOGICAL_H, LOGICAL_W, type Scene, type SpritePattern } from '../../engine/types'
import { scriptAfterStage } from './adv'
import { AdvScene } from './advScene'
import { STAGES, type StageConfig } from './stages'
import {
  ANGEL,
  BIRD,
  BIRD_FLAP,
  BOAR,
  BRANCH,
  DROPPING,
  MOSAKU_CHOP_BACK,
  MOSAKU_CHOP_DOWN,
  MOSAKU_CHOP_UP,
  MOSAKU_IDLE,
  MOSAKU_JUMP,
  MOSAKU_STUN,
  MOSAKU_WALK_A,
  MOSAKU_WALK_B,
  SNAKE,
  SNAKE_DIG,
} from './sprites'
import { TitleScene } from './title'

const GROUND_Y = 52
const PLAYER_W = 9
const PLAYER_H = 9
const HITS_NEEDED = 7
const STUN_TIME = 5
const START_LIVES = 6

/** Chop phases tuned like Yosaku: lag → swing hit → recover (enemy window) */
const CHOP_UP = 0.12
const CHOP_DOWN = 0.14
const CHOP_BACK = 0.18
const CHOP_TOTAL = CHOP_UP + CHOP_DOWN + CHOP_BACK

type Mode = 'story' | 'timeattack'
type ChopPhase = 'none' | 'up' | 'down' | 'back'

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
  /** snake emerge 0→1 */
  emerge: number
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

  private px = 33
  private facing: 1 | -1 = 1
  private vy = 0
  private onGround = true
  private jumpOffset = 0
  private chopT = 0
  private chopPhase: ChopPhase = 'none'
  private treeHitDone = false
  private stun = 0
  private invuln = 0
  private walkT = 0
  private moving = false

  private trees: Tree[] = []
  private enemies: Enemy[] = []
  private hazards: Hazard[] = []
  private birdX = 20
  private birdDir = 1
  private birdFlap = 0

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
    this.px = 33
    this.facing = 1
    this.vy = 0
    this.onGround = true
    this.jumpOffset = 0
    this.chopT = 0
    this.chopPhase = 'none'
    this.treeHitDone = false
    this.stun = 0
    this.invuln = 0
    this.walkT = 0
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
    // Two tall pines like CV Yosaku layout
    this.trees = [
      { x: 10, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
      { x: 56, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
    ]
    if (this.flags.has('horror_look') && this.stage.night) {
      this.freezeHorror = 0.8
    }
  }

  private getChopPhase(): ChopPhase {
    if (this.chopT <= 0) return 'none'
    const elapsed = CHOP_TOTAL - this.chopT
    if (elapsed < CHOP_UP) return 'up'
    if (elapsed < CHOP_UP + CHOP_DOWN) return 'down'
    return 'back'
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
          this.px = 33
          this.vy = 0
          this.onGround = true
          this.jumpOffset = 0
          this.stun = 0
          this.chopT = 0
          this.chopPhase = 'none'
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
    this.birdFlap += dt
    if (this.invuln > 0) this.invuln -= dt
    if (this.stun > 0) this.stun -= dt

    const canControl = this.stun <= 0 && this.chopPhase === 'none'

    // Jump (small input lag feel: start next frame via normal justPressed)
    if (canControl && this.onGround && input.justPressed('jump')) {
      this.vy = -82
      this.onGround = false
      sound.jump()
    }

    this.moving = false
    if (canControl) {
      const spd = 36
      if (input.isDown('left')) {
        this.px -= spd * dt
        this.facing = -1
        this.moving = true
      }
      if (input.isDown('right')) {
        this.px += spd * dt
        this.facing = 1
        this.moving = true
      }
    }
    if (this.moving) this.walkT += dt
    else this.walkT = 0

    this.px = Math.max(1, Math.min(LOGICAL_W - PLAYER_W - 1, this.px))

    if (!this.onGround) this.vy += 230 * dt
    this.applyJump(dt)

    // Start chop (lag before hit — Yosaku-like)
    if (this.stun <= 0 && this.chopPhase === 'none' && input.justPressed('axe')) {
      this.chopT = CHOP_TOTAL
      this.treeHitDone = false
      sound.chop()
    }

    if (this.chopT > 0) {
      this.chopT -= dt
      this.chopPhase = this.getChopPhase()
      if (this.chopPhase === 'down' && !this.treeHitDone) {
        this.tryChop()
        this.treeHitDone = true
      }
      if (this.chopT <= 0) {
        this.chopT = 0
        this.chopPhase = 'none'
      }
    } else {
      this.chopPhase = 'none'
    }

    this.spawnTimers(dt)
    this.updateEnemies(dt)
    this.updateHazards(dt)
    this.updateBird(dt)
    this.checkCollisions()

    for (const t of this.trees) {
      if (t.fallen && t.fallT < 1) t.fallT += dt * 1.2
    }

    if (this.trees.every((t) => t.fallen && t.fallT >= 0.55)) {
      this.phase = 'clear'
      this.phaseT = 0
      sound.clear()
      this.score += 500 + Math.max(0, 200 - Math.floor(this.time) * 2)
    }
  }

  private playerY(): number {
    return GROUND_Y - PLAYER_H + 1
  }

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
    // Hit box at axe tip during down swing
    const axeX = this.facing === 1 ? this.px + 9 : this.px - 2
    for (const tree of this.trees) {
      if (tree.fallen) continue
      const trunk = tree.x + 3
      const dist = Math.abs(axeX - trunk)
      // sweet spot — too close / too far fails (Yosaku)
      if (dist < 2.5 || dist > 12) continue
      const fromLeft = this.px + PLAYER_W / 2 < trunk
      if (fromLeft) {
        if (tree.leftHits < HITS_NEEDED) {
          tree.leftHits++
          this.score += 10
        }
      } else if (tree.rightHits < HITS_NEEDED) {
        tree.rightHits++
        this.score += 10
      }
      if (tree.leftHits >= HITS_NEEDED && tree.rightHits >= HITS_NEEDED) {
        tree.fallen = true
        tree.fallT = 0
        this.score += 100
      }
      if (Math.random() < this.stage.branchChance) {
        this.hazards.push({
          kind: 'branch',
          x: trunk - 2,
          y: 6,
          vy: 26 + Math.random() * 18,
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
      // Snakes dig up near player path (Yosaku: from ground)
      const side = Math.random() < 0.5 ? -1 : 1
      const x = Math.max(8, Math.min(LOGICAL_W - 12, this.px + side * (14 + Math.random() * 18)))
      this.enemies.push({
        kind: 'snake',
        x,
        y: GROUND_Y - 2,
        vx: (this.px < x ? -1 : 1) * this.stage.enemySpeed * 0.55,
        alive: true,
        emerge: 0,
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
        emerge: 1,
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
    const { sound } = this.eng
    for (const e of this.enemies) {
      if (!e.alive) continue
      if (e.kind === 'snake' && e.emerge < 1) {
        e.emerge = Math.min(1, e.emerge + dt * 2.2)
        e.y = GROUND_Y - 2 - e.emerge * 3
        continue
      }
      e.x += e.vx * dt

      // Enemy hit: down swing + recover (return axe) — Yosaku timing
      const canHitEnemy = this.chopPhase === 'down' || this.chopPhase === 'back'
      if (canHitEnemy) {
        const axeX = this.facing === 1 ? this.px + 8 : this.px - 1
        const ay = this.playerY() + this.jumpOffset + 3
        const ew = e.kind === 'boar' ? 9 : 7
        if (Math.abs(axeX - (e.x + ew / 2)) < 7 && Math.abs(ay - e.y) < 9) {
          e.alive = false
          this.score += e.kind === 'boar' ? 50 : 30
          sound.hitEnemy()
        }
      }
      if (e.x < -18 || e.x > LOGICAL_W + 18) e.alive = false
    }
    this.enemies = this.enemies.filter((e) => e.alive)
  }

  private updateHazards(dt: number): void {
    for (const h of this.hazards) h.y += h.vy * dt
    this.hazards = this.hazards.filter((h) => h.y < LOGICAL_H + 4)
  }

  private checkCollisions(): void {
    if (this.invuln > 0 || this.phase !== 'play') return
    const pr = {
      x: this.px + 2,
      y: this.playerY() + this.jumpOffset + 2,
      w: 5,
      h: 6,
    }
    const high = this.jumpOffset < -12

    for (const e of this.enemies) {
      if (!e.alive) continue
      if (e.kind === 'snake' && e.emerge < 0.85) continue
      const er = {
        x: e.x,
        y: e.y,
        w: e.kind === 'boar' ? 9 : 7,
        h: e.kind === 'boar' ? 6 : 5,
      }
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
        h: 3,
      }
      if (overlap(pr, hr)) {
        this.hazards = this.hazards.filter((x) => x !== h)
        this.stun = STUN_TIME
        this.chopT = 0
        this.chopPhase = 'none'
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
    this.chopT = 0
    this.chopPhase = 'none'
    this.eng.sound.funeralMarch()
  }

  private advanceAfterClear(): void {
    if (this.mode === 'timeattack') {
      this.eng.setScene(new TitleScene(this.eng, { taResult: this.time }))
      return
    }
    const clearedId = this.stage.id
    const script = scriptAfterStage(clearedId)
    const nextIndex = this.stageIndex + 1
    const nextOpts = {
      mode: 'story' as const,
      stageIndex: nextIndex,
      lives: this.lives,
      score: this.score,
      flags: this.flags,
      time: this.time,
    }
    if (script) {
      this.eng.setScene(
        new AdvScene(this.eng, script, this.flags, () => {
          if (nextIndex >= STAGES.length) {
            this.eng.setScene(
              new TitleScene(this.eng, { ending: true, flags: this.flags, score: this.score }),
            )
          } else {
            this.eng.setScene(new MosakuGame(this.eng, nextOpts))
          }
        }),
      )
      return
    }
    if (nextIndex >= STAGES.length) {
      this.eng.setScene(
        new TitleScene(this.eng, { ending: true, flags: this.flags, score: this.score }),
      )
    } else {
      this.eng.setScene(new MosakuGame(this.eng, nextOpts))
    }
  }

  private playerSprite(): SpritePattern {
    if (this.stun > 0) return MOSAKU_STUN
    if (!this.onGround) return MOSAKU_JUMP
    if (this.chopPhase === 'up') return MOSAKU_CHOP_UP
    if (this.chopPhase === 'down') return MOSAKU_CHOP_DOWN
    if (this.chopPhase === 'back') return MOSAKU_CHOP_BACK
    if (this.moving) {
      return Math.floor(this.walkT * 8) % 2 === 0 ? MOSAKU_WALK_A : MOSAKU_WALK_B
    }
    return MOSAKU_IDLE
  }

  draw(): void {
    const r = this.eng.renderer
    const sky = this.stage.night ? 0 : 1
    r.clear(sky)

    // distant hills / ground strip like CV playfield
    r.fillRect(0, 44, LOGICAL_W, 2, this.stage.night ? 0 : 4)
    r.fillRect(0, GROUND_Y, LOGICAL_W, LOGICAL_H - GROUND_Y, 4)
    r.fillRect(0, GROUND_Y, LOGICAL_W, 1, this.stage.night ? 0 : 6)

    for (const t of this.trees) this.drawTree(t)

    const birdSpr = Math.floor(this.birdFlap * 6) % 2 === 0 ? BIRD : BIRD_FLAP
    r.drawSprite(birdSpr, Math.floor(this.birdX), 4, this.birdDir < 0)

    for (const h of this.hazards) {
      r.drawSprite(h.kind === 'drop' ? DROPPING : BRANCH, Math.floor(h.x), Math.floor(h.y))
    }

    for (const e of this.enemies) {
      if (!e.alive) continue
      const flip = e.vx < 0
      if (e.kind === 'snake' && e.emerge < 1) {
        r.drawSprite(SNAKE_DIG, Math.floor(e.x), Math.floor(e.y), flip)
      } else {
        r.drawSprite(e.kind === 'boar' ? BOAR : SNAKE, Math.floor(e.x), Math.floor(e.y), flip)
      }
    }

    if (this.phase === 'death' || this.phase === 'gameover') {
      r.drawSprite(ANGEL, Math.floor(this.px), Math.floor(this.angelY))
    } else {
      const bob = this.moving && this.onGround && this.chopPhase === 'none'
        ? Math.floor(this.walkT * 8) % 2
        : 0
      const py = Math.floor(this.playerY() + this.jumpOffset) - bob
      const flash = this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0
      if (!flash) {
        const spr = this.playerSprite()
        const drawX =
          this.facing < 0 && spr.w > 9
            ? Math.floor(this.px) - (spr.w - 9)
            : Math.floor(this.px)
        r.drawSprite(spr, drawX, py, this.facing < 0)
      }
      if (this.stun > 0) {
        r.drawText('!', Math.floor(this.px) + 3, py - 5, 6)
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

    if (this.phase === 'clear') r.drawText('CLEAR', 26, 28, 7)
    if (this.phase === 'gameover') {
      r.drawText('GAME OVER', 18, 26, 2)
      r.drawText('ENTER', 28, 34, 7)
    }
    if (this.freezeHorror > 0) {
      r.fillRect(0, 20, LOGICAL_W, 1, 0)
      r.fillRect(0, 40, LOGICAL_W, 1, 0)
    }
  }

  /** Trunk notches change color as hits accumulate (Yosaku: 変色) */
  private drawTree(t: Tree): void {
    const r = this.eng.renderer
    if (t.fallen) {
      const lean = Math.floor(Math.min(1, t.fallT) * 14)
      r.fillRect(t.x - 1, GROUND_Y - 4, 12 + lean, 4, 6)
      r.fillRect(t.x + lean, GROUND_Y - 7, 8, 3, 4)
      return
    }

    // canopy
    r.fillRect(t.x - 1, 8, 11, 8, 4)
    r.fillRect(t.x + 1, 5, 7, 5, 4)
    // trunk
    r.fillRect(t.x + 3, 16, 3, GROUND_Y - 16, 6)

    // Left / right cut faces — color shifts white→orange→red with hits
    for (let i = 0; i < HITS_NEEDED; i++) {
      const y = 28 + i * 3
      const leftCol = notchColor(t.leftHits, i)
      const rightCol = notchColor(t.rightHits, i)
      if (t.leftHits > i) {
        r.fillRect(t.x, y, 3, 2, leftCol)
      } else {
        r.setPixel(t.x + 2, y, 6)
      }
      if (t.rightHits > i) {
        r.fillRect(t.x + 6, y, 3, 2, rightCol)
      } else {
        r.setPixel(t.x + 6, y, 6)
      }
    }

    // fully cut side: gap in trunk
    if (t.leftHits >= HITS_NEEDED) {
      r.fillRect(t.x + 2, 34, 2, 8, skyGap(this.stage.night))
    }
    if (t.rightHits >= HITS_NEEDED) {
      r.fillRect(t.x + 5, 34, 2, 8, skyGap(this.stage.night))
    }
  }
}

function notchColor(hits: number, index: number): number {
  if (hits <= index) return 6
  const depth = hits - index
  if (depth >= 3) return 2 // red deep cut
  if (depth >= 2) return 6 // orange
  return 7 // fresh white chip
}

function skyGap(night: boolean): number {
  return night ? 0 : 1
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
