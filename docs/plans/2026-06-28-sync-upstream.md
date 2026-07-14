# Upstream 同期 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** superpowers-original (サブモジュール) の最新コミット（896224c4b1879920ab573417e68fd51d2ccc9072）と、親リポジトリの日本語版スキル群を同期させ、docs/superpowers_ports.md を更新する。

**アーキテクチャ:** 差分スキャンで特定された変更（軽微な変更、グローバルワークツリー削除、設計思想・形式適応、ビジュアルコンパニオン堅牢化、1レビュー体制移行など）を、日本語のニュアンスを維持しつつ日本語版スキルにロジック注入する。

**技術スタック:** Bash, Node.js, Markdown

## Global Constraints

- 日本語表現を英語で上書きしてはならない。英語の変更差分からロジックと制約のみを日本語版スキルに注入（マージ）すること。
- 移植履歴にない本プロジェクトオリジナルのスキル（.agents/skills/ 以下の port-superpowers-skill など）は変更・削除してはならない。
- すべてのプレースホルダーは square brackets [ ] 形式で統一し、curly brackets { } を使わない。
- コマンドを実行する際は必ずワークスペース内の有効なパスを指定し、cd コマンドを単独で実行しない。

---

### タスク 1: 軽微なスキルファイルの同期

**ファイル:**
- 変更: `skills/systematic-debugging/SKILL.md`
- 変更: `skills/test-driven-development/SKILL.md`
- 変更: `skills/executing-plans/SKILL.md`
- 変更: `skills/receiving-code-review/SKILL.md`
- 変更: `skills/requesting-code-review/SKILL.md`
- 変更: `skills/requesting-code-review/code-reviewer.md`

**Interfaces:**
- Produces: 同期された基本スキル群とコードレビューテンプレート

- [ ] **ステップ 1: systematic-debugging の修正**
  - `skills/systematic-debugging/SKILL.md` で、Claude Code の ultrathink キーワードスキャナーを回避するために、「Ultrathink this」の表現を「Ultra-think this」に変更する。

- [ ] **ステップ 2: test-driven-development の修正**
  - `skills/test-driven-development/SKILL.md` で、`@testing-anti-patterns.md` の記述を `[testing-anti-patterns.md](testing-anti-patterns.md)` に修正する。

- [ ] **ステップ 3: executing-plans の修正**
  - `skills/executing-plans/SKILL.md` で、`TodoWrite` というツール名の記述を `todos` のように一般的な記述に変更し、subagent対応 of プラットフォーム表記を追加する。

- [ ] **ステップ 4: receiving-code-review の修正**
  - `skills/receiving-code-review/SKILL.md` で、`CLAUDE.md violation` を `instruction-file violation` に変更する。
  - Pushing backの合言葉（シグナル）`"Strange things are afoot at the Circle K"` を廃止し、「その緊張感を名指しし、パートナーに問題を伝える」に変更する。

- [ ] **ステップ 5: requesting-code-review の修正**
  - `skills/requesting-code-review/SKILL.md` で、`Task tool with general-purpose type` などのツール表記を一般的なものに、また markdown リンク形式に修正する。
  - `skills/requesting-code-review/code-reviewer.md` で、プレースホルダーを `{PLACEHOLDER}` から `[PLACEHOLDER]` に変更し、`Read-Only Review` セクションを追加し、ツール表記を一般的なもの（`Subagent`）に変更する。

- [ ] **ステップ 6: 検証とコミット**
  - 変更内容に差分漏れがないか確認し、コミットする。
  ```bash
  git add skills/systematic-debugging/ skills/test-driven-development/ skills/executing-plans/ skills/receiving-code-review/ skills/requesting-code-review/
  git commit -m "docs: sync minor skills with upstream changes"
  ```

---

### タスク 2: `using-git-worktrees` と `finishing-a-development-branch` の同期

**ファイル:**
- 変更: `skills/using-git-worktrees/SKILL.md`
- 変更: `skills/finishing-a-development-branch/SKILL.md`

**Interfaces:**
- Consumes: タスク 1 の成果物

- [ ] **ステップ 1: using-git-worktrees の修正**
  - `skills/using-git-worktrees/SKILL.md` で、グローバルパス (`~/.config/superpowers/worktrees/`) 関連の記述を完全に削除し、プロジェクトローカルな `worktrees/` または `.worktrees/` のみを使うように整理する。
  - ディレクトリ選定の優先順位を `explicit instructions > existing project-local directory > default` に整理する。
  - ステップ番号のずれ（Step 0 から Step 2、3、4 にずれていた部分）を修正する。

- [ ] **ステップ 2: finishing-a-development-branch の修正**
  - `skills/finishing-a-development-branch/SKILL.md` で、グローバルワークツリーのクリーンアップパスのサポート（`~/.config/superpowers/worktrees/`）を削除する。

