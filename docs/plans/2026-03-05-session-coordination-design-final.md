# デザインドキュメント: Gemini Peer-Agent Coordination (GPAC) - `gemini-sub` [完全確定版]

**作成日**: 2026年3月5日  
**ステータス**: 承認済み (Approved)  
**ツール名**: `gemini-sub`

## 1. 背景と目的

Gemini CLI を用いた大規模開発において、単一のセッションで作業を続けるとコンテキストウィンドウが肥大化し、生成パフォーマンスの低下やトークン消費の増大を招く。これを解決するため、タスクごとに独立した「サブセッション」を隔離環境（Gitワークツリー）で立ち上げ、並行かつクリーンに作業を遂行するための連携プロトコルを定義する。

## 2. コア・コンセプト

- **ステートレス連携 (Stateless Coordination)**: 子セッションは親の履歴を引き継がず（`--resume` を使用せず）、最小限の指示書（`task.md`）からクリーンに開始する。
- **Single Source of Truth (SSOT)**: すべてのタスク指示と制約は `task.md` に集約され、エージェントはこれを「聖典」として読み込む。
- **タスク ID による管理**: Gemini の内部セッション ID には依存せず、スクリプトが生成する一意の「タスク ID」をディレクトリ名として通信（指示・報告）に使用する。
- **トレーサビリティ**: 親のプロジェクトパス、ブランチ名、および「タスク名（タグ）」をヒントとして記録し、ID が変わっても文脈を見失わない。
- **ランチャー抽象化**: 「ディレクトリ移動とクリーン起動」を行う **共通のペイロード** を生成し、環境変数 `GEMINI_SUB_LAUNCHER`（manual, tmux 等）に応じてデリバリする。自動起動に失敗した場合は手動表示へフォールバックする。

## 3. ワークフロー (ライフサイクル)

1.  **SPAWN (親)**: `gemini-sub spawn <work_dir> --tag <task_name>` を実行。
    - 一意のタスク ID を生成し、`~/.gemini/sub-sessions/<PROJ>/<TASK_ID>/task.md` を作成。
    - **出力 (BOOT)**: ワークツリーへの移動とクリーン起動を行うコマンドを提示/実行。
    - **出力 (IMPORT)**: 作業完了後に親セッションで実行すべき `gemini-sub import <TASK_ID>` を提示（リターンチケット）。
2.  **BOOT (子)**: サブセッション起動。
    - 初期プロンプトを受け取り、`read_file` で `task.md` を読み込み、ミッションと推奨スキルを把握。
3.  **WORK (子)**: **ミッションの遂行**。
    - `task.md` に定義された `mission` と `required_skills` に基づき、自律的にタスクを完遂し、成果を確定（コミット等）させる。
4.  **REPORT (子)**: `gemini-sub report` を実行。
    - `report.md` テンプレートを生成し、エージェントが知見（フィードバック・スキル改善案・失敗時の詳細）を記述。
5.  **IMPORT (親)**: `gemini-sub import <TASK_ID>` を実行。
    - 報告書を読み込み、要約を提示。親エージェントがマージ、クリーンアップ、ナレッジの永続化を代行。

## 4. データ形式 (YAML Frontmatter)

### `task.md` (指示書)
```yaml
---
task_id: <TIMESTAMP>-<RANDOM>
parent_project_root: <ABS_PATH>
parent_branch: <BRANCH_NAME>
parent_task_tag: <TASK_NAME>
work_dir: <ABS_PATH>
required_skills: []
mission: "..."
steps: []             # 推奨手順
constraints: []       # 制約事項
---
# タスク詳細
...
```

### `report.md` (報告書)
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

## 5. エラーハンドリングと安全性

- **絶対パスの原則**: プロンプトと指示書内のパスはすべて絶対パスとし、環境依存を排除する。
- **フォールバック**: 自動ランチャーが失敗した際は、必ず `manual` モードのコマンドを表示し、作業を中断させない。
- **ガードレール**: 初期プロンプトで「まず指示書を読め」というメタ的な強制を行う。
