# Skill Visual Templates 実装計画 (TDD for Docs 準拠)

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`subagent-driven-development`スキルを使用してください。

**目標:** `brainstorming` および `writing-plans` スキルの `SKILL.md` に AA テンプレートを追加し、設計の齟齬を物理的に排除する。`writing-skills` スキルの TDD プロセスを厳守する。

**アーキテクチャ:**
1.  **RED (Baseline)**: スキルなしの状態での「認知の齟齬」と「不適切な正当化」を言語化し、圧力シナリオを定義。
2.  **GREEN (Minimal Implementation)**: `## ローカル・アダプテーション (Gemini固有)` セクションに、承認された AA テンプレートを `IMPROVED_ON` / `REASON` 付きで追記。
3.  **REFACTOR (Verification)**: `activate_skill` による表示確認と、エスケープ崩れ等の修正。

**技術スタック:** Markdown, ASCII Art, `writing-skills` Discipline.

---

### タスク 1: RED フェーズ - ベースラインの振る舞い確認

**ファイル:** (設計書への追記)
- 変更: `docs/plans/2026-03-18-skill-visual-templates-design.md`

**ステップ 1: 圧力シナリオとベースラインの文書化**
複雑な状態遷移を持つシステムの設計を「テキストのみ」で行わせた場合に、エージェントがどのような「曖昧な表現」や「誤った正当化（例：テキストだけでも十分伝わる）」を使用するかを予測・記録する。

**ステップ 2: 失敗の確認**
現状のスキル（AA なし）では、構造の可視化が強制されていないことを物理的に確認する。

---

### タスク 2: GREEN フェーズ - brainstorming/SKILL.md の更新

**ファイル:**
- 変更: `.gemini/skills/brainstorming/SKILL.md`

**ステップ 1: ローカル・アダプテーション形式での追記**
`writing-skills` で定義された以下の正確な形式を末尾に追加する。

```markdown
## ローカル・アダプテーション (Gemini固有)
<!-- IMPROVED_ON: 2026-03-18 | REASON: 複雑な遷移や構造の設計時に、テキストのみでは認知の齟齬が生じやすいため、AAテンプレートを導入。 -->
### AIエージェントへの指示 (Gemini固有)
- **[イメージ] 図解の規律 (Visual Discipline)**: 設計案の提示には、必ず以下の AA テンプレートを参考に構造（状態遷移、データフロー、ディレクトリ構成等）を可視化せよ。

#### 1. 状態遷移図 (State Transition)
(設計書で承認された AA を記述)

#### 2. 直列・分岐フロー (Data Flow / Process)
(設計書で承認された AA を記述)

#### 3. 構造図 (Structure / Hierarchy)
(設計書で承認された AA を記述)
```

**ステップ 2: 検証**
`activate_skill(name="brainstorming")` を実行し、追加したセクションが正しく表示されることを確認。

---

### タスク 3: GREEN フェーズ - writing-plans/SKILL.md の更新

**ファイル:**
- 変更: `.gemini/skills/writing-plans/SKILL.md`

**ステップ 1: 同様の形式での追記**
`writing-plans` 特有の「タスク間の依存関係やデータフロー」を明示する文脈で、同様の AA テンプレートを追記する。

---

### タスク 4: REFACTOR フェーズ - 整合性確認と最終検証

**ステップ 1: 物理的な整合性確認**
`scripts/reset_skill.mjs` が存在し、追加した `## ローカル・アダプテーション (Gemini固有)` セクションを正しく認識・削除できるかを確認する（将来の移植元アップデートへの備え）。

**ステップ 2: 全体のコミット**
```bash
git add .gemini/skills/ docs/plans/
git commit -m "feat(skill): brainstorming と writing-plans に AA テンプレートを追加"
```
