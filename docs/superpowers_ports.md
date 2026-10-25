# Superpowersスキル移植履歴

## 歴史的経緯 (Origin & Evolution)

本リポジトリは、`obra/superpowers` リポジトリを **Gemini CLI 向けに移植したこと**が始まりです。その後、後継の **Antigravity CLI (agy)** への対応を経て、対応ハーネスを拡張してきました（opencode、Codex、Pi Coding Agent 等を含む）。

ただし、これは「特定のハーネスへの引っ越し」を目的としたものではありません。本リポジトリのスキル群は、**任意の生成AIコーディングハーネスで利用できる汎用スキル群**として整備されています。現在、開発・利用の主環境として opencode や Codex を使用していますが、それらは「現に使っているハーネスの一例」にすぎず、プロジェクトの位置付けそのものではありません。

各スキルはプラットフォーム固有のツール名に依存しない「アクション」表現で書かれており、`using-superpowers` のプラットフォーム適応レイヤー（`skills/using-superpowers/references/` の各ツール対応ドキュメント）を通じて、各ハーネスのネイティブ機能へ読み替えられます。

## 記録された移植

このセクション以降は、移植元 `superpowers-original` サブモジュールのコミットハッシュごとの移植・同期履歴です。これにより、移植内容の再現性を保証し、将来のアップデート時の比較を容易にします。

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
* 上流 `writing-skills/examples/CLAUDE_MD_TESTING.md` は Antigravity 用の `AGENTS_MD_TESTING.md` で置き換える。これは対象プラットフォーム向けの意図的な代替例（v7.0.1 で上流側も `references/CLAUDE_MD_TESTING.md` へ移動したため、本リポジトリでは `skills/writing-skills/references/AGENTS_MD_TESTING.md` として対応）。
* `using-superpowers/references/copilot-tools.md` と `opencode-tools.md` はローカルのプラットフォーム追加。`using-git-worktrees/.gitkeep`、`.DS_Store` は上流コンテンツに含めない。
* ローカルにのみある `observation-distiller`、`roadmap-management`、`session-coordination`、`session-handoff`、`session-retrospective` は、このリポジトリ独自の観察記録・計画管理・セッション運用スキルであり、上流 `obra/superpowers` に対応するアクティブスキルがないため移植・同期対象外。
* 上流の計画保存先 `docs/superpowers/plans/` は、このリポジトリで確立した `docs/plans/` に適応。パスを置き換えても計画の内容・実行規律は同じにする。
* 上流のデザイン／Spec 保存先 `docs/superpowers/specs/` は、このリポジトリで確立した `docs/plans/` の `*-design.md` 配置に適応。デザイン内容・承認ゲート・実装計画への引き継ぎは同じにする。
* 上流 `hooks/session-start` は `hooks/session-start.mjs` と `hooks/hooks.json` に対応し、Antigravity の Node.js フック形式へ適応。`agents/task-manager.md` はローカル専用設定で同期対象外。
* ローカルスキル内の図を Mermaid で表す場合は図の構文適応として扱うが、分岐・選択肢・終端状態を上流と照合する。`writing-skills` の作成ガイドと `render-graphs.js` は Graphviz DOT を基準にする。
* 日本語への翻訳は意図的な言語適応。プラットフォーム固有のツール参照・テンプレートは、この対応表で理由と対応先を記録した場合のみ意図的適応として扱う。
* 上流 `subagent-driven-development/scripts/task-brief` は `Task n` 見出しの awk 抽出に対し、本リポジトリの日本語計画向けに `タスク n` 見出しの追加対応（コミット `c76e4ad`、バージョン 1.11.6 で導入）を行う。上流の `Task n` 動作と「見つからない場合の exit 3」経路は保持した上位互換。`task-start`・`task-done`・`sdd-workspace` は見出しをパースしないため、この適応の影響範囲は `task-brief` のみ。
* `writing-plans` のセルフレビューには、上流の5項目に加えて「6. コマンドの正確性： 記述したコマンドがそのディレクトリで実際に動作するか？」の1項目が追加されている（2026-10-19 の監査で人間パートナーの承認を得て意図的なローカル追加として記録）。上流5項目の各文はすべて移植済みであり、この追加項目が既存項目の判定経路を狭めたり手順順序を変えたりしない。

**検証範囲:** ファイル一覧、相互参照、翻訳後の意味、スクリプトとプロンプトを静的に再照合。実行テストおよびプラットフォームのスキルローダーによるロード確認は行っていません。

