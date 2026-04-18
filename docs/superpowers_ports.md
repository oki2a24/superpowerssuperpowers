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
*   `writing-skills` (Major sync: Upstream best practices, Mermaid conversion, Source Adaptation Guide in observations/writing-skills.md)
*   `testing-skills-with-subagents` (Professional Japanese translation, Terminology adaptation: generalist subagent, GEMINI.md)

## 今後の移植の記録方法

新しいスキルを移植する際には、以下のテンプレートを参考にこのドキュメントに追記してください。

### コミットハッシュ: `<移植元のコミットハッシュ>`

**移植済みスキル:**

*   `<移植したスキル名>`
