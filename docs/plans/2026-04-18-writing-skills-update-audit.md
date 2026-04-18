# `writing-skills` 移植アップデート調査・検証計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** `writing-skills` スキルの移植アップデートにおいて、漏れ（欠落ファイル）、誤り（ツールマッピング、日本語翻訳）、不整合（既存知見との衝突）がないかを確認し、必要に応じて修正する。

**アーキテクチャ:**
1.  **構造比較:** 移植元と移植先のファイルリストを突き合わせ、欠落や不要なファイルを特定する。
2.  **内容精査:** `SKILL.md` および関連ドキュメント（`anthropic-best-practices.md` 等）の差分を確認し、ツール名の置換漏れや翻訳の不自然さを検証する。
3.  **移植記録の更新:** `docs/superpowers_ports.md` の記述が、今回のアップデートを正しく反映しているか確認する。

**技術スタック:** Gemini CLI, Shell, `git diff`, `grep_search`

---

### タスク 1: 移植元と移植先のファイル構造の完全な比較

**ファイル:**
- 調査: `superpowers-original/skills/writing-skills/`
- 調査: `skills/writing-skills/`

- [ ] **ステップ 1: 移植元の最新コミットと差分を確認**
移植元で最近どのような変更があったか、差分を確認する。

- [ ] **ステップ 2: `graphviz-conventions.dot` と `render-graphs.js` の扱いを決定**
これらが移植先にない理由を調査し、必要であれば Mermaid 形式に変換して `SKILL.md` 等に統合するか、Gemini CLI 環境では不要と判断するかをユーザーに確認する。

- [ ] **ステップ 3: `examples/CLAUDE_MD_TESTING.md` のリネームを確認**
`GEMINI_MD_TESTING.md` として正しく移植されているか、内容に `Claude` 固有の記述が残っていないか確認する。

### タスク 2: `SKILL.md` の詳細差分検証 (Upstream Sync Check)

**ファイル:**
- 比較: `superpowers-original/skills/writing-skills/SKILL.md`
- 比較: `skills/writing-skills/SKILL.md`

- [ ] **ステップ 1: アップデートによる新機能/変更の抽出**
移植元で追加された指示（例：特定のプロンプトエンジニアリングの追加など）が、移植先に反映されているか確認する。

- [ ] **ステップ 2: ツール名マッピングの漏れチェック**
`grep_search` を使用し、移植先に `Claude` / `Read` / `Write` / `Edit` / `Bash` / `Grep` / `Glob` / `Task` / `TodoWrite` などのキーワードが残っていないか一括検索する。

- [ ] **ステップ 3: 日本語化の質と用語の統一**
「日本語第一主義」に基づき、追加された日本語が不自然でないか、既存のスキル用語と整合しているか精査する。

### タスク 3: 関連ドキュメントの移植内容検証

**ファイル:**
- `skills/writing-skills/anthropic-best-practices.md`
- `skills/writing-skills/persuasion-principles.md`
- `skills/writing-skills/testing-skills-with-subagents.md`

- [ ] **ステップ 1: 各ファイルの内容に `Claude` 固有の参照がないか確認**
特に `testing-skills-with-subagents.md` は、Gemini CLI における `subagent-driven-development` への適応が重要。

### タスク 4: 移植情報の記録の正確性確認

**ファイル:**
- `docs/superpowers_ports.md`
- `docs/superpowers_ports_audit.md`

- [ ] **ステップ 1: `docs/superpowers_ports.md` の追記漏れ確認**
今回のアップデート（最新の移植元コミットハッシュとの同期）が記録されているか確認する。

- [ ] **ステップ 2: 変更履歴の整理**
必要であれば、今回の調査で見つかった修正も含めて記録を最新化する。