- [ ] **ステップ 3: コミット**
  ```bash
  git add skills/using-git-worktrees/ skills/finishing-a-development-branch/
  git commit -m "docs: remove global worktree path support and fix step numbering"
  ```

---

### タスク 3: `writing-plans` の同期

**ファイル:**
- 変更: `skills/writing-plans/SKILL.md`

**Interfaces:**
- Consumes: タスク 2 の成果物

- [ ] **ステップ 1: writing-plans の修正**
  - `skills/writing-plans/SKILL.md` に `Task Right-Sizing` の節を追加し、タスクの適切な粒度設計について記述する。
  - 計画ヘッダーに `Global Constraints` (グローバル制約) の節を追加する。
  - タスクのテンプレート構造に `Interfaces` (Consumes / Produces) のセクションを追加する。
  - `TodoWrite` のツール記述を一般的な表現（todoの作成）に修正する。

- [ ] **ステップ 2: コミット**
  ```bash
  git add skills/writing-plans/
  git commit -m "docs: sync writing-plans with upstream task size and interfaces constraints"
  ```

---

### タスク 4: `dispatching-parallel-agents` と `writing-skills` の同期

**ファイル:**
- 変更: `skills/dispatching-parallel-agents/SKILL.md`
- 変更: `skills/writing-skills/SKILL.md`

**Interfaces:**
- Consumes: タスク 3 の成果物

- [ ] **ステップ 1: dispatching-parallel-agents の修正**
  - `skills/dispatching-parallel-agents/SKILL.md` で、特定のツール呼出表記（`Task(...)`）を一般的なエージェントディスパッチ表記（`Subagent (general-purpose): ...`）に修正し、並行ディスパッチのルールを明文化する。

- [ ] **ステップ 2: writing-skills の修正**
  - `skills/writing-skills/SKILL.md` で、`Claude` 表記を `agents` などの一般的な表現に修正する。
  - 新たに `Match the Form to the Failure` の表とルール（ルール違反には禁止、形状崩れには肯定的なレシピ、漏れにはテンプレート必須スロット、条件依存には条件節など）を追加する。
  - `Micro-Test Wording Before Full Scenarios` (文言のマイクロテスト) の手順を追加する。
  - `TodoWrite` の記述を一般的な表現に修正する。

- [ ] **ステップ 3: コミット**
  ```bash
  git add skills/dispatching-parallel-agents/ skills/writing-skills/
  git commit -m "docs: sync dispatching-parallel-agents and writing-skills with general agent wording"
  ```

---

### タスク 5: `using-superpowers` スキルの同期と references/ の配置

**ファイル:**
- 変更: `skills/using-superpowers/SKILL.md`
- 作成: `skills/using-superpowers/references/antigravity-tools.md`
- 作成: `skills/using-superpowers/references/claude-code-tools.md`
- 作成: `skills/using-superpowers/references/codex-tools.md`
- 作成: `skills/using-superpowers/references/copilot-tools.md`
- 作成: `skills/using-superpowers/references/gemini-tools.md`
- 作成: `skills/using-superpowers/references/pi-tools.md`

**Interfaces:**
- Consumes: タスク 4 の成果物

- [ ] **ステップ 1: using-superpowers の修正**
  - `skills/using-superpowers/SKILL.md` で、ツール表記（`Skill` や `TodoWrite`）を一般的な表現（`the skill`, `create a todo` など）に修正する。
  - プラットフォーム適応セクションで、各プラットフォーム（Claude Code, Codex, Copilot, Gemini, Pi, Antigravity）向けのドキュメントファイルへの参照を整理する。

- [ ] **ステップ 2: references フォルダの配置**
  - `superpowers-original/skills/using-superpowers/references/` 以下のすべてのツールリファレンスマイル（`antigravity-tools.md`, `gemini-tools.md` など）を `skills/using-superpowers/references/` にコピーして配置する。
  ```bash
  mkdir -p skills/using-superpowers/references
  cp superpowers-original/skills/using-superpowers/references/*.md skills/using-superpowers/references/
  ```

- [ ] **ステップ 3: コミット**
  ```bash
  git add skills/using-superpowers/
  git commit -m "docs: sync using-superpowers and add platform tool references"
  ```

---

### タスク 6: `brainstorming` スキルの同期とビジュアルコンパニオンサーバーの更新

**ファイル:**
- 変更: `skills/brainstorming/SKILL.md`
- 変更: `skills/brainstorming/visual-companion.md`
- 変更: `skills/brainstorming/scripts/server.cjs`
- 変更: `skills/brainstorming/scripts/start-server.sh`
- 変更: `skills/brainstorming/scripts/stop-server.sh`
- 変更: `skills/brainstorming/scripts/helper.js`
- 変更: `skills/brainstorming/scripts/frame-template.html`

**Interfaces:**
- Consumes: タスク 5 の成果物

