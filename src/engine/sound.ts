/** Minimal Web Audio beeps + funeral-march sketch */

export class Sound {
  private ctx: AudioContext | null = null
  private muted = false

  ensure(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  setMuted(m: boolean): void {
    this.muted = m
  }

  beep(freq: number, dur = 0.08, type: OscillatorType = 'square', vol = 0.08): void {
    if (this.muted) return
    const ctx = this.ensure()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.value = vol
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  }

  /** Swing whoosh (miss or start) */
  chop(): void {
    this.beep(140, 0.05, 'triangle', 0.05)
  }

  /** Wood actually carved */
  chopHit(): void {
    if (this.muted) return
    this.beep(220, 0.05, 'square', 0.11)
    setTimeout(() => this.beep(90, 0.08, 'sawtooth', 0.08), 40)
  }

  /** Tree finished (both halves) — blink vanish */
  treeGone(): void {
    if (this.muted) return
    this.beep(160, 0.08, 'square', 0.1)
    setTimeout(() => this.beep(120, 0.12, 'triangle', 0.09), 70)
    setTimeout(() => this.beep(70, 0.22, 'sawtooth', 0.07), 160)
  }

  jump(): void {
    this.beep(440, 0.07, 'square', 0.07)
  }

  hitEnemy(): void {
    this.beep(120, 0.1, 'sawtooth', 0.09)
  }

  /** Boar charge — low rumble as it enters from off-screen */
  boarCharge(): void {
    if (this.muted) return
    this.beep(70, 0.12, 'sawtooth', 0.1)
    setTimeout(() => this.beep(55, 0.16, 'sawtooth', 0.09), 70)
    setTimeout(() => this.beep(90, 0.08, 'square', 0.07), 150)
    setTimeout(() => this.beep(45, 0.2, 'triangle', 0.06), 220)
  }

  stun(): void {
    this.beep(90, 0.2, 'triangle', 0.08)
  }

  clear(): void {
    this.beep(523, 0.1)
    setTimeout(() => this.beep(659, 0.1), 100)
    setTimeout(() => this.beep(784, 0.18), 200)
  }

  /** Public-domain funeral march sketch (Chopin's Op.35 motif, simplified) */
  funeralMarch(): void {
    if (this.muted) return
    const notes = [
      [196, 0.35],
      [196, 0.35],
      [196, 0.35],
      [185, 0.5],
      [196, 0.35],
      [233, 0.35],
      [220, 0.7],
    ] as const
    let t = 0
    for (const [f, d] of notes) {
      setTimeout(() => this.beep(f, d * 0.9, 'triangle', 0.06), t * 1000)
      t += d
    }
  }

  horrorGlitch(): void {
    this.beep(55, 0.4, 'sawtooth', 0.05)
    setTimeout(() => this.beep(40, 0.5, 'square', 0.04), 200)
  }
}