**リリース管理:** コアスキルの同期時に `package.json` と `antigravity-extension.json` を `1.11.3` から `1.11.4` へ更新しましたが、Codex 用 `.codex-plugin/plugin.json` を更新し忘れていました。Codex のインストール済みキャッシュも `1.11.3` のまま残っていたため、この修正で3つの配布マニフェストをすべて `1.11.4` に揃えました。Codex の再インストール版は `.codex-plugin/plugin.json` のバージョンに基づきます。

**再発防止:** `scripts/finish_check.mjs` に、コア変更時は3つの配布マニフェストをすべて更新し、各 `version` が一致していることを検査するゲートを追加しました。Codex マニフェストだけが旧版に残るケースを `tests/test_finish_check.mjs` で再現し、ゲートが失敗させます。この検査スクリプトの変更を含むため、3マニフェストを `1.11.5` に揃えました。

### 2026-10-18 同一上流 SHA での意味パリティ監査（監査のみ・スキル本文の修復なし）

上流 HEAD は `8ca22dba9a94f28898bbce59f2537ff4d87c747d`（v6.4.2）で、記録済み移植基準と同一 SHA、`superpowers-original` に未コミット変更はありませんでした。上流 SHA が不変のため上流差分の抽出を省略し、現行上流のソースと移植先15スキル全対象を全文照合しました。この記録は上流の更新ではなく、2026-10-04 の監査後におけるドリフト有無の再確認です。

**監査結果:**

*   ファイル一覧の差は、上の「対象・対応表 (SSOT)」に記載済みの意図的適応・除外のみ（`.DS_Store`、`.gitkeep`、`systematic-debugging/CREATION-LOG.md`、ローカル専用の観察・セッション運用系5スキル、`copilot-tools.md`、`opencode-tools.md`、`CLAUDE_MD_TESTING.md` → `AGENTS_MD_TESTING.md`）で、理由のない欠落・追加・パス変更はありませんでした。
*   15スキル全ファイルについて上流・移植先を全文読み込み、適用トリガー、分岐、承認ゲート、完了状態、手順の順序、MUST/NEVER の強さ、数値（再開ループ R≤3、5ラウンド制限ブレーカー、3回失敗上限等）、機械可読トークン、スクリプトの exit コード、参照リンクを照合しました。意味ドリフトは検出されませんでした。
*   前回監査後に `skills/` で唯一変更された `scripts/task-brief` の日本語見出し対応は、上流動作を保持する上位互換の言語適応として対応表に追記しました（上の対象・対応表 (SSOT) の該当項目）。

**検証範囲:** `tests/test_finish_check.mjs`（失敗0）、3つの配布マニフェストのバージョン一致（`1.12.0`）、`git diff --check`、frontmatter と相互参照の静的確認、opencode ネイティブのスキルローダーで全スキルが一覧に載ることと `sync-upstream-skill` 自体の実ロードを確認。スキル本文の個別ロード実行テストとスクリプトの実行テストは未実施。

### コミットハッシュ: `bb92a77741419a4ab5f06e711a283343f1ada0c3` (Upstream v7.0.0 準拠)

上流 `superpowers-original` を `8ca22db` から `bb92a77`（Release v7.0.0: rebuilt brainstorming, Antigravity Marketplace manifest, Windows hook fixes）へ進めました。本リポジトリの3つの配布マニフェストは `1.12.1` に更新。

**同期・アップデート済みスキル:**

*   `brainstorming` (全面再構築への追従: Three Paths / チェックリスト / Mermaid プロセスフロー構成を廃し、上流の新しい対話主導型構成に刷新 — 「まず知っていること」「最初のメッセージ」「対話の規律」「理解を再生して返す」「作業の規模を決める」「書かれたデザイン + ビルダーチェック」、承認の2例外入り HARD-GATE、Red Flags の新テーブル、ビジュアル・コンパニオンのジャストインタイム提案。`spec-document-reviewer-prompt.md` は上流削除に追従して削除し、`builder-check-prompt.md` を日本語で新規配置。`scripts/server.cjs` は `replace()` の関数引数化を上流通りに適用)
*   `executing-plans` (`scripts/task-done`: 台帳に書く最後出力の `|| last="(no output)"` フォールバックを上流通りに適用)
*   `requesting-code-review` (BASE_SHA 取得コマンドを `awk` から `cut -d' ' -f1` に変更)
*   `subagent-driven-development` (`scripts/sdd-workspace`: repo root の物理パス化 (`pwd -P`)、`CDPATH=''` 統一、`.superpowers/sdd/.gitignore` の create-only 化を上流通りに適用)
*   `systematic-debugging` (例コマンドの bash 依存表現を上流通りに修正: `${IDENTITY:+SET}${IDENTITY:-UNSET}` → `[ -n ... ] && echo SET || echo UNSET`、`env | grep IDENTITY` → `printenv IDENTITY`)

