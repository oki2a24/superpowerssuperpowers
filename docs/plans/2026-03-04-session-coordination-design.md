# デザインドキュメント: Gemini Peer-Agent Coordination (GPAC) - `gemini-sub`

**作成日**: 2026年3月4日  
**ステータス**: 承認済み (Approved)  
**ツール名**: `gemini-sub`

## 1. 背景と目的

Gemini CLI を用いた大規模開発において、単一のセッションで作業を続けるとコンテキストウィンドウが肥大化し、生成パフォーマンスの低下やトークン消費の増大を招く。これを解決するため、タスクごとに独立した「サブセッション」を隔離環境（Gitワークツリー）で立ち上げ、並行かつクリーンに作業を遂行するための連携プロトコルを定義する。

## 2. コア・コンセプト

- **ステートレス連携 (Stateless Coordination)**: 子セッションは親の履歴を引き継がず、最小限の指示書から開始する。
- **ファイルベース・ハンドシェイク**: `~/.gemini/sub-sessions/` を通信路（メールボックス）として使用。
- **人間中心の承認 (Human-in-the-loop)**: サブセッションの結果は、人間（上様）が確認した後に親セッションへ取り込む。
- **自己改善ループ**: 報告書に「親へのフィードバック」と「スキル改善案」を必須項目として含める。

## 3. アーキテクチャ

### 3.1. 通信用ディレクトリ構造 (Global Base)
システム全体の共通基盤として、ホームディレクトリ以下に配置する。
`~/.gemini/sub-sessions/<PROJECT_NAME>/<SESSION_ID>/`
- `task.md`: 親から子への指示書。
- `report.md`: 子から親への報告書。

### 3.2. データ形式 (YAML Frontmatter)

#### `task.md` (指示書)
```yaml
id: <SESSION_ID>
parent_session_id: <PARENT_ID>
project_root: <PATH>  # GEMINI.md を読みに行くパス
work_dir: <PATH>      # 作業を行うディレクトリ
required_skills: []   # 起動時に強制適用するスキル
mission: "..."        # 究極の目的
steps: []             # 具体的なタスクリスト
constraints: []       # 守るべき規約、スタイル、禁止事項
```

#### `report.md` (報告書)
```yaml
status: success | failure | partial
commits: []           # 作成されたコミットのリスト（複数可）
summary: "..."        # 親セッションに注入する作業要約
next_actions: []      # 次に親セッションで行うべきアクションの提案
parent_feedback: "..." # 指示の不備や改善点
skill_proposals: "..." # SKILL.md や GEMINI.md への反映案
blocker_details: "..." # (失敗時) 詰まった原因、試行錯誤のログ、助けが必要なポイント
```

## 4. ワークフロー (ライフサイクル)

1.  **SPAWN (親)**: `gemini-sub spawn` を実行。
    - `task.md` を生成。
    - **ランチャー抽象化 (Launcher Abstraction)**: 設定された起動コマンド（tmux, iTerm2 等のテンプレート）を介して新規タブを起動。未設定時は手動起動用コマンドを表示。
2.  **BOOT (子)**: サブセッション起動。
    - `task.md` を読み込み、`GEMINI.md` と `required_skills` をロード。
3.  **WORK (子)**: タスク実行。
    - 隔離環境で実装、テスト、コミットを行う。
4.  **REPORT (子)**: `gemini-sub report` を実行。
    - `report.md` を生成し、タブを開いたまま停止。
5.  **IMPORT (親)**: 人間が内容を確認後、親セッションで `gemini-sub import <ID>` を実行。
    - 報告内容を親のコンテキストに統合し、改善案を議論。
6.  **CLEAN**: 必要に応じて `gemini-sub clean` で一時ファイルを削除。

## 5. エラーハンドリング

- **失敗時の報告**: `status: failure` と共に、詰まったポイントとエラーログを報告し、親セッションでの共同デバッグへ繋げる。
- **規律の強制**: `required_skills` を通じて、TDD 等の重要なワークフローをサブセッションの開始時から保証する。

## 6. 実装フェーズへの移行

1.  **Phase 1**: `gemini-sub` 制御スクリプトの作成（Python）。
2.  **Phase 2**: `session-coordination` スキル (`SKILL.md`) の作成。
3.  **Phase 3**: グローバル配置と環境パスの設定。
4.  **Phase 4**: 実際のワークフローでの検証と微調整。
