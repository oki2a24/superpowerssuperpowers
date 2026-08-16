# update-superpowers-ports-doc スキル Pi CLI 対応 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** `.agents/skills/update-superpowers-ports-doc/SKILL.md` の記述を特定のツール名依存（`write_file`）からアクション指向・参照マッピング型（`pi-tools.md` 参照）に改定し、Pi CLI を含むマルチプラットフォームで正常に読み込み・実行できるようにする。

**アーキテクチャ:**
ファイルの配置場所（`.agents/skills/update-superpowers-ports-doc/SKILL.md`）はそのまま維持し、Pi CLI のネイティブ自動検出を利用する。本文中の操作指示（ファイル読み込み、書き込み/編集、Gitコミット）を環境非依存のアクション表現に改定し、ツールの解釈には `skills/using-superpowers/references/pi-tools.md` を参照させる。

**技術スタック:** Markdown (SKILL.md), Git

**グローバル制約 (Global Constraints):**
- 言語は日本語を優先とし、コミットメッセージも日本語（`type: 日本語`）とする。
- 原子的整合性（Atomic Integrity）を厳守し、単一目的の変更ごとにGitコミットを行う。

---

### タスク 1: `update-superpowers-ports-doc` スキルの Pi CLI 対応改定

**ファイル:**
- 変更: `.agents/skills/update-superpowers-ports-doc/SKILL.md`

**インターフェース (Interfaces):**
- 生産 (Produces): Pi CLI / Antigravity CLI / Claude Code 等でそのまま実行可能な `update-superpowers-ports-doc` SKILL.md

- [ ] **ステップ 1: SKILL.md の改定（ツール非依存化・マッピング参照追加）**

`.agents/skills/update-superpowers-ports-doc/SKILL.md` を更新し、ツール名への直書き（`write_file`）を廃止し、`skills/using-superpowers/references/pi-tools.md` 等のツールマッピングを参照した抽象アクション表現にする。

- [ ] **ステップ 2: スキル定義のロード検証**

`view_file` (IsSkillFile: true) で更新された `SKILL.md` を読み込み、構文とメタデータが正常であることを確認する。

- [ ] **ステップ 3: コミット**

```bash
git add .agents/skills/update-superpowers-ports-doc/SKILL.md
git commit -m "feat: update-superpowers-ports-doc スキルを Pi CLI 対応に改定する"
```
