# Superpowersスキル移植履歴

このドキュメントは、`obra/superpowers` リポジリからGemini CLIに移植されたスキルの履歴と、その移植元となった `superpowers-original` サブモジュールのコミットハッシュを記録します。これにより、移植内容の再現性を保証し、将来のアップデート時の比較を容易にします。

## 記録された移植

### コミットハッシュ: `a98c5dfc9de0df5318f4980d91d24780a566ee60`

このコミットハッシュは、`superpowers-original` サブモジュールが本リポジリに導入された時点、およびそれ以前の移植作業における参照元です。

**移植済みスキル:**

*   `systematic-debugging`
*   `subagent-driven-development`
*   `writing-skills`
*   `port-superpowers-skill`
*   `brainstorming`
*   `executing-plans`
*   `finishing-a-development-branch`
*   `test-driven-development`
*   `using-git-worktrees`
*   `writing-plans`
*   `verification-before-completion`
*   `requesting-code-review`
*   `receiving-code-review`
*   `dispatching-parallel-agents`
*   `using-superpowers`
*   `SessionStart Hook`

### コミットハッシュ: `b7a8f76985f1e93e75dd2f2a3b424dc731bd9d37` (Upstream b7a8f76 準拠)

**移植済みスキル:**

*   `brainstorming` (v1.7.0 update: HARD-GATE, 9-step checklist, Visual Companion, Spec Self-Review)
*   `systematic-debugging` (v1.7.3 update: Iron Law, Multi-component evidence collection, Architecture re-evaluation)
*   `writing-plans` (v5.0.7 update: Scope Check, File Structure, No Placeholders, Self-Review, Execution Handoff)
*   `subagent-driven-development` (v1.8.4 update: Model Selection, Status Handling, Escalation Rules, Code Organization, Language: Japanese)
*   `executing-plans` (v1.8.6 update: Start-up Announcement, Sub-agent Guidance, Stricter Blocker Discipline)
*   `using-superpowers` (v1.2.0 update: Subagent-Stop, Instruction Priority, Platform Adaptation, EnterPlanMode logic)
*   `verification-before-completion` (v1.8.11 update: Agent Delegation Pattern, Honest Assertion, Detail Scope)
*   `finishing-a-development-branch` (v1.8.8 update: Code Blocks, GitHub CLI (gh) template, Cleanup logic sync)
*   `test-driven-development` (v1.8.12 update: Iron Law, Why Order Matters, Red Flags, Bug Fix Example)
*   `using-git-worktrees` (v1.1.0 update: GEMINI.md check, Jesse's rule for .gitignore, Red Flags sync, code block refactoring)
*   `requesting-code-review` (Major sync: code-reviewer.md template, placeholder detail, Red Flags, Example section)
*   `writing-skills` (Major sync: Upstream best practices, Mermaid conversion, Source Adaptation Guide in observations/writing-skills.md)
*   `testing-skills-with-subagents` (Professional Japanese translation, Terminology adaptation: generalist subagent, GEMINI.md)
*   `receiving-code-review` (v1.9.0 update: Technical Rigor, Pushback Protocol, No Thanks, Real Examples, GitHub Thread Replies)
*   `dispatching-parallel-agents` (v1.8.5 update: Agent Prompt Structure, Real Example (2025-10-03), Verification Section)

### コミットハッシュ: `6efe32c9e2dd002d0c394e861e0529675d1ab32e` (Upstream 6efe32c 準拠)

**同期・アップデート済みスキル:**

*   `brainstorming` (HARD-GATE 強化, アンチパターン追加)
*   `systematic-debugging` (デバッグの4フェーズ, 鉄則: バグの再現必須化)
*   `writing-plans` (セルフレビュー・チェックリストの導入, タスク粒度の詳細化)
*   `subagent-driven-development` (モデル選択ガイドの追加, ステータスハンドリングの詳細化)
*   `executing-plans` (批判的レビューの義務化, サブエージェント優先の注記強化)
*   `using-superpowers` (SUBAGENT-STOP ルールの明文化, 自己正当化の禁止)
*   `verification-before-completion` (鉄の掟: 最新の検証証拠の必須化)
*   `finishing-a-development-branch` (アンチパターン: 「後で直す」の禁止)
*   `test-driven-development` (鉄則: 失敗の確認必須化)
*   `using-git-worktrees` (開始時の宣言の追加)
*   `requesting-code-review` (成果物集中レビューの設計思想強化)
*   `writing-skills` (スキル定義の最新化)
*   `receiving-code-review` (技術的な厳格さと Pushback Protocol の強化)
*   `dispatching-parallel-agents` (サブエージェント活用の論理的背景の更新)
*   `testing-skills-with-subagents` (TDD マッピングと圧力シナリオの具体化)

### コミットハッシュ: `f2cbfbec06004df594589df638a164a66a393c5d` (Upstream f2cbfbe 準拠)

**同期・アップデート済みスキル:**

*   `finishing-a-development-branch` (環境検出・デタッチドHEAD対応の追加, クリーンアップロジックの強化)
*   `using-git-worktrees` (ネイティブツール優先, 既存隔離環境の検出, サブモジュールガード, サンドボックスフォールバックの導入)
*   `requesting-code-review` (`code-reviewer.md` テンプレートの刷新, サブエージェントへの指示の具体化)
*   `subagent-driven-development` (継続実行規律の追加: タスク間でユーザーの手を煩わせない)

### コミットハッシュ: `896224c4b1879920ab573417e68fd51d2ccc9072` (Upstream v6.0.3 準拠)

**同期・アップデート済みスキル:**

*   `systematic-debugging` (キーワード検出回避: `Ultrathink` → `Ultra-think`)
*   `test-driven-development` (`@testing-anti-patterns.md` → Markdown リンク形式に修正)
*   `executing-plans` (ツール固有表記の一般化: `TodoWrite` 等 → `todos`)
*   `receiving-code-review` (Circle K 反論シグナルの廃止, 誠実な反論ガイドに更新)
*   `requesting-code-review` + `code-reviewer.md` (サブエージェント表現への統一, `{}` → `[]` プレースホルダー変更, Read-Only Review セクション追加)
*   `using-git-worktrees` (グローバルパスサポートの削除: `~/.antigravity/worktrees/` 等を廃止, プロジェクトローカルな `.worktrees/` のみに集約, ステップ番号ずれの修正)
*   `finishing-a-development-branch` (グローバルワークツリーパスのクリーンアップサポートを削除)
*   `writing-plans` (Task Right-Sizing セクション追加, Global Constraints ヘッダー追加, Interfaces (Consumes/Produces) セクション追加)
*   `dispatching-parallel-agents` (サブエージェントディスパッチ表記を `Subagent (general-purpose)` 形式に修正, 並行ディスパッチルールの明文化)
*   `writing-skills` (GSO → SDO 用語変更, Match the Form to the Failure セクション追加, Micro-Test Wording Before Full Scenarios 手順追加, チェックリスト項目追加)
*   `using-superpowers` (ツール表記を一般的なアクション表現に更新, プラットフォーム適応説明の拡充, `references/` ディレクトリ: antigravity/claude-code/codex/copilot/gemini/pi 全ツールリファレンスを配置)
*   `brainstorming` (ビジュアルコンパニオンをジャストインタイム提案に変更, visual-companion.md・scripts/ 最新版を同期)
*   `subagent-driven-development` (2段階レビュー → 1回の `task-reviewer` に一本化, ファイルハンドオフワークフロー導入: brief/report/diff, 進捗台帳 `progress.md` の追加, `task-reviewer-prompt.md` 配置, `scripts/review-package`・`scripts/sdd-workspace`・`scripts/task-brief` 配置, 旧 `spec-reviewer-prompt.md` / `code-quality-reviewer-prompt.md` を削除)

### 2026-07-14 アップデート (todo.mjs 依存関係の排除)

**同期・アップデート済みスキル:**

*   `brainstorming` (チェックリストの進捗管理から todo.mjs 依存を削除、チェックボックス管理に統一)
*   `executing-plans` (タスク化の手順から todo.mjs 依存を削除、チェックボックス管理に統一)
*   `using-superpowers` (Mermaidフローから todo.mjs 依存を削除、チェックボックス管理に統一)
*   `test-driven-development` (ステップ管理から todo.mjs 依存を削除、チェックボックス管理に統一)
*   `systematic-debugging` (タスクリスト構成から todo.mjs 依存を削除、チェックボックス管理に統一)
*   `writing-skills` (チェックリスト説明から todo.mjs 依存を削除、チェックボックス管理に統一)
*   `subagent-driven-development` (タスクリスト作成手順をファイルベースのチェックボックス管理に統一)


## 今後の移植の記録方法

新しいスキルを移植する際には、以下のテンプレートを参考にこのドキュメントに追記してください。

### コミットハッシュ: `<移植元のコミットハッシュ>`

**移植済みスキル:**

*   `<移植したスキル名>`

### コミットハッシュ: `3dcbd5c` (Upstream v6.2.0 準拠)

**同期・アップデート済みスキル:**

*   `brainstorming` / `dispatching-parallel-agents` / `executing-plans` / `receiving-code-review` / `systematic-debugging` / `verification-before-completion` / `writing-plans` / `writing-skills`: 上流の個別スキル圧縮スイープに追従して不要な概念セクション（Key Principles, Real-World Impact, Bottom Line 等）を削除。
*   `finishing-a-development-branch`: ステップ4のメニューを3択/2択化に更新、ステップ2に `WORKTREE_PATH` の取得を追加、ステップ6を provenance-based クリーンアップに刷新し、Common Rationalizations テーブルを追加。
*   `requesting-code-review`: 「ワークフローとの統合」「Red Flags」セクションを削除し、Common Rationalizations テーブルを追加。
*   `test-driven-development`: 「なぜ順序が重要なのか」テキストセクションを削除し、Common Rationalizations テーブルを詳細化、`testing-anti-patterns.md` を削除し `writing-good-tests.md` を新規作成して参照更新。
*   `using-git-worktrees`: 「よくある間違い」「Red Flags」「統合」セクションを削除し、Common Rationalizations テーブルを追加。
*   `executing-plans`: 上流v6.2.0に従いバッチ実行モデルを削除し、直接実行モデルにシンプル化。
*   `subagent-driven-development`: `re-review-prompt.md` を新規作成、再開ループ (R≤3)、5ラウンド制限ブレーカー、進捗台帳 (`.sdd-ledger-[plan-name].md`) 管理、最終レビューの1回修正制限プロトコルを統合。

### コミットハッシュ: `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` (Upstream v6.3.0 準拠)

**同期・アップデート済みスキル:**

*   `brainstorming` (Three Paths 導入: Spike/Bounded/Architectural 分類、HARD-GATE 厳格化、Anti-Pattern 「Too Simple To Need Approval」更新、Red Flags テーブル追加、チェックリストのパス別分化、Terminal states のパス依存化)
*   `finishing-a-development-branch` (ワークツリー削除拒否時の対応追加: 未コミットファイルの確認とユーザー選択、手順の詳細化、Red Flags 追加)
*   `subagent-driven-development` (継続実行規律の強化: Ruling 文化導入、4つの停止条件明文化、計画衝突のルール化、Ledger への Ruling 記録義務、バッチ小タスク処理、サブエージェント待機ポリシー、Implementer のサブエージェント禁止契約、計画誤り時のルール適用)
*   `using-superpowers` (Hermes Agent サポート追加: `references/hermes-tools.md` 参照)
*   `writing-plans` (Spec 参照フィールド追加)
*   `requesting-code-review` / `code-reviewer.md` (サブエージェント非委任原則の明文化)


### コミットハッシュ: `1bf39f5` (Pi エージェント全コアスキル対応)

**同期・アップデート済みスキル:**

*   `using-superpowers` (Pi エージェントでのスキル起動メカニズムとして `read` ツール呼び出し・`/skill:name` の明示)
*   `executing-plans` / `systematic-debugging` / `writing-plans` (特定のプラットフォーム固有の `activate_skill` 表記を全プラットフォーム互換の一般的なスキル起動表現へ刷新)

### コミットハッシュ: `8ca22db` (Upstream v6.4.2 準拠: v6.4.1 + v6.4.2)

**同期・アップデート済みスキル:**

*   `brainstorming` (共通理解の確立セクション追加: 意図の発見・理解の書き戻し・デザインへの引き継ぎ、HARD-GATE のパス別段階承認化、アンチパターン更新、Red Flags 先頭行更新、visual-companion.md の `bash` 経由呼び出し化)
*   `executing-plans` (全面刷新: Native インライン実行スキル化 — brief/ledger/TDD/最終レビューの規律、タスクループ、完了契約、再等級付け+1回修正パス、Common Rationalizations、実行例。`scripts/task-start`・`scripts/task-done` 新規配置)
*   `writing-plans` (リーン計画化: 概要の有能な読者前提への書き換え、ステップ粒度、計画ヘッダーへの Review Focus 追加、Step 3 のシグネチャ記述化、「What a Step Contains」への置換、セルフレビューの Step scan/Review Focus/Proportion 追加、実行ハンドオフの Subagent-driven/Native 2択+推奨化。`plan-document-reviewer-prompt.md` は上流削除に追従して削除)
*   `subagent-driven-development` (いつ使用するかのインライン実行対比化、`bash` 経由スクリプト呼び出し化、review-package 範囲ガード注記。`scripts/review-package`・`sdd-workspace`・`task-brief` を上流版に同期: ワークスペース衝突回避、範囲ガード exit 3、実行ビット剥奪対策)
*   `requesting-code-review` (`BASE_SHA` 代替を `git merge-base origin/main HEAD` に修正)
*   `requesting-code-review` + `code-reviewer.md` (「仕様書はビジョンドキュメント」・「判断辞退リスト」セクション追加)
*   `test-driven-development` (プロジェクトのスイートがグリーンを定義する旨を追加: 省略による虚偽報告の禁止)
*   `using-superpowers` (Muse サポート追加: 起動説明 + `references/muse-tools.md` 新規作成、`references/claude-code-tools.md` に低コスト編成セクション追加)
*   `writing-skills` (同梱スクリプトのインタプリタ経由呼び出し規律を追加)
*   `systematic-debugging` (`root-cause-tracing.md` の `find-polluter.sh` を `bash` 経由呼び出し化)

**新規移植スキル:**

*   `diagnosing-superpowers` (セッション診断スキル: 問題受け付け・特定・トリアージ・報告・GitHub issues・バンドル出力・類似セッション。`prompts/` 11件・`references/` 4件・`templates/` 4件を含む日本語移植。機械可読プロトコルトークンは原文維持)

### 2026-10-04 同一上流 SHA に対する意味パリティ監査・修復

上流 SHA `8ca22dba9a94f28898bbce59f2537ff4d87c747d`（v6.4.2）を監査基準として再照合しました。上流 HEAD と記録済み移植基準は同じ SHA であり、この記録は上流の更新ではなく、移植後に生じていた意味ドリフトの修復です。

**修復した意味差分:**

* `brainstorming`: Spike / Bounded / Architectural の経路別チェックリスト、承認ゲート、完了状態を復元。
* `verification-before-completion`: 適用タイミングと適用範囲、成功・完了を示唆する表現にも検証が必要な規則を復元。
* `subagent-driven-development` と3つのプロンプト: 計画別ワークスペースと台帳の復旧、Spec 権威の衝突裁定、実装者レポートと状態契約、子エージェント禁止、必須の仕様/品質レビュー、5ラウンドの修正裁定、最終レビューと全裁定報告を復元。
* `systematic-debugging` と補助資料: 3回失敗後に設計を見直し、相談なしの4回目を禁止する上限、成功主張前の検証、参照実装を完全に読む規則、テスト基盤がない場合の単発再現、環境・タイミング要因の終了経路を復元。`find-polluter.sh` の `./` と0階層 `**/` 対応を復元し、疲労・埋没費用および権威・同調圧力を測る元の pressure test 2/3 と条件ベース待機のコメント例を戻しました。`root-cause-tracing.md` に欠けていた適用条件も復元。
* `test-driven-development`: 誤っていたモック・テスト専用コードの規則を上流の禁止事項に修正し、リファクタ手順とトリガーを復元。
* `requesting-code-review`: レビューを省略しない規則、Critical/Important を残さない規則、技術的根拠に基づく異議申し立て手順を復元。
* `writing-plans`: Spec の要件にタスクがない場合の追加規則と、Native 実行後に最上位モデルの新しいレビュアーで全体レビューする規則を復元。
* `writing-skills`: frontmatter フィールド要件と DOT/Graphviz の記法・レンダリング手順を復元。`package.json` が ES modules のため、レンダースクリプトも上流に合わせて ES module import とし、Graphviz 検出は `dot -V` の直接実行にして `which` 依存を除去。
* `using-superpowers`: 上流 Hermes Agent ツール対応表を追加し、Codex の子エージェント再開、待機、モデル指定、V1/V2 ライフサイクルの説明を現行の対応へ修正。
* `diagnosing-superpowers`: redaction を意味する箇所の誤訳「編集」を「秘匿化」に修正。

**対象・対応表 (SSOT):**

* 上流のアクティブな15スキル `superpowers-original/skills/<name>/**` は、同じ相対パスの `skills/<name>/**` に対応します。対象名: `brainstorming`, `diagnosing-superpowers`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills`。
* `systematic-debugging/CREATION-LOG.md` は作成経緯の開発ログであり、実行時スキル内容ではないため移植対象から除外。
* 上流 `using-superpowers/references/hermes-tools.md` は移植対象に追加し、メインの `SKILL.md` から参照。
* 上流 `writing-skills/examples/CLAUDE_MD_TESTING.md` は Antigravity 用の `ANTIGRAVITY_MD_TESTING.md` で置き換える。これは対象プラットフォーム向けの意図的な代替例。
* `using-superpowers/references/copilot-tools.md` と `opencode-tools.md` はローカルのプラットフォーム追加。`using-git-worktrees/.gitkeep`、`.DS_Store` は上流コンテンツに含めない。
* ローカルにのみある `observation-distiller`、`roadmap-management`、`session-coordination`、`session-handoff`、`session-retrospective` は、このリポジトリ独自の観察記録・計画管理・セッション運用スキルであり、上流 `obra/superpowers` に対応するアクティブスキルがないため移植・同期対象外。
* 上流の計画保存先 `docs/superpowers/plans/` は、このリポジトリで確立した `docs/plans/` に適応。パスを置き換えても計画の内容・実行規律は同じにする。
* 上流のデザイン／Spec 保存先 `docs/superpowers/specs/` は、このリポジトリで確立した `docs/plans/` の `*-design.md` 配置に適応。デザイン内容・承認ゲート・実装計画への引き継ぎは同じにする。
* 上流 `hooks/session-start` は `hooks/session-start.mjs` と `hooks/hooks.json` に対応し、Antigravity の Node.js フック形式へ適応。`agents/task-manager.md` はローカル専用設定で同期対象外。
* ローカルスキル内の図を Mermaid で表す場合は図の構文適応として扱うが、分岐・選択肢・終端状態を上流と照合する。`writing-skills` の作成ガイドと `render-graphs.js` は Graphviz DOT を基準にする。
* 日本語への翻訳は意図的な言語適応。プラットフォーム固有のツール参照・テンプレートは、この対応表で理由と対応先を記録した場合のみ意図的適応として扱う。

**検証範囲:** ファイル一覧、相互参照、翻訳後の意味、スクリプトとプロンプトを静的に再照合。実行テストおよびプラットフォームのスキルローダーによるロード確認は行っていません。

**リリース管理:** コアスキルの同期時に `package.json` と `antigravity-extension.json` を `1.11.3` から `1.11.4` へ更新しましたが、Codex 用 `.codex-plugin/plugin.json` を更新し忘れていました。Codex のインストール済みキャッシュも `1.11.3` のまま残っていたため、この修正で3つの配布マニフェストをすべて `1.11.4` に揃えました。Codex の再インストール版は `.codex-plugin/plugin.json` のバージョンに基づきます。
