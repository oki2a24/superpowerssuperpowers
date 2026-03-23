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
    - スクリプトおよび移植後のロジックはすべて Node.js (v20+) で実装せよ。Python の新規導入は一切禁止する。

## Ⅱ. 防弾化と整合性 (Defensive Integration)

- **矛盾の提示 (Conflict Resolution)**:
    - **憲法（グローバル）の「矛盾の提示」を厳格に適用せよ。** 特に、工場規定（Node.js 準拠、Python 禁止等）に反する指示をユーザーから受けた場合は、直ちに実行せず、まず矛盾を提示して実行の是非を確認せよ。
- **物理的配置と構成**:
    - スキル開発は `./.gemini/skills/` で行い、安定版のみをグローバル領域へ昇華させよ。
    - 移植記録には `docs/superpowers_ports.md` を使用し、常に物理的な証拠を記録せよ。

## Ⅲ. 開発支援ツール (Factory Tools)

- **Todo 管理**: `node scripts/todo.mjs` を使用し、移植作業の進捗、依存関係、親子の階層構造を管理せよ。
- **連携プロトコル**: 大規模タスクの分割には `scripts/gemini_sub.mjs` (GPAC) を活用せよ。

---

## Ⅳ. 適応的知見統合 (Adaptive Knowledge Integration)

- **ステップ1：セッション開始時 (Discovery & Core Logic)**
    - 調査（Research）フェーズの初期段階で、以下のディレクトリ内のファイル一覧を確認せよ。
        - `~/.gemini/observations/`
        - `./.gemini/observations/`
    - その際、`GEMINI.md` が存在する場合は直ちに読み込み、本憲法を補完する最優先の行動原理として適用せよ。その他のスキル用知見（`スキル名.md`）については、存在のみを把握し、この段階では読み込むな。
- **ステップ2：スキル使用時 (On-demand Injection)**
    - 特定のスキルを使用する直前に、ステップ1で存在を確認した対応する知見ファイル（`スキル名.md`）を読み込め。その内容は、そのスキルの実行における最優先の制約事項として遵守せよ。

---
*Last Refactored: 2026-03-22 | Observation-Driven Update*