**確認済み・適応の判断:**

*   上流 `hooks/session-start` の v7 変更は bash 実装の PATH 非依存化（`dirname` 不使用、`$(< file)`）と Windows の Git Bash EPIPE 吸収（`emit_json` で printf を cat にパイプ）であり、出力 JSON 形式の意味変更はない。本リポジトリの適応先は Node 製 `hooks/session-start.mjs` + `hooks/hooks.json` であり、これらの bash 固有の失敗モードは該当しないため、`.mjs` は無変更（読み込み・JSON 構造・`</EXTREMELY_IMPORTANT>` ラップは現行のまま同等と確認）。
*   上流 `hooks/run-hook.cmd` は上流 bash フックの Windows ラッパであり、Node 直呼びの `hooks.json` には対応先がないため移植しない (`.antigravity-plugin/plugin.json`、`assets/antigravity-logo.png`、`scripts/render-antigravity-logo.sh` も上流の Antigravity Marketplace 配布インフラであり、本リポジトリの配布マニフェスト構成に対応先がないため対象外)。
*   上流 `.opencode/INSTALL.md` / `docs/README.opencode.md` の差分は上流プラグインのバージョンタグ更新のみ。本リポジトリの opencode インストール文書は本プラグイン向けに独自管理的な `.opencode/INSTALL.md` を持つため対象外。

**検証範囲:** `tests/test_finish_check.mjs`(7件) / `tests/test_task_brief.mjs`(5件) / `tests/test_hook_output.mjs` / `tests/test_pre_push_hook.mjs` 全 pass、`node --check` と `bash -n` の構文検査、`git diff --check`、`docs/superpowers/plans/` → `docs/plans/` のパス適応の維持確認。スキルローダーによるブラウザ実行・実行テストは未実施。

### 2026-10-19 同一上流 SHA での意味パリティ監査と2件の修復

上流 HEAD は `bb92a77741419a4ab5f06e711a283343f1ada0c3`（v7.0.0、fetch 済みで origin/main と一致）で、記録済み移植基準と同一 SHA、`superpowers-original` に未コミット変更はありませんでした。上流差分の抽出を省略し、15スキル全対象のソースと移植先を複数のサブエージェント＋直接照合で全文比較しました。

**監査で検出した意味ドリフトと修復:**

*   `systematic-debugging`: 上流 `**But:** 95% of "no root cause" cases are incomplete investigation.` の数値「95%」が移植先で「多く」に弱体化していた（2026-10-18 監査での見逃し）。「根本原因は見つからなかった」脱出経路（環境・タイミング・外部要因が真因のケース）の末尾に上流通りの 95% 表記を復元し、概要節の要約行も 95% に統一。
*   `writing-plans`: 移植先のセルフレビューに上流に存在しない「6. コマンドの正確性」が存在した。対応表 (SSOT) への未記録だったため、人間パートナーの承認を得て上の対応表に意図的な追加として新規記録（本文は変更なし）。
*   `docs/superpowers_ports.md` の v7.0.0 見出し SHA の誤記を修正: `bb92a7741419a4ab5f06e711a283343f1ada0c3` → 正 `bb92a77741419a4ab5f06e711a283343f1ada0c3`（`git rev-parse HEAD` と照合、先頭8桁 `bb92a77` は変わらず）。

**ドリフトなしと確認した対象:** `subagent-driven-development`（SKILL.md＋scripts 4本＋prompts 3本、exit 3・`タスク n` 対応を含む）、`test-driven-development`＋`writing-good-tests.md`、`verification-before-completion`、`using-git-worktrees`、`requesting-code-review`＋`code-reviewer.md`（判断辞退リスト・Read-Only Review 等の節構造含む）、`receiving-code-review`、`dispatching-parallel-agents`、`diagnosing-superpowers`（templates 4件・prompts 11件・references 4件を含む全文照合、機械可読トークンの原文維持を確認）、`brainstorming` / `executing-plans` / `finishing-a-development-branch`（節構造照合は本監査、全文照合は 2026-10-18 の同一 SHA 監査による）、`using-superpowers`（SKILL.md＋references。`codex-tools.md` は別形式の適応文書で中核規律を保持、上流の `agent_type` ロールファイル添付細部のみ未収載のため要観察）、`writing-skills`（セルフレビューの構造照合。`知見の蒸留 (Observations)` 節と `observations/writing-skills.md` 読み替えガイド参照はローカル運用への適応）。

