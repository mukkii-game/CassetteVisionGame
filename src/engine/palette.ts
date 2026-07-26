import type { PaletteIndex } from './types'

/** Tuned to Kikori no Yosaku Cassette Vision screenshot */
export const PALETTE: readonly string[] = [
  '#000000', // 0 black sky
  '#2038B0', // 1 blue
  '#E02018', // 2 red (deep cut)
  '#E048B0', // 3 magenta (mamushi)
  '#28E028', // 4 neon green ground
  '#20D0E8', // 5 cyan axe / HUD
  '#F09820', // 6 orange (Mosaku / canopy / cut)
  '#E8C8C0', // 7 pale trunk / flesh
] as const

export function clampPalette(i: number): PaletteIndex {
  return Math.max(0, Math.min(7, i | 0)) as PaletteIndex
}
