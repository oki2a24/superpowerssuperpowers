# Pi エージェント全コアスキル対応 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** /superpowerssuperpowers のコアスキル群（`using-superpowers`, `executing-plans`, `systematic-debugging`, `writing-plans`）を Pi エージェント環境に適合させ、全プラットフォーム対応の記述へ整理・統一する。

**アーキテクチャ:** `skills/using-superpowers/SKILL.md` のスキル起動メカニズム一覧に Pi エージェントのロード方法を追加し、他のコアスキルに残留している Gemini CLI 専用の `activate_skill` 表記等を抽象化されたスキル起動表現へ更新。最後に `docs/superpowers_ports.md` に履歴を記述する。

**技術スタック:** Markdown

**仕様 (Spec):** `docs/plans/2026-08-19-pi-agent-core-skills-support-design.md`

**グローバル制約 (Global Constraints):**
- 既存の Antigravity, Claude Code, Gemini CLI, Copilot, Codex のツール設定との後方互換性を完全に維持すること。
- 日本語最優先の言語規律に従うこと。

---

### タスク 1: `skills/using-superpowers/SKILL.md` に Pi エージェント対応を追記

**ファイル:**
- 変更: `skills/using-superpowers/SKILL.md`

**インターフェース (Interfaces):**
- Consumes: `docs/plans/2026-08-19-pi-agent-core-skills-support-design.md`
- Produces: Pi エージェントのスキルロード手順（`read` ツール / `/skill:name`）を明記した `skills/using-superpowers/SKILL.md`

- [ ] **ステップ 1: `skills/using-superpowers/SKILL.md` の description と 「スキルへのアクセス方法」 セクションを更新**

`skills/using-superpowers/SKILL.md` の `description` に Pi の起動例（`read`）を追加し、`## スキルへのアクセス方法` の配下に以下を追加:
```markdown
**Pi エージェントにおいて:** Pi ネイティブのスキル機構（`read` ツールでスキルの `SKILL.md` を読み込むか、人間パートナーが `/skill:name` を使用）でスキルをロードして起動します（詳細は `references/pi-tools.md` を参照）。
```

- [ ] **ステップ 2: 変更の確認**

実行: `git diff skills/using-superpowers/SKILL.md`
期待値: Pi エージェントに関するアクセス方法と description が正しく追加されていること。

- [ ] **ステップ 3: コミット**

```bash
git add skills/using-superpowers/SKILL.md
git commit -m "feat(using-superpowers): Pi エージェントのスキル起動手順を追加"
```

---

### タスク 2: コアスキル群における Gemini 専用ツール表記 (`activate_skill`) の一般化

**ファイル:**
- 変更: `skills/executing-plans/SKILL.md`
- 変更: `skills/systematic-debugging/SKILL.md`
- 変更: `skills/writing-plans/SKILL.md`

**インターフェース (Interfaces):**
- Consumes: プラットフォーム抽象化ルール (`using-superpowers`)
- Produces: プラットフォーム依存ツール表記が除去された標準化済みスキルファイル群

- [ ] **ステップ 1: `skills/executing-plans/SKILL.md` の `activate_skill` 表記を修正**

`skills/executing-plans/SKILL.md` 内の `activate_skill` 表記を「プラットフォーム固有のスキル起動メカニズム（`activate_skill` / `view_file` / `read` / `Skill`）」または一般表現へ変更。

- [ ] **ステップ 2: `skills/systematic-debugging/SKILL.md` の `activate_skill` 表記を修正**

`skills/systematic-debugging/SKILL.md` 内の `activate_skill('test-driven-development')` 表記を「`test-driven-development` スキルを起動して」へ変更。

- [ ] **ステップ 3: `skills/writing-plans/SKILL.md` の `activate_skill` 表記を修正**

`skills/writing-plans/SKILL.md` 内の `activate_skill` 表記を「スキルを起動して」へ変更。

- [ ] **ステップ 4: 変更の確認**

実行: `git diff skills/executing-plans/SKILL.md skills/systematic-debugging/SKILL.md skills/writing-plans/SKILL.md`
期待値: Gemini 固有のツール呼称が一般化表現に置き換わっていること。

- [ ] **ステップ 5: コミット**

```bash
git add skills/executing-plans/SKILL.md skills/systematic-debugging/SKILL.md skills/writing-plans/SKILL.md
git commit -m "refactor(skills): activate_skill 等の Gemini 依存表記をプラットフォーム非依存に一般化"
```

---

### タスク 3: 移植ドキュメント `docs/superpowers_ports.md` の更新

**ファイル:**
- 変更: `docs/superpowers_ports.md`

**インターフェース (Interfaces):**
- Consumes: タスク 1, タスク 2 の成果
- Produces: 最新の変更内容が記録された `docs/superpowers_ports.md`

- [ ] **ステップ 1: `docs/superpowers_ports.md` に Pi エージェント対応の記録を追記**

- [ ] **ステップ 2: コミット**

```bash
git add docs/superpowers_ports.md
git commit -m "docs: superpowers_ports.md に Pi エージェント対応の更新履歴を追加"
```