**インベントリ:** 15スキル全ファイルの一覧差分は、対応表に記載済みの意図的適応・除外のみで、理由のない欠落・追加・パス変更はありませんでした。

**検証範囲:** `git diff --check`、リポジトリ既存テスト（実行結果は下記）、編集2ファイルの上流対照再確認、opencode ネイティブのスキルローダーで全スキルが一覧に載っていることの確認。スキル本文の実ロード実行テストは未実施。

**リリース管理:** コア（`skills/`）変更を含むため、3つの配布マニフェストを `1.12.2` から `1.12.3` に揃えて更新（`scripts/finish_check.mjs` のコア変更・バージョン整合ゲートが要求する手順）。

### 2026-10-20 同一上流 SHA での意味パリティ監査・大規模修復

上流 HEAD は `bb92a77741419a4ab5f06e711a283343f1ada0c3`（v7.0.0、fetch 済みで origin/main と一致）で、記録済み移植基準と同一 SHA、`superpowers-original` に未コミット変更はありませんでした。上流差分の抽出を省略し、診断サブエージェント 8 グループ＋ `diagnosing-superpowers` 継続 1 グループ＋ `subagent-driven-development` 専門 1 グループの報告を、上流ソースとの直接対照で検証・修復しました。2026-10-18/19 の監査レコードは翻訳・SDO 圧縮スイープ由来の損失（とりわけ `systematic-debugging` とプロンプトテンプレート群）を見逃しており、本監査で下記の修復一覧をもってその不正確さを修正しました。

**検出した意味ドリフトと修復（全編集は上流ロジックの意味復元、数値・機械可読トークン・exit コード保持）:**

*   `systematic-debugging/SKILL.md`: 本番バグ (`production bugs`) 経路の復元、レイヤー3キーチェーン表の復元、2回以上の修正を求める強度表現、`Will it show up on its own / Will it show up under testing?` の信号行、プロセス完了 bullet の復元。
*   `systematic-debugging/root-cause-tracing.md`: 中核原則の重複節を削除し節位置を上流に整合、Layer 1 の抽象化の復元、スクリプト参照句の復元。
*   `systematic-debugging/test-pressure-2.md` / `test-pressure-3.md`: A/B 選択肢項目、百回・沈黙・ドキュメント C 案、MUST 形式の全面復元。
*   `brainstorming/SKILL.md`: "Avoid jargon" の復元、description への要約文混入を除去。
*   `brainstorming/visual-companion.md`: Copilot CLI コメントの復元、`mode: async` / `shellId` の除去。
*   `writing-plans/SKILL.md`: Global Constraints を H2 化、自己防衛文の修正、Native 選択肢の freshest reviewer 復元＋ If-Native 重複行の削除、結語の順序、7項目最小実装文の復元、should 強度の解除。
*   `executing-plans/SKILL.md`: mermaid フローの Per Task subgraph 表現を復元。
*   `test-driven-development/SKILL.md`: REFACTOR 節の `...` 残骸修復＋5規則復元、対話型追記の8箇所除去、良いテストのルール節を上流と同じ位置へ移動。
*   `test-driven-development/writing-good-tests.md`: モック・トリガーの復元、ゲート条件の双方向化。
*   `using-git-worktrees/SKILL.md`: description のトリガー復元。
*   `verification-before-completion/SKILL.md`: description へのコミット/PR トリガー追加、Revert/Restore 語彙の修正。
*   `requesting-code-review/SKILL.md`: 不要な追加句の削除、Optional / timing の修正、評価の解除。+ `code-reviewer.md`: 出力例を上流例（Date validation / Progress indicators / index-conversations / With fixes 等）へ全面置換。
*   `receiving-code-review/SKILL.md`: `gh api` エンドポイントの復元、❌ の5項目化、YAGNI 文の unused feature 修正、節順序 (Common Mistakes → Real Examples → GitHub Thread Replies) の並べ替え。
*   `dispatching-parallel-agents/SKILL.md`: プロンプト例の Fix-by 3分岐復元＋最小限制約の削除、セッション実例節の復元。
*   `finishing-a-development-branch/SKILL.md`: 「exactly 2 options」への修正。
*   `using-superpowers/SKILL.md`: 探索・ファイル確認の列挙追加、プロセススキル規則の適用範囲拡張。+ `references/codex-tools.md`: reconcile 分岐の復元、every-spawn model+effort の MUST 化、fork_turns 既定の断定化、wait_agent ストレッチ規律の復元。
*   `writing-skills/SKILL.md`: description の要約削除、@リンク禁止例＋理由句の復元、テスト方法4 bブレットの復元、マイクロテスト節の移動、50-100x の復元、意味のないラベル A/B の除去、個人スキル配置の文書化、チェックリスト順序の整理。+ `anthropic-best-practices.md`: Card href の絶対 URL 化、オンデマンド読み込みの汎用化。+ `persuasion-principles.md`: todo.mjs/TodoWrite 記名をチェックボックス管理への汎用表現に置換。
*   `subagent-driven-development/task-reviewer-prompt.md`（HIGH 3件を含む）: レビュアー自身による証拠 re-read 規律節の復元、一括派遣の file-by-file 照合規定の復元、クロージャ・フェンス文の復元、プレースホルダ定義一覧と Reviewer returns 契約の追加。+ `SKILL.md`: 実行例の parked 台帳形式 `Task <N>: parked — <finding> — Ruling: <…>` を復元、パーキング節を上流3分岐の構成へ整合、レビュアー再読主体の修正、executing-plans 対比の項目補完。
*   修正を重点的にかけた `scripts`（`task-brief`, `task-start`, `task-done`, `sdd-workspace`, `review-package`）は全ファイル照合の結果、ドリフトなしと確認。

