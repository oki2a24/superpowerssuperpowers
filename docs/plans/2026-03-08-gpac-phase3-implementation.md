# 次世代セッション連携プロトコル (GPAC Phase 3) 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** セキュリティ境界を克服し、エージェントが「下書き（Draft）」を通じて安全かつ確実にセッション連携を行える API セットとワークフローを構築する。

**アーキテクチャ:** エージェントはワークスペース内で Markdown 下書きを作成し、`gemini-sub` スクリプトがそれを検証・正規化してグローバル領域へ移動（Handoff）させる。グローバル領域へのアクセスは抽象化された `show-*` コマンドを介して行う。

**技術スタック:** Python 3 (standard library), YAML (Frontmatter parsing)

---

### バリデーション仕様

実装に先立ち、各ドキュメントの必須項目と検証ルールを以下のように定義します。

**1. `spawn` (task.md) の検証ルール:**
- **必須項目**: `task_id`, `parent_task_tag`, `work_dir`, `mission`, `steps`
- **検証内容**:
    - YAML 構文が正しいこと。
    - `task_id` が文字列 `"PENDING"` であること（スクリプトによる置換を前提）。
    - `parent_task_tag`, `work_dir`, `mission` が空文字でないこと。
    - `steps` が非空のリスト形式であること。

**2. `report` (report.md) の検証ルール:**
- **必須項目**: `task_id`, `status`, `summary`, `commits`, `next_actions`
- **検証内容**:
    - YAML 構文が正しいこと。
    - `task_id` が文字列 `"PENDING"` であること（引数 `--id` での置換を前提）。
    - `status` が `success`, `failure`, `partial` のいずれかであること。
    - `summary` が空文字でないこと。
    - `commits`, `next_actions` がリスト形式であること。
    - **上書き保護**: 既存キュメント `report.md` が存在し、その `status` が `success` の場合は、同一 ID への再提出を拒否する。

---

### タスク 1: テンプレートの作成と配置

**ファイル:**
- 作成: `.gemini/skills/session-coordination/task_template.md`
- 作成: `.gemini/skills/session-coordination/report_template.md`

**ステップ 1: テンプレート抽出**
`scripts/gemini_sub.py` の `spawn`/`report` 内から Markdown 構造を抽出し、以下のパスに保存します。
- **入力**: `scripts/gemini_sub.py` の文字列リテラル
- **出力**: `.gemini/skills/session-coordination/task_template.md`, `report_template.md`

**ステップ 2: 内容の検証**
`read_file` で内容を確認し、`task_id: PENDING` などのプレースホルダが正しく含まれているか確認します。

**ステップ 3: コミット**
`git add .gemini/skills/session-coordination/*.md && git commit -m "feat: GPAC 下書き用テンプレートをスクリプトから抽出して追加"`

---

### タスク 2: YAML バリデーションヘルパーの実装 (TDD)

> **AIエージェントへの指示**: このタスクは `activate_skill(name="test-driven-development")` を使用して進めてください。

**ファイル:**
- 変更: `scripts/gemini_sub.py`
- テスト: `tests/test_gemini_sub.py`

**I/O 定義:**
- **入力**: Markdown 文字列、期待される必須キーのリスト。
- **出力**: 成功時はパース済み `dict`、失敗時は詳細なエラーメッセージ（例外）。

**ステップ 1: 失敗する単体テストを作成**
不正な YAML、必須キーの欠落、型不一致（リストであるべき箇所が文字列など）を網羅するテストを記述します。

**ステップ 2: 最小限の実装と検証**
`scripts/gemini_sub.py` に独立した `validate_frontmatter()` 関数を実装し、テストをパスさせます。

**ステップ 3: コミット**
`git commit -m "feat: gemini-sub に YAML バリデーションヘルパーを追加 (TDD)"`

---

### タスク 3: `show-*` コマンドの実装 (TDD)

> **AIエージェントへの指示**: このタスクは `activate_skill(name="test-driven-development")` を使用して進めてください。

**ファイル:**
- 変更: `scripts/gemini_sub.py`
- テスト: `tests/test_gemini_sub.py`

**I/O 定義:**
- **入力**: 引数 `show-task <task_id>`, `show-report <task_id>`、およびグローバル領域のファイル。
- **出力**: 標準出力（Markdown 全文）または標準エラー（エラーメッセージ）。

