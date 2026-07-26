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
- GitHub: https://github.com/mukkii-game/CassetteVisionGame （private）

## 現フェーズ

**Phase 0〜3 実装完了（初期版）**

- Soft Engine: `src/engine/`
- 茂作本編: `src/games/mosaku/`（8面・TA・ADV）
- タッチUI: `src/ui/touch.ts`
- デプロイ: `npm run deploy`（gh-pages）

## 次アクション

1. 実プレイで難易度・斧の距離感を調整
2. ADVテキストの日本語化（現状は3x5英語フォント）
3. ゲーム会前にリポジトリ public 化と Pages URL 確認
4. 必要なら `docs/MECHANICS_CANDIDATES.md` の backlog を試作

## 既知の注意 / バグ候補

- HUD・ADVは英数字のみ（3x5フォント）
- スプライト枚数は未強制
- オリジナルROM／ドット資産は使用禁止
- 葬送行進曲はパブリックドメイン旋律の簡易実装

## ドキュメント

- `docs/HARDWARE.md` — ハード制約正本
- `docs/MOSAKU.md` — 茂作仕様
- `docs/MECHANICS_CANDIDATES.md` — 拡張候補
