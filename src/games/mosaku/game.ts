import type { CVEngine } from '../../engine/engine'
import { LOGICAL_H, LOGICAL_W, type Scene } from '../../engine/types'
import { scriptAfterStage } from './adv'
import { AdvScene } from './advScene'
import {
  axeTipX,
  axeTipY,
  BOAR_H,
  BOAR_W,
  C,
  drawBird,
  drawBoar,
  drawBranch,
  drawDrop,
  drawMosaku,
  drawPineTree,
  drawSnake,
  HITS_PER_SIDE,
  MOSAKU_H,
  MOSAKU_W,
  TREE_BLINK_TIME,
  TRUNK_W,
} from './cvDraw'
import { STAGES, type StageConfig } from './stages'
import { TitleScene } from './title'

/** Ground band like CV screenshot (~bottom fifth of 75×60) */
const GROUND_Y = 48
const PLAYER_W = MOSAKU_W
const PLAYER_H = MOSAKU_H
const STUN_TIME = 5
const START_LIVES = 6
/** tip-to-face distance — 1dot looser than before */
const CHOP_MAX_DIST = 4.5
const CHOP_MIN_DIST = 0

/** Yosaku: lag (wind-up diag) → tip strike at stump → recover (boar window) */
const CHOP_UP = 0.22
const CHOP_DOWN = 0.14
const CHOP_BACK = 0.24
const CHOP_TOTAL = CHOP_UP + CHOP_DOWN + CHOP_BACK
const BOAR_DIE_TIME = 0.45

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
  /** blink-out after axe hit; >0 while dying */
  dieT: number
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
    this.snakeTimer = this.stage.snakeInterval * 0.9
    this.boarTimer = this.stage.boarInterval * 1.0
    this.birdTimer = this.stage.birdInterval * 0.85
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
    // Two trees — CV proportions
    this.trees = [
      { x: 20, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
      { x: 54, leftHits: 0, rightHits: 0, fallen: false, fallT: 0 },
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
      if (t.fallen && t.fallT < TREE_BLINK_TIME) t.fallT += dt
    }

    // Both trees blinked out → stage clear
    if (this.trees.every((t) => t.fallen && t.fallT >= TREE_BLINK_TIME)) {
      this.phase = 'clear'
      this.phaseT = 0
      sound.clear()
      this.score += 500 + Math.max(0, 200 - Math.floor(this.time) * 2)
    }
  }

  private playerY(): number {
    return GROUND_Y - PLAYER_H
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
    // Tip at stump during down phase (matches drawMosaku)
    const tipX = axeTipX(this.px, this.facing, 'down')
    const tipY = axeTipY(this.playerY() + this.jumpOffset, 'down')
    const { sound } = this.eng
    for (const tree of this.trees) {
      if (tree.fallen) continue
      const trunkLeft = tree.x
      const trunkRight = tree.x + TRUNK_W - 1
      const trunkMid = trunkLeft + TRUNK_W / 2
      // stand left → hit left face; stand right → hit right face
      const fromLeft = this.px + PLAYER_W / 2 < trunkMid
      const faceX = fromLeft ? trunkLeft : trunkRight
      const dist = Math.abs(tipX - faceX)
      if (dist < CHOP_MIN_DIST || dist > CHOP_MAX_DIST) continue
      // tip near ground contact
      if (tipY < GROUND_Y - 5 || tipY > GROUND_Y + 2) continue
      // must face the tree
      if (fromLeft && this.facing !== 1) continue
      if (!fromLeft && this.facing !== -1) continue

      let carved = false
      if (fromLeft) {
        if (tree.leftHits < HITS_PER_SIDE) {
          tree.leftHits++
          this.score += 10
          carved = true
        }
      } else if (tree.rightHits < HITS_PER_SIDE) {
        tree.rightHits++
        this.score += 10
        carved = true
      }

      if (carved) sound.chopHit()

      if (
        tree.leftHits >= HITS_PER_SIDE &&
        tree.rightHits >= HITS_PER_SIDE &&
        !tree.fallen
      ) {
        tree.fallen = true
        tree.fallT = 0
        this.score += 100
        sound.treeGone()
      }

      if (carved && Math.random() < this.stage.branchChance) {
        this.hazards.push({
          kind: 'branch',
          x: trunkMid - 1,
          y: 8,
          vy: 22 + Math.random() * 14,
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
      // マムシ: 地面の下から這い出てくる（与作仕様）
      const side = Math.random() < 0.5 ? -1 : 1
      const x = Math.max(10, Math.min(LOGICAL_W - 10, this.px + side * (10 + Math.random() * 16)))
      this.enemies.push({
        kind: 'snake',
        x,
        y: GROUND_Y - 6,
        vx: (this.px < x ? -1 : 1) * this.stage.enemySpeed * 0.45,
        alive: true,
        emerge: 0,
        dieT: 0,
      })
    }
    if (this.boarTimer <= 0) {
      this.boarTimer = this.stage.boarInterval * (0.7 + Math.random() * 0.6)
      const fromLeft = Math.random() < 0.5
      // Enter from screen edge (端っこ): snout just at the rim, then charge in
      this.enemies.push({
        kind: 'boar',
        x: fromLeft ? 1 - BOAR_W : LOGICAL_W - 1,
        y: GROUND_Y - BOAR_H,
        vx: (fromLeft ? 1 : -1) * this.stage.enemySpeed,
        alive: true,
        emerge: 1,
        dieT: 0,
      })
      this.eng.sound.boarCharge()
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

      // Blink-out after axe kill
      if (e.dieT > 0) {
        e.dieT += dt
        if (e.dieT >= BOAR_DIE_TIME) e.alive = false
        continue
      }

      if (e.kind === 'snake') {
        if (e.emerge < 1) {
          e.emerge = Math.min(1, e.emerge + dt * 1.4)
          e.y = GROUND_Y - 6
        } else {
          e.x += e.vx * dt
          e.y = GROUND_Y - 6
        }
      } else {
        e.x += e.vx * dt
      }

      // Spec §5: boar mainly on recover (back). Snake also on strike tip.
      const boarWindow = this.chopPhase === 'back'
      const snakeWindow = this.chopPhase === 'down' || this.chopPhase === 'back'
      const canHit =
        e.kind === 'boar' ? boarWindow : snakeWindow
      if (canHit) {
        const tipX = axeTipX(this.px, this.facing, this.chopPhase)
        const tipY = axeTipY(this.playerY() + this.jumpOffset, this.chopPhase)
        const ew = e.kind === 'boar' ? BOAR_W : 4
        const eh = e.kind === 'boar' ? BOAR_H : 6
        const hitR = e.kind === 'boar' ? 8 : 6
        if (
          Math.abs(tipX - (e.x + ew / 2)) < hitR &&
          Math.abs(tipY - (e.y + eh / 2)) < 8 &&
          (e.kind !== 'snake' || e.emerge > 0.35)
        ) {
          e.dieT = 0.001
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
      x: this.px + 1,
      y: this.playerY() + this.jumpOffset + 1,
      w: 5,
      h: 5,
    }
    const high = this.jumpOffset < -10

    for (const e of this.enemies) {
      if (!e.alive || e.dieT > 0) continue
      // まだ地面下なら当たらない
      if (e.kind === 'snake' && e.emerge < 0.4) continue
      const er = {
        x: e.x,
        y: e.kind === 'snake' ? GROUND_Y - Math.floor(e.emerge * 6) : e.y,
        w: e.kind === 'boar' ? BOAR_W : 4,
        h: e.kind === 'boar' ? BOAR_H : Math.max(2, Math.floor(e.emerge * 6)),
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

  private mosakuPhase(): string {
    if (this.phase === 'death' || this.phase === 'gameover') return 'angel'
    if (this.stun > 0) return 'stun'
    if (!this.onGround) return 'jump'
    if (this.chopPhase === 'up') return 'up'
    if (this.chopPhase === 'down') return 'down'
    if (this.chopPhase === 'back') return 'back'
    if (this.moving) return Math.floor(this.walkT * 8) % 2 === 0 ? 'walk0' : 'walk1'
    return 'idle' // 振りかぶり
  }

  draw(): void {
    const r = this.eng.renderer
    // Yosaku playfield: black sky always; night = darker ground tint via overlay
    r.clear(C.sky)
    r.fillRect(0, GROUND_Y, LOGICAL_W, LOGICAL_H - GROUND_Y, C.ground)
    if (this.stage.night) {
      // sparse dark bars for night without leaving CV look
      for (let x = 0; x < LOGICAL_W; x += 3) r.setPixel(x, GROUND_Y + 1, 0)
    }

    for (const t of this.trees) {
      drawPineTree(r, t.x, GROUND_Y, t.leftHits, t.rightHits, t.fallen, t.fallT)
    }

    drawBird(
      r,
      Math.floor(this.birdX),
      5,
      Math.floor(this.birdFlap * 6) % 2 === 0,
    )

    for (const h of this.hazards) {
      if (h.kind === 'drop') drawDrop(r, Math.floor(h.x), Math.floor(h.y))
      else drawBranch(r, Math.floor(h.x), Math.floor(h.y))
    }

    for (const e of this.enemies) {
      if (!e.alive) continue
      if (e.kind === 'boar') {
        drawBoar(
          r,
          Math.floor(e.x),
          Math.floor(e.y),
          e.vx < 0,
          Math.floor(this.time * 8 + e.dieT * 20),
          e.dieT > 0,
        )
      } else {
        if (e.dieT > 0 && Math.floor(e.dieT * 16) % 2 === 0) continue
        drawSnake(r, Math.floor(e.x), GROUND_Y, e.emerge)
      }
    }

    // No whole-body walk bob — feet must stay on ground (leg frames handle walk)
    const py =
      this.phase === 'death' || this.phase === 'gameover'
        ? Math.floor(this.angelY)
        : Math.floor(this.playerY() + this.jumpOffset)
    const flash = this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0
    if (!flash || this.phase === 'death' || this.phase === 'gameover') {
      drawMosaku(r, Math.floor(this.px), py, this.facing, this.mosakuPhase())
    }

    // HUD like screenshot: big cyan lives + green stage
    r.drawBigDigit(Math.min(9, Math.max(0, this.lives)), 2, 2, C.hudCyan)
    r.drawBigDigit(1, 28, 2, C.hudGreen)
    r.fillRect(35, 5, 3, 2, C.hudGreen) // dash
    r.drawBigDigit(Math.min(9, this.stage.id), 40, 2, C.hudGreen)
    if (this.mode === 'timeattack') {
      r.drawText(`${this.time.toFixed(1)}`, 52, 3, C.hudCyan)
    } else {
      r.drawText(`${this.score}`, 52, 3, C.mosaku)
    }

    if (this.phase === 'clear') r.drawText('CLEAR', 26, 28, C.hudCyan)
    if (this.phase === 'gameover') {
      r.drawText('GAME OVER', 18, 26, C.cutDeep)
      r.drawText('ENTER', 28, 34, C.hudCyan)
    }
    if (this.freezeHorror > 0) {
      r.fillRect(0, 20, LOGICAL_W, 1, C.cutDeep)
      r.fillRect(0, 34, LOGICAL_W, 1, C.cutDeep)
    }
  }
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