**ステップ 1: 失敗する機能テストを作成**
グローバル領域にテスト用ファイルを配置し、`show-task`/`show-report` がその内容を正しく出力すること、ファイル不在時に適切にエラー終了することをテストします。**※YAML検証自体のテストは含めない（タスク 2 で実施済みのため）。**

**ステップ 2: 最小限の実装と検証**
サブコマンドを実装し、テストをパスさせます。

**ステップ 3: コミット**
`git commit -m "feat: gemini-sub に show-task/show-report コマンドを追加 (TDD)"`

---

### タスク 4: Handoff 方式の `spawn` コマンド (TDD)

> **AIエージェントへの指示**: このタスクは `activate_skill(name="test-driven-development")` を使用して進めてください。

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**I/O 定義:**
- **入力**: 引数 `spawn <local_draft_path>`、ワークスペース内の下書きファイル。
- **出力**: 標準出力（TASK_ID 等）、グローバル領域への `task.md` 配置、ローカル下書きの削除。

**ステップ 1: 失敗するテストを作成**
下書きを渡し、バリデーション通過、**ID 置換**、グローバル移動、ローカル削除が行われることを期待するテストを作成します。

**ステップ 2: 最小限の実装と検証**
`spawn` を刷新し、タスク 2 のバリデーションヘルパーを組み込みます。

**ステップ 3: コミット**
`git commit -m "feat: gemini-sub spawn を Handoff 方式に刷新 (TDD)"`

---

### タスク 5: Handoff 方式の `report` コマンド (TDD)

> **AIエージェントへの指示**: このタスクは `activate_skill(name="test-driven-development")` を使用して進めてください。

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**I/O 定義:**
- **入力**: 引数 `report <local_draft_path> --id <task_id>`、ワークスペース内の報告書下書き。
- **出力**: 成功メッセージ、グローバル領域への `report.md` 配置、ローカル下書きの削除。
- **検証**: 既存の `report.md` が `status: success` の場合は上書き拒否。

**ステップ 1: 失敗するテストを作成**
下書きを渡し、バリデーション（status チェック含む）、**ID 置換**、グローバル移動、ローカル削除を検証するテストを作成します。また、完了済みタスクへの上書き拒否もテストします。

**ステップ 2: 最小限の実装と検証**
`report` を刷新します。タスク 4 の移動・置換ロジックを再利用します。

**ステップ 3: コミット**
`git commit -m "feat: gemini-sub report を Handoff 方式に刷新 (TDD)"`

---

### タスク 6: `list` コマンドの実装 (TDD)

> **AIエージェントへの指示**: このタスクは `activate_skill(name="test-driven-development")` を使用して進めてください。

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**I/O 定義:**
- **入力**: 引数 `list`
- **出力**: 標準出力に「進行中のタスク ID」と「タグ」を一覧表示。

**ステップ 1: 失敗するテストを作成**
複数セッションの ID/タグ列挙を検証します。

**ステップ 2: 最小限の実装と検証**
`list` コマンドを実装します。

**ステップ 3: コミット**
`git commit -m "feat: gemini-sub list コマンドを追加 (TDD)"`

---

### タスク 7: スクリプトのリファクタリングと品質向上

> **AIエージェントへの指示**: 以下の観点を盛り込んでください。
> - **関心の分離**: ファイル操作ロジックと CLI プレゼンテーション層の分離。
> - **エラーハンドリングの統一**: `SystemExit` による一貫した終了ステータス管理。
> - **DRY**: `spawn` と `report` で重複する「一時ファイル読み込み・置換・移動」ロジックの共通化。

**ステップ 1: ロジックの集約**
重複する Handoff 手順を `handoff_document()` 等の汎用関数に抽出します。

**ステップ 2: リグレッションテストとコミット**
既存の TDD テストをすべて実行し、破壊がないことを確認してコミット。

---

### タスク 8: `session-coordination` スキルの更新

**ファイル**: `.gemini/skills/session-coordination/SKILL.md`

**ステップ 1: プロセスの更新**
高レイヤー API を使用した新しいワークフロー（Draft -> spawn/report -> show）を記述します。

**ステップ 2: コミット**
`git commit -m "docs: session-coordination スキルを Phase 3 プロトコルに更新"`

---

### タスク 9: 最終インテグレーションテスト (ワークツリー環境)

**ステップ 1: 隔離環境の作成と E2E 実行**
`using-git-worktrees` を使用してテスト専用環境を構築します。 `spawn` -> `show-task` -> `report` -> `import` の全行程を回す。

**ステップ 2: クリーンアップ**
ワークツリー削除と完了報告。
