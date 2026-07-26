# MOSAKU / CassetteVisionGame

カセットビジョンの解像度・色・入力制約をソフトに守る Web ゲームエンジンと、与作オマージュ『茂作』。

## Play

- Local: `npm install && npm run dev`
- Web: https://mukkii-game.github.io/CassetteVisionGame/

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move | ←→ / A D | D-pad / stick |
| Axe | Z / J | A |
| Jump | X / K / Space | B |
| Start | Enter | Start |

On phones, on-screen buttons appear automatically.

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
