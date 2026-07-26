import type { PaletteIndex } from './types'

/** Cassette Vision approximate 8-color palette */
export const PALETTE: readonly string[] = [
  '#000000', // 0 black
  '#1B3C8C', // 1 blue
  '#C43C28', // 2 red
  '#B84C9A', // 3 magenta
  '#2E8B3A', // 4 green
  '#3CB8B0', // 5 cyan / blue-cyan
  '#E08820', // 6 orange / yellow
  '#E8E0D0', // 7 white
] as const

export function clampPalette(i: number): PaletteIndex {
  return (Math.max(0, Math.min(7, i | 0)) as PaletteIndex)
}