- [ ] **ステップ 1: brainstorming/SKILL.md の修正**
  - `skills/brainstorming/SKILL.md` で、ビジュアルコンパニオンの提案タイミングを「just-in-time（実際にビジュアルで見せた方がわかりやすい質問が発生した時点）」に制限するロジックを注入する。
  - 状態遷移図から事前の Visual Companion 提案の分岐を削除し、直接 `Ask clarifying questions` へ行くように修正する。（日本語版のMermaid図を修正）

- [ ] **ステップ 2: visual-companion.md とスクリプトのコピー**
  - `superpowers-original/skills/brainstorming/` にある `visual-companion.md` と `scripts/` ディレクトリ以下の全ファイルをコピーして上書きする。
  ```bash
  cp superpowers-original/skills/brainstorming/visual-companion.md skills/brainstorming/
  cp superpowers-original/skills/brainstorming/scripts/* skills/brainstorming/scripts/
  chmod +x skills/brainstorming/scripts/*.sh
  ```

- [ ] **ステップ 3: コミット**
  ```bash
  git add skills/brainstorming/
  git commit -m "feat(brainstorming): harden visual companion server and implement just-in-time offering"
  ```

---

### タスク 7: `subagent-driven-development` の同期

**ファイル:**
- 変更: `skills/subagent-driven-development/SKILL.md`
- 変更: `skills/subagent-driven-development/implementer-prompt.md`
- 作成: `skills/subagent-driven-development/task-reviewer-prompt.md`
- 作成: `skills/subagent-driven-development/scripts/review-package`
- 作成: `skills/subagent-driven-development/scripts/sdd-workspace`
- 作成: `skills/subagent-driven-development/scripts/task-brief`
- 削除: `skills/subagent-driven-development/spec-reviewer-prompt.md`
- 削除: `skills/subagent-driven-development/code-quality-reviewer-prompt.md`

**Interfaces:**
- Consumes: タスク 6 の成果物

- [ ] **ステップ 1: 旧レビュープロンプトの削除**
  - `spec-reviewer-prompt.md` と `code-quality-reviewer-prompt.md` を削除する。
  ```bash
  git rm -f skills/subagent-driven-development/spec-reviewer-prompt.md skills/subagent-driven-development/code-quality-reviewer-prompt.md
  ```

- [ ] **ステップ 2: 新レビュープロンプトとスクリプトのコピー**
  - `task-reviewer-prompt.md` とスクリプト類をコピーする。
  ```bash
  cp superpowers-original/skills/subagent-driven-development/task-reviewer-prompt.md skills/subagent-driven-development/
  mkdir -p skills/subagent-driven-development/scripts
  cp superpowers-original/skills/subagent-driven-development/scripts/* skills/subagent-driven-development/scripts/
  chmod +x skills/subagent-driven-development/scripts/*
  ```

- [ ] **ステップ 3: implementer-prompt.md のマージ**
  - `skills/subagent-driven-development/implementer-prompt.md` に upstream の変更点（レポート出力先 `REPORT_FILE` の利用、TDD RED evidence の出力、Windows 互換性など）を注入する。

- [ ] **ステップ 4: SKILL.md のマージ**
  - `skills/subagent-driven-development/SKILL.md` にロジックを注入する：
    - レビュアーを `task-reviewer` (spec compliance + code quality) 1回に一本化する。
    - 進捗台帳 (`progress.md`) を導入し、コンパクションやレジュームに対応する。
    - `task-brief`, `review-package` などのヘルパースクリプトを使った具体的なワークフローを定義する。
    - `TodoWrite` のツール表記を一般的な todo 管理に変更する。

- [ ] **ステップ 5: コミット**
  ```bash
  git add skills/subagent-driven-development/
  git commit -m "feat(sdd): switch to 1-stage review flow and introduce progress ledger"
  ```

---

### タスク 8: `docs/superpowers_ports.md` の更新と DoD 検証

**ファイル:**
- 変更: `docs/superpowers_ports.md`

**Interfaces:**
- Consumes: タスク 7 の成果物

- [ ] **ステップ 1: superpowers_ports.md の更新**
  - `docs/superpowers_ports.md` に新たなセクションを追加し、最新の同期ハッシュ `896224c4b1879920ab573417e68fd51d2ccc9072` (Upstream 896224c 準拠) を記録する。
  - 同期したスキルのリスト（および追加されたスクリプト）を明記する。

- [ ] **ステップ 2: ロードの確認（物理的動作検証）**
  - `view_file` 等を用いて、同期後の各スキルが正しくロードされるか物理的な確認を行う。

- [ ] **ステップ 3: コミット**
  ```bash
  git add docs/superpowers_ports.md
  git commit -m "docs: update superpowers_ports.md with commit 896224c4b1879920ab573417e68fd51d2ccc9072"
  ```
