# session-coordination 実装計画 [修正版2]

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `scripts/gemini_sub.py` を活用し、親エージェントがサブセッションの SPAWN (起動) / REPORT (報告) / IMPORT (回収) のライフサイクルを迷いなく管理できるスキルを構築する。

**アーキテクチャ:**
- `scripts/gemini_sub.py` のラッパーとして `SKILL.md` を定義。
- **Gemini オリジナル設計**: 外部からの移植ではなく、Gemini CLI の特性（コンテキスト管理）に最適化したネイティブスキルとして構築する。
- **Hybrid Pattern**: スクリプトが `task.md` の物理的な構造（YAML）を生成し、AI エージェントがその中身（背景、詳細、制約）を文脈に基づいて肉付けする。
- **往復チケット原則**: SPAWN 時に、子セッションの成果を回収するための `import` コマンドを必ず提示する。

**技術スタック:**
- Gemini CLI Skill (Markdown + AI Prompt)
- Python 3.x (`scripts/gemini_sub.py`)
- Git Worktrees (実行環境として推奨)

---

### タスク 1: フィーチャーブランチの作成とスキルの認識

**ファイル:**
- 作成: `.gemini/skills/session-coordination/SKILL.md`

**ステップ 1: ブランチの作成**

実行: `git checkout -b feat/add-session-coordination-skill`

**ステップ 2: スケルトンの作成**

`.gemini/skills/session-coordination/SKILL.md` を作成し、基本構造を定義。親エージェントとしての「振る舞い（文脈からSPAWNを判断する等）」を記述する。

**ステップ 3: スキルの認識（重要）**

実行: `gemini --resume latest` 
期待値: 親セッションが再起動され、`session-coordination` が `activate_skill` 可能になる。

**ステップ 4: コミット**

```bash
git add .gemini/skills/session-coordination/SKILL.md
git commit -m "feat: session-coordination スキルのスケルトンを作成し認識させる"
```

---

### タスク 2: SPAWN (起動) と指示書への肉付け

**ファイル:**
- 変更: `.gemini/skills/session-coordination/SKILL.md`

**ステップ 1: 文脈駆動 SPAWN のプロンプト定義**

現在の会話履歴から `work_dir`, `tag`, `mission` を特定して `gemini-sub spawn` を実行するよう、親エージェントへの指示を記述。

**ステップ 2: 指示書（task.md）への背景追記プロセスの定義**

`spawn` 実行後、生成された `task.md` を `read_file` し、現在のセッションしか持ち得ない背景情報や詳細な設計意図を `write_file` または `replace` で追記する手順を定義。

**ステップ 3: BOOT & IMPORT コマンドの提示テンプレート**

デザインドキュメントに従い、クリーン起動（--resume なし）のための BOOT コマンドと、戻りチケットとしての IMPORT コマンドを提示するテンプレートを定義。

**ステップ 4: コミット**

```bash
git commit -am "feat: 文脈駆動 SPAWN と指示書への肉付けプロセスを定義する"
```

---

### タスク 3: REPORT & IMPORT (成果の回収)

**ファイル:**
- 変更: `.gemini/skills/session-coordination/SKILL.md`

**ステップ 1: REPORT プロンプト（子セッション向け）の定義**

子エージェントがタスク完了時に行うべき「聖典の読解と報告」フローを定義する。
1. `read_file` でワークディレクトリ内の `task.md` を読み込む。
2. YAML Frontmatter から `task_id` を正確に抽出する。
3. `gemini-sub report <TASK_ID>` を実行し、成果を確定させる。
この一連の流れを、子エージェントへの「初期命令（メタプロンプト）」としてスキルに組み込む。

**ステップ 2: IMPORT 処理（親セッション向け）の定義**

親エージェントが `gemini-sub import <TASK_ID>` の YAML 出力をパースし、成果を要約・マージ・クリーンアップ（ワークツリー削除の提案）を行うフローを定義。

**ステップ 3: コミット**

```bash
git commit -am "feat: 成果の報告(REPORT)と回収(IMPORT)フローを定義する"
```

---

### タスク 4: 統合検証 (E2E Test)

**ファイル:**
- 作成: `tests/manual_gpac_verification.md`

**ステップ 1: 手動検証手順の記述**

1. `using-git-worktrees` でテスト用ワークツリーを作成。
2. 本スキルを `activate_skill` し、実際に `spawn` を実行。
3. `task.md` に正しく背景が追記されているか確認。
4. 提示されたコマンドで別の端末から子セッションを起動し、成果をコミットして `report` を実行。
5. 親セッションで `import` を実行し、成果が反映されるか確認。

**ステップ 2: コミット**

```bash
git add tests/manual_gpac_verification.md
git commit -m "test: GPAC ライフサイクルの手動検証手順を追加する"
```

---

### タスク 5: 仕上げとマージ

**ステップ 1: 振り返りと GEMINI.md への追記**

「Hybrid Pattern」における AI の役割についての知見を記録。

**ステップ 2: メインブランチへのマージとクリーンアップ**

```bash
git checkout main
git merge --no-ff feat/add-session-coordination-skill
git branch -d feat/add-session-coordination-skill
```
