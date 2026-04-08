# フラクタルな原子性に基づくスキルアップデート・プロトコル 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、`subagent-driven-development` スキルを使用し、各タスク完了後に `code-reviewer` によるレビューを受けてください。

**目標:** スキル移植とアップデートのプロセスに「フラクタルな原子性」を導入し、1つのドキュメント内の微細な変更単位（関心事）ごとに人間がレビューできる体制を物理的に確立する。

**アーキテクチャ:** 
1. `port-superpowers-skill/SKILL.md` の SOP を「原子的な繰り返しループ」構造に書き換える。
2. `.gemini/observations/GEMINI.md` (L4) に、プロジェクト全体の行動原理としてフラクタルな原子性の規律を追加する。
3. 実装作業自体において、1つの `replace` 呼び出しごとに `git diff` を提示し、レビューを受ける。

**技術スタック:** Gemini CLI (replace, run_shell_command, code-reviewer)

---

### タスク 1: SOP の更新 (port-superpowers-skill)

**ファイル:**
- 変更: `.gemini/skills/port-superpowers-skill/SKILL.md`

**ステップ 1: アップデート・プロトコルのステップ3を「原子的な繰り返しループ」に書き換える**

修正内容（デザイン 2.1 参照）：
- 従来の「実装と知見の同期」を「フラクタルな原子性に基づく実装 (Atomic Execution)」に改称。
- 1. 単一関心事の選択、2. ターゲットを絞った更新、3. 物理的差分の提示、4. 人間によるレビューゲート、5. 知見の同期 の5つの明示的なステップを記述。

**ステップ 2: 差分の確認とレビューの依頼**

実行: `git diff .gemini/skills/port-superpowers-skill/SKILL.md`
期待値: 変更内容がデザイン仕様と一致している。

**ステップ 3: code-reviewer による検証**

実行: `code-reviewer` を起動し、この SOP の変更がプロジェクトの整合性を保っているか確認する。

---

### タスク 2: プロジェクト全体知見の追加 (GEMINI.md)

**ファイル:**
- 変更: `.gemini/observations/GEMINI.md`

**ステップ 1: 「フラクタルな原子性の遵守」等の規律を追加する**

修正内容（デザイン 2.2 参照）：
- 「フラクタルな原子性の遵守」「物理的証拠による共鳴」「効率より規律」の3項目を追加。

**ステップ 2: 差分の確認とレビューの依頼**

実行: `git diff .gemini/observations/GEMINI.md`
期待値: 規律が正確に記載されている。

**ステップ 3: code-reviewer による検証**

実行: `code-reviewer` を起動し、新しい規律が既存の原則と衝突していないか確認する。

---

### タスク 3: 変更の確定と完了の定義 (DoD)

**ステップ 1: まとめてコミットする**

実行:
```bash
git add .gemini/skills/port-superpowers-skill/SKILL.md .gemini/observations/GEMINI.md
git commit -m "feat: フラクタルな原子性に基づくスキルアップデート・プロトコルを実装する"
```

**ステップ 2: 完了報告**

- 全てのレビューが完了し、規律が適用されたことを報告する。