**監査での意図的適応の新規記録（削除せず本 SSOT へ記録したもの）:**

*   `diagnosing-superpowers/prompts/quality-evidence.md` および `stumbles.md`: 出力テンプレートに「（日本語の同等主張）」という運用上の補助括弧を明示的に残しています。これは英語による機械判読が不可能であるため開発時に追加したものであり、翻訳による損失ではありません。上流の主張には影響しません。
*   `systematic-debugging/testing-skills-with-subagents.md` (参考資料): 上流では frontmatter を持たないが、本リポジトリの配布規約に合わせて移植時に統一 frontmatter を付与しています。
*   `dispatching-parallel-agents/SKILL.md`: `agy` (Antigravity CLI) 上で skill ツールの `view_file` を補足して起動させる platform adaptation 節を追加しています。これは他全スキルと同じ共通適応 (opencode tools / codex 系の対応表に相当) の Antigravity での local adaptation で、上流にはありません。
*   `writing-skills/SKILL.md`: 作成の際、日本語コメントの規則（コード例内コメントは日本語、機械トークンと終端名は英語のまま）を明示的に付加しています。上流の英語例文自体の意味と機械トークンは保持のため、ドリフトではありません。
*   `subagent-driven-development/SKILL.md`: 会話型の「利用者への確認を促す」指示は、上流の自律実行モデルへの整合による明示的なことであり、ドリフトではありません。
*   `brainstorming/SKILL.md`: 具体的な構成の詳細表現は、上流のロジックを保持した上で日本語圏での読みやすさのために修正されたものであり、ドリフトではありません。

**検証範囲:** `git diff --check`、リポジトリ既存テスト（`tests/test_finish_check.mjs`、失敗0）、主要修復ファイルの上流対照再確認、mermaid / DOT 図の記法照合。スキル本文の実ロード実行テストは未実施。

**リリース管理:** コア（`skills/`）変更を含むため、3つの配布マニフェストを `1.12.3` から `1.12.4` に揃えて更新（`scripts/finish_check.mjs` のコア変更・バージョン整合ゲートが要求する手順）。

### コミットハッシュ: `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` (Upstream v7.0.1 準拠)

上流 `superpowers-original` を `bb92a77`（v7.0.0）から `2ce8aa1`（Release v7.0.1: brainstorming retune, skills that better survive compaction, contribution templates）へ進めました。3つの配布マニフェストは `1.12.4` から `1.12.5` に揃えて更新。

**同期・アップデート済みスキル:**

