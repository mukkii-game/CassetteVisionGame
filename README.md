# MOSAKU / CassetteVisionGame

カセットビジョンの解像度・色・入力制約をソフトに守る Web ゲームエンジンと、与作オマージュ『茂作』。

## Play

- Local: `npm install && npm run dev`
- Web: https://mukkii-game.github.io/CassetteVisionGame/

## Controls

| Action | Keyboard / Mouse | Gamepad |
|--------|------------------|---------|
| Move | A D / ←→ | D-pad / stick |
| Axe | **Left click** / F | A |
| Jump | **Right click** / Space / W | B |
| Start | Enter | Start |

On phones, on-screen buttons appear automatically.

参考プレイ映像: [きこりの与作（カセットビジョン）](https://youtu.be/HpaIb2Ptygs)

## Build / Deploy

```bash
npm run build
npm run deploy   # GitHub Pages via gh-pages → dist/
```

Enable Pages on the `gh-pages` branch in repo settings after first deploy.

## Docs

- [AGENTS.md](./AGENTS.md) — AI handoff
- [docs/HARDWARE.md](./docs/HARDWARE.md) — constraints
- [docs/MOSAKU.md](./docs/MOSAKU.md) — game design
- [docs/MECHANICS_CANDIDATES.md](./docs/MECHANICS_CANDIDATES.md) — expansion notes

## License note

Original Cassette Vision / Yosaku ROM assets are **not** used. Mechanics are an homage with original pixel art.
