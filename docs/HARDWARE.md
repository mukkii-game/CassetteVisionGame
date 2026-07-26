# Cassette Vision Soft Constraints

正本。ゲーム・エンジンはこの文書に従う。

## Display

| Item | Value |
|------|-------|
| Logical resolution | 75 × 60 |
| Upscale | Nearest-neighbor, integer scale preferred |
| Colors | 8 fixed palette entries |

## Palette (approximate Cassette Vision tones)

| Index | Name | Hex |
|-------|------|-----|
| 0 | Black | `#000000` |
| 1 | Blue | `#1B3C8C` |
| 2 | Red | `#C43C28` |
| 3 | Magenta | `#B84C9A` |
| 4 | Green | `#2E8B3A` |
| 5 | Cyan | `#3CB8B0` |
| 6 | Yellow / Orange | `#E08820` |
| 7 | White | `#E8E0D0` |

Index 6 is the orange accent; index 5 covers blue-cyan.

## Sprites (soft)

| Item | Hardware note | Soft engine |
|------|---------------|-------------|
| Size | 7×7 (some 8×7) | Prefer 7×7 patterns |
| Max on screen | 25 | Not enforced |
| Horizontal concurrent | 12 | Not enforced |
| Same coordinate stack | 5 | Not enforced |

## Input (abstract)

| Action | Keyboard / Mouse | Gamepad |
|--------|------------------|---------|
| Left | A / ← | D-pad / stick left |
| Right | D / → | D-pad / stick right |
| Axe | **Mouse L** / F (N, J, Z legacy) | Button A (0) |
| Jump | **Mouse R** / Space / W (M, X) | Button B (1) |
| Start | Enter | Start (9) |
| Select | Shift / Esc | Select (8) |

PC推奨: WASD移動 + 左クリック斧 + 右クリック／Spaceジャンプ。  
N/M は遠いので主入力にはしない（補助のみ）。

## Audio

Web Audio. No hardware PSG accuracy required.
Funeral march: public-domain melody sketch only.
