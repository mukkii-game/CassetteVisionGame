export const LOGICAL_W = 75
export const LOGICAL_H = 60

export type PaletteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Button =
  | 'left'
  | 'right'
  | 'axe'
  | 'jump'
  | 'start'
  | 'select'

export interface InputState {
  left: boolean
  right: boolean
  axe: boolean
  jump: boolean
  start: boolean
  select: boolean
}

export interface SpritePattern {
  w: number
  h: number
  /** row-major palette indices; -1 = transparent */
  pixels: number[]
}

export interface Scene {
  enter?(): void
  exit?(): void
  update(dt: number): void
  draw(): void
}