*   `brainstorming` (実装前の必須手順を明文化: 手法の提示 → デザイン文書 → 承認 → writing-plans 起動、「実装ではない2つ」の明示、`Look Before You Ask`（聞く前に見る）セクション追加、最初のメッセージの2分岐化（要求済み/未要求）とブレインストーミング要求の有無による締め方の分岐、スキル引用禁止の一文追加、質問指針を「具体的でソクラテス的な質問」へ刷新、「内側で広く考える」を「手法の提示」に刷新、ビジュアル確認後のモックアップ添付規律維持、規模テーブルを2行化しデザイン文書に Approaches 部分を必須化、デザイン文書カバレッジへの「手法」追加、小変更の短いデザインの明文化、ビルダーチェックをプロジェクト限定に変更、HARD-GATE をデザイン文書承認（小変更＝短い文書／プロジェクト＝完全な文書）への統一、Red Flags の1行変更・1行追加・1行修正。再生 (Play It Back) の推測表示を「あなたの提案＋理由」へ更新)
*   `executing-plans` (上流削除に追従し「実行例 (Example Workflow)」セクションを削除)
*   `subagent-driven-development` (場面別 references 化: `references/fix-loop.md`・`final-review.md`・`preflight.md`・`resuming.md`・`batching.md`・`handling-reports.md`・`cannot-verify.md` を新規配置。SKILL.md の該当セクション（既存台帳確認・衝突スキャン・同じ形の小さな作業・ステータスハンドリング・差分から検証不能・修正ループ・最終レビュー＋締め処理）を参照指示に刷新し、「実行例」を削除、「使用するテンプレートとスクリプト」に場面別参照一覧を追加。機械可読トークン `Task <N>: ...` `Ruling: <...>` は原文維持)
*   `writing-skills` (同様の references 化: `references/discovery.md`・`bulletproofing.md`・`flowcharts.md` を新規配置。`anthropic-best-practices.md`・`persuasion-principles.md`・`graphviz-conventions.dot`・`testing-skills-with-subagents.md` を `references/` へ移動し、ファイル内の参照先を更新。SKILL.md は「SKILL.md の執筆」「フローチャート」「正当化に対する防弾化」の参照指示に刷新し、「知見の蒸留 (Observations)」節はローカル運用への適応として維持)
*   `diagnosing-superpowers` (承認ゲートに「プレースホルダの要約のまま issue やコメントを作成しない」を追加、`references/github-issues.md` を `bug_report.md` テンプレート・`bug` ラベルへ更新、`templates/issue.md` に「このレポートの提出者（必須）」「人間による要約（必須、200語未満）」セクション追加、superpowers 非再現確認の記述式化、フッターの記載先更新)

**上流で確認済み・対象外:**

*   上流 `.github` のコントリビューションテンプレ刷新（`diagnosis_report.md` の廃止と `bug_report.md`・`platform_support.md`・`feature_request.md`・`PULL_REQUEST_TEMPLATE.md` の導入・更新）、`AGENTS.md`・`README.md`・`RELEASE-NOTES.md`・各プラグインマニフェストのバージョンタグ更新は上流リポジトリのインフラであり、スキル移植対象外。
*   上流 `tests/skill-size/test-skill-size.sh`（SKILL.md 20,000 バイト上限ゲート。Claude Code がコンパクション後にスキルを切り詰める仕様 #2481 への対策）は移植しない。日本語はバイト幅が英字より大きく、意味を保った翻訳では `writing-skills`（約25.6KB）・`executing-plans`（約21.7KB）が上限を超過する。本リポジトリの対象環境には Claude Code 特有の切捨てがなく、意味パリティを優先するためこのゲートを採用しない。

**検証範囲:** リポジトリ既存テスト `tests/test_finish_check.mjs`(7件) / `tests/test_task_brief.mjs`(5件) / `tests/test_hook_output.mjs` / `tests/test_pre_push_hook.mjs` 全 pass、`git diff --check`、3配布マニフェストのバージョン一致（`1.12.5`）と `scripts/finish_check.mjs` のゲート pass、移動・新規ファイルの参照整合確認、`requesting-code-review` の `code-reviewer.md` に基づく読み取り専用レビュー（Important 2件・Minor 5件を指摘され、discovery.md 命名指針の復元・誤字修正・モデル選択規則の復元等として全件修正し、スコープ付き再レビューで承認）。

スキル本文の実ロード実行テストは未実施。
