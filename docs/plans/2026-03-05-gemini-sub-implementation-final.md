# gemini-sub (GPAC Phase 1 修正実装) 実装計画 [完全・詳細確定版 v2.1]

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`subagent-driven-development`スキルを使用してください。

**目標:** クリーンなセッション起動と指示書（`task.md`）による連携を実現する、外部依存のない Python 制御スクリプト `scripts/gemini_sub.py` を実装する。

---

### タスク 1: ユーティリティ関数（ID生成とペイロード作成）

**ファイル:**
- 変更: `scripts/gemini_sub.py`
- テスト: `tests/test_gemini_sub.py`

**ステップ 1: `generate_task_id() -> str` の実装 (TDD)**
- **要件**: `YYYYMMDD-HHMMSS-RAND4` (例: `20260305-123456-A1B2`) を生成。
**ステップ 2: `create_payload(work_dir: str, task_path: str) -> str` の実装 (TDD)**
- **要件**: `cd {work_dir} && gemini "GPAC Protocol: New sub-session. Read task: {task_path}"` というシェルコマンド文字列を生成。
**ステップ 3: コミット**

---

### タスク 2: `spawn` コマンドの実装

**仕様:**
- CLI: `python3 scripts/gemini_sub.py spawn <work_dir> --tag <tag>`
- メタデータ: `project_name` は `os.path.basename(os.getcwd())` から取得。

**ステップ 1: メタデータ取得の実装 (TDD)**
- `git branch --show-current` 等を `subprocess` で取得するロジックを検証。
**ステップ 2: `task.md` テンプレートの完全実装 (TDD)**
- パス: `~/.gemini/sub-sessions/{project_name}/{task_id}/task.md`
- 内容（設計書準拠）:
```markdown
---
task_id: <GENERATED_ID>
parent_project_root: <ABS_PATH>
parent_branch: <CURRENT_BRANCH>
parent_task_tag: <TAG_FROM_ARG>
work_dir: <ABS_PATH>
required_skills: []   # 起動時に意識すべきスキル
mission: "..."        # 究極の目的
steps: []             # 推奨手順
constraints: []       # 制約事項
---
# タスク詳細
...
```
**ステップ 3: ランチャーデリバリの実装 (TDD)**
- `GEMINI_SUB_LAUNCHER` (manual/tmux) に応じた出力。
- **重要**: 最後に必ず `gemini-sub import <task_id>` コマンドを提示。
**ステップ 4: コミット**

---

### タスク 3: `report` コマンドの実装

**仕様:**
- CLI: `python3 scripts/gemini_sub.py report <task_id>`
- **運用**: **AI（生成AI）が、指示書から得た自分の `task_id` を明示的に引数として渡して実行する。**
- 役割: 指定された ID でテンプレートをカレントディレクトリに生成。

**ステップ 1: `report.md` テンプレートの完全実装 (TDD)**
- パス: `./report.md`
- 内容（設計書準拠）:
```yaml
---
status: success | failure | partial
task_id: <TASK_ID>
commits: []           # 作成されたコミット
summary: "..."        # 作業要約
next_actions: []      # 親への提案
parent_feedback: "..." # 指示へのフィードバック
skill_proposals: "..." # 改善提案
blocker_details: "..." # 失敗時の詳細
---
# 実施報告
...
```
**ステップ 2: コミット**

---

### タスク 4: `import` コマンドの実装

**仕様:**
- CLI: `python3 scripts/gemini_sub.py import <task_id>`
- 役割: 指定された ID の報告書をパースし、親に要約を表示。

**ステップ 1: 報告書パースと整形表示の実装 (TDD)**
- ファイル探索: `~/.gemini/sub-sessions/{project_name}/{task_id}/report.md`
- **出力レイアウト (設計)**:
```text
[GPAC IMPORT REPORT: <TASK_ID>]
----------------------------------------
Status: <STATUS>
Summary: <SUMMARY>
Next Actions:
  - <ACTION1>
----------------------------------------
Feedback: <FEEDBACK>
Proposals: <PROPOSALS>
----------------------------------------
Commits: <COMMITS>
```
**ステップ 2: コミット**

---

### タスク 5: 最終インテグレーション検証

**スキル:** `verification-before-completion`

**ステップ 1: 結合テストの実施**
- 実際に `spawn` でタスクを作り、`report` を生成し、`import` で取り込むフローをダミーデータで実演。
- **AI が `report <ID>` を自発的に打つシミュレーション**を含む。
- 出力レイアウトが設計通りであることを最終確認。
