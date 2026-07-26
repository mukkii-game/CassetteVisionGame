import type { PaletteIndex } from './types'

/**
 * Cassette Vision–like vivid 8-color set
 * (tuned to match Kikori no Yosaku screenshot look)
 */
export const PALETTE: readonly string[] = [
  '#000000', // 0 black (sky)
  '#2040C0', // 1 blue
  '#E02820', // 2 red
  '#E040A8', // 3 magenta / pink (boar)
  '#40E038', // 4 neon green (ground / foliage)
  '#28D0E0', // 5 cyan (axe / HUD)
  '#F08818', // 6 orange (Mosaku)
  '#C8C0B0', // 7 grey / trunk / white-ish
] as const

export function clampPalette(i: number): PaletteIndex {
  return Math.max(0, Math.min(7, i | 0)) as PaletteIndex
}
