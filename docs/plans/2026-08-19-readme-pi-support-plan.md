# README.md Pi Coding Agent 対応反映 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、`executing-plans` スキルを起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** `README.md` に Pi Coding Agent のサポートおよび公式操作コマンド（インストール・アップデート・アンインストール）を正確に反映する。

**アーキテクチャ:** README.md の概要、クイックスタート（1. インストール / 2. アップデート / 3. アンインストール）に Pi Coding Agent のセクションを追記する。

**技術スタック:** Markdown

**仕様 (Spec):** `docs/plans/2026-08-19-readme-pi-support-design.md`

**グローバル制約 (Global Constraints):**
- 公式ドキュメントに基づいた正確な CLI コマンド（`pi install`, `pi update`, `pi remove`）を記載すること。

---

### タスク 1: `README.md` の更新

**ファイル:**
- 変更: `README.md`

- [ ] **ステップ 1: `README.md` に Pi Coding Agent のインストール・アップデート・アンインストール手順を編集追加**

`README.md` の概要およびクイックスタート（1, 2, 3 の各サブセクション）に Pi Coding Agent の説明を追加する。

- [ ] **ステップ 2: git diff で変更内容を確認**

実行: `git diff README.md`
期待値: 正しい Markdown 構文で Pi Coding Agent の操作コマンドが記載されていること。

- [ ] **ステップ 3: コミット**

```bash
git add README.md
git commit -m "docs(readme): README.md に Pi Coding Agent のサポートと操作コマンドを反映"
```
