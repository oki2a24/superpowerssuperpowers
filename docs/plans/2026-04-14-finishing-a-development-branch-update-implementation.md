# finishing-a-development-branch アップデート 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** `finishing-a-development-branch` スキルを最新のオリジナル仕様に基づき日本語化・高度化し、物理的に反映・検証する。

**アーキテクチャ:** 
- 段階的なセクション更新。
- コードブロックによるコマンド例の視覚化。
- 整合性のとれたクリーンアップ論理の導入。
- 物理的同期プロトコル（Push -> Update -> Resume）による検証。

**技術スタック:** 
- Markdown (SKILL.md)
- GitHub CLI (gh)
- Git
- Gemini CLI Extensions system

---

### タスク 1: ヘッダーと説明の更新

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: ヘッダーと開始時の宣言を追加**
  - 説明文をオリジナルの意図を汲んで日本語で洗練させる。
  - `開始時の宣言` セクションを追加する。

### タスク 2: ステップ 1 (テスト検証) の更新

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: テスト検証セクションのコードブロック化**
  - `npm test` などのコマンドをコードブロックで提示するように変更する。
  - テスト失敗時の表示内容を具体化する。

### タスク 3: ステップ 2 (ベースブランチ特定) の更新

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: ベースブランチ特定セクションのコードブロック化**
  - `git merge-base` コマンドをコードブロックで提示するように変更する。

### タスク 4: ステップ 4 (PR作成 - Option 2) の高度化

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: PR テンプレートとコマンドの導入**
  - `gh pr create` の `--body` に Summary と Test Plan のテンプレートを含める手順を追加する。

### タスク 5: ステップ 4 (破棄 - Option 4) の警告文の洗練

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: 警告メッセージの更新**
  - 削除される内容（ブランチ、コミットリスト、ワークツリーパス）をより明確に提示するように変更する。

### タスク 6: ステップ 5 (クリーンアップ) の整合性修正

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: オプションごとのクリーンアップ論理の修正**
  - オプション 1 と 4 の場合にのみクリーンアップを行うように記述を修正する。
  - オプション 2 はブランチとワークツリーを保持する（PRがマージされるまで必要）ように明記する。

### タスク 7: 知識セクション（リファレンス、間違い、兆候）の拡充

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: クイックリファレンス表の更新**
  - 各オプションの挙動（マージ、プッシュ、保持、削除）を正確に反映した表に更新する。
- [ ] **ステップ 2: 「よくある間違い」「危険な兆候」の追加**
  - オリジナルの詳細な項目を日本語で追加する。

### タスク 8: 統合と連携情報の更新

**ファイル:**
- 変更: `skills/finishing-a-development-branch/SKILL.md`

- [ ] **ステップ 1: 統合セクションの更新**
  - 呼び出し元（subagent-driven-development, executing-plans）と連携先（using-git-worktrees）の情報をオリジナルの内容に合わせて更新する。

### タスク 9: 物理的反映と実証テスト

- [ ] **ステップ 1: 変更のコミットと Push**
  - すべての修正をコミットし、`main` ブランチにプッシュする。
  - 実行: `git add skills/finishing-a-development-branch/SKILL.md && git commit -m "feat: finishing-a-development-branch スキルを最新化する" && git push origin main`

- [ ] **ステップ 2: 拡張機能のアップデート**
  - ローカルの Gemini CLI が参照している拡張機能を更新する。
  - 実行: `gemini extensions update superpowerssuperpowers`

- [ ] **ステップ 3: セッションの再起動（Resume）の依頼**
  - ユーザーに対し、`gemini --resume latest` を実行してセッションを再起動するよう依頼する。
  - **重要**: これにより、最新の SKILL.md の内容が AI にロードされる。

- [ ] **ステップ 4: 反映内容の物理的確認**
  - 再起動後のセッションで `activate_skill name="finishing-a-development-branch"` を実行し、修正後の日本語の内容やコードブロックが正しく表示されていることを物理的に確認する。

- [ ] **ステップ 5: 移植履歴の記録**
  - `update-superpowers-ports-doc` スキルを使用し、`docs/superpowers_ports.md` に更新内容を記録する。
  - 実行: `git add docs/superpowers_ports.md && git commit -m "docs: superpowers_ports.md にスキル更新を記録する" && git push origin main`
