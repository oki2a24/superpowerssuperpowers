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

### コミットハッシュ: `b7a8f76c8c5c7d8a6b4a2d8e4f5a3b2c1d0e9f8a` (Upstream b7a8f76 準拠)

**移植済みスキル:**

*   `brainstorming` (v1.7.0 update: HARD-GATE, 9-step checklist, Visual Companion, Spec Self-Review)
*   `systematic-debugging` (v1.7.3 update: Iron Law, Multi-component evidence collection, Architecture re-evaluation)

## 今後の移植の記録方法

新しいスキルを移植する際には、以下のテンプレートを参考にこのドキュメントに追記してください。

### コミットハッシュ: `<移植元のコミットハッシュ>`

**移植済みスキル:**

*   `<移植したスキル名>`
