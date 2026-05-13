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

## 今後の移植の記録方法

新しいスキルを移植する際には、以下のテンプレートを参考にこのドキュメントに追記してください。

### コミットハッシュ: `<移植元のコミットハッシュ>`

**移植済みスキル:**

*   `<移植したスキル名>`
