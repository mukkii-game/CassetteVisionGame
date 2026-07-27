# AGENTS.md — CassetteVisionGame / 茂作

## 目的

カセットビジョン相当の表示・色・入力制約の中で新しいゲームを作り、「荒いドットでもおもしろい」を証明する。第一作は『きこりの与作』オマージュ『茂作』。

## 制約（厳守）

- 論理解像度: **75×60**
- 色: **8色固定パレット**（`docs/HARDWARE.md` が正本）
- 入力抽象: Left / Right / Axe / Jump / Start / Select
- スプライト枚数制限: **ゆるめ**（強制しない）
- CPU速度・ROM容量: 再現しない
- 本物の μPD777 ROM は書かない（PD777 は参照のみ）

## 技術

- Vite + TypeScript + Canvas2D
- PCキーボード／ゲームパッド優先、スマホタッチ対応済み
- GitHub: https://github.com/mukkii-game/CassetteVisionGame （public）
- Pages: https://mukkii-game.github.io/CassetteVisionGame/

## 現フェーズ

**Phase 0〜3 実装完了（初期版）**

- Soft Engine: `src/engine/`
- 茂作本編: `src/games/mosaku/`（8面・TA・ADV）
- タッチUI: `src/ui/touch.ts`
- デプロイ: `npm run deploy`（gh-pages）

## 次アクション

1. 実プレイで斧距離・敵速度を動画寄りに再調整
2. ADVテキストの日本語化（現状は3x5英語フォント）
3. 必要なら `docs/MECHANICS_CANDIDATES.md` の backlog を試作

## 操作（PC）

- 移動: A/D（WASD）
- 斧: 左クリック / F
- ジャンプ: 右クリック / Space / W

## ビジュアル方針（厳守）

- **正本:** [`docs/YOSAKU_ART_SPEC.md`](docs/YOSAKU_ART_SPEC.md)
- 絵・モーションを変える前に必ず上記仕様を更新する。コードから先に変えない。
- **斜めドット／三角／平行四辺形は必須**（仕様 §1.2）。矩形だけで済ませない。
- 仕様が `APPROVED` になるまで、大幅な絵の作り直しはしない。

## 既知の注意 / バグ候補

- HUD・ADVは英数字のみ（3x5フォント）
- スプライト枚数は未強制
- オリジナルROM／ドット資産は使用禁止
- 葬送行進曲はパブリックドメイン旋律の簡易実装
- 参考動画: https://youtu.be/HpaIb2Ptygs

## ドキュメント

- `docs/HARDWARE.md` — ハード制約正本
- `docs/MOSAKU.md` — 茂作仕様
- `docs/MECHANICS_CANDIDATES.md` — 拡張候補
