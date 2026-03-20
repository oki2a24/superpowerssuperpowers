# スキル移植・開発工場 運営規定 (Porting Factory Mandate)

本ファイルは、`superpowers` スキルの移植、新規開発、およびオリジナルのアップデートへの追随を行うための「工場の運営規定」である。汎用的な「知性の憲法」はグローバル設定（`~/.gemini/GEMINI.md`）を参照せよ。

---

## Ⅰ. 移植・開発の基本原則 (Principles of Porting)

- **オリジナルの尊重 (Original Fidelity)**:
    - 移植元の構造やロジックを最大限尊重しつつ、Gemini CLI の特性（`ask_user`、`activate_skill` 等）に適合させよ。
    - オリジナルのアップデートを検知した際は、速やかに追随し、その差分を物理的に検証せよ。
- **グローバル互換性の確保 (Global Compatibility)**:
    - 将来のシステムワイド（`~/.gemini/skills/`）展開を見据え、SKILL.md 内での **プロジェクト固有パス（`scripts/...`）のハードコードを禁止** する。
    - 汎用的なツール名（`git`, `node` 等）や、環境変数、あるいは `ask_user` によるパス確認を用い、スキルの独立性を保て。
- **Node.js への完全準拠**:
    - 新規スクリプトおよび移植後のロジックはすべて Node.js (v20+) で実装せよ。Python の新規導入は一切禁止する。

## Ⅱ. 物理的配置と構成 (Project Structure)

- **スキル開発**: `./.gemini/skills/` で開発・検証を行い、安定版のみをグローバル領域へ昇華させよ。
- **移植記録**: 移植状況やコミットハッシュの記録には `docs/superpowers_ports.md` を使用し、`update-superpowers-ports-doc` スキルを適用せよ。
- **ワークツリー運用**: 大規模な移植や破壊的な変更は、必ず `.worktrees/` 下の隔離環境で実施せよ。

## Ⅲ. 開発支援ツール (Factory Tools)

- **Todo 管理**: `node scripts/todo.mjs` を使用し、移植作業の進捗を管理せよ。
- **連携プロトコル**: 大規模タスクの分割には `scripts/gemini_sub.mjs` (GPAC) を活用せよ。

---
*Last Refactored: 2026-03-19 | Redefined as Porting Factory*
