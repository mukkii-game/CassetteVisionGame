# Cassette Vision Soft Constraints

正本。ゲーム・エンジンはこの文書に従う。

## Display

| Item | Value |
|------|-------|
| Logical resolution | 75 × 60 |
| Upscale | Nearest-neighbor, integer scale preferred |
| Colors | 8 fixed palette entries |

## Palette (Yosaku-like vivid 8)

| Index | Name | Hex | Typical use |
|-------|------|-----|-------------|
| 0 | Black | `#000000` | Sky |
| 1 | Blue | `#2040C0` | Accent |
| 2 | Red | `#E02820` | Cut / danger |
| 3 | Magenta | `#E040A8` | Boar (1-color) |
| 4 | Neon green | `#40E038` | Ground / pine |
| 5 | Cyan | `#28D0E0` | Axe / HUD |
| 6 | Orange | `#F08818` | Mosaku (1-color) |
| 7 | Grey | `#C8C0B0` | Trunk |

## Geometry (μPD777 features we soft-emulate)

実機は矩形ドットに加え、**平行四辺形／斜めドット**や、見た目上の**三角ベタ**が使える（チャンネル表示系由来の斜め分割・タイミングずらし）。ソフトエンジンでも以下を提供:

| API | 用途 |
|-----|------|
| `fillTriangle` / `fillPine` | 松の葉など三角ベタ |
| `drawDiagThick` | 斜めの太い線（イノシシ・フン・翼） |
| `fillParallelogram` | 平行四辺形ボディ |

## Sprites (soft)

| Item | Hardware note | Soft engine |
|------|---------------|-------------|
| Size | 7×7 (some 8×7) | Prefer chunky 1-color silhouettes |
| Style | Often **1 color per character** | Enforced in `cvDraw.ts` |
| Max on screen | 25 | Not enforced |

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
