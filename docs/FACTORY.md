# スキル移植・開発工場 運営規定 (Porting Factory Mandate)

本ファイルは、`superpowers` スキルの移植、新規開発、およびオリジナルのアップデートへの追随を行うための「工場の運営規定」である。

---

## Ⅰ. 移植・開発の基本原則 (Principles of Porting)

- **オリジナルの尊重 (Original Fidelity)**:
    - 移植元の構造やロジックを最大限尊重しつつ、Gemini CLI の特性（`ask_user`、`activate_skill` 等）に適合させよ。
- **Node.js への完全準拠**:
    - スクリプトおよび移植後のロジックはすべて Node.js (v20+) で実装せよ。Python の新規導入は禁止する。

## Ⅱ. 開発支援ツール (Factory Tools)

- **Todo 管理**: `node scripts/todo.mjs` を使用し、作業の進捗を管理せよ。
- **連携プロトコル**: 大規模タスクの分割には `scripts/gemini_sub.mjs` (GPAC) を活用せよ。

## Ⅲ. リリースの定義 (Definition of Release / DoR)

**スキルそのものを変更・追加した際は、以下の規律に従い、リリースの完全性を証明せよ。**

1. **リリースの完全性**:
    - AI の振る舞いに影響を与える「コアファイル（プロンプト、スクリプト等）」に変更を加えた際は、必ずバージョン番号を更新せよ。
    - [ ] **Versioning**: `gemini-extension.json` の更新状況を確認せよ。
2. **移植の記録**:
    - [ ] **Porting Record**: `docs/superpowers_ports.md` への追記を確認せよ。
