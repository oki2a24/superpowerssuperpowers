# Codex ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。Codex では、これらは以下のツールに対応します。

| スキルが要求するアクション | Codex での対応 |
|----------------------|------------------|
| ファイルを読み込む | `shell` (例: `cat`, `head`, `tail`) — Codex はシェル経由でファイルを読み込みます |
| ファイルの作成 / 編集 / 削除 | `apply_patch` (作成・更新・削除用の構造化 diff) |
| シェルコマンドを実行する | `shell` |
| ファイル内容を検索する | `shell` (例: `grep`, `rg`) |
| ファイル名で検索する | `shell` (例: `find`, `ls`) |
| URL の内容を取得する | `curl` / `wget` を使用した `shell` — Codex にはネイティブな fetch ツールがありません |
| Web 検索を実行する | `web_search` (デフォルトで有効。`config.toml` のトップレベル `web_search` 設定で `live`, `cached`, `disabled` に設定可能) |
| スキルを呼び出す | スキルはネイティブにロードされます — 指示に従ってください |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | `spawn_agent` （[サブエージェント派遣にはマルチエージェントサポートが必要](#サブエージェント派遣にはマルチエージェントサポートが必要)を参照） |
| 複数の並列派遣 | 1つの応答内に複数の `spawn_agent` 呼び出し |
| サブエージェントの結果を待機する | `wait_agent` |
| 完了時にサブエージェントスロットを解放する | `close_agent` |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | `update_plan` |

## 指示ファイル (Instructions file)

スキルで「あなたの指示ファイル (your instructions file)」と言及されている場合、Codex ではプロジェクトルートの **`AGENTS.md`** を指します。Codex はグローバルコンテキストとして `~/.codex/AGENTS.md` も読み込み、`AGENTS.override.md`（プロジェクトツリー内または `~/.codex/` 内）が存在する場合はそれが優先されます。Codex は `project_doc_max_bytes`（デフォルト32 KiB）を上限として、プロジェクトルートからカレントワークディレクトリに向かって順に `AGENTS.md` ファイルを結合して読み込みます。

## 個人スキルディレクトリ

ユーザーレベルのスキルは **`$CODEX_HOME/skills/`**（デフォルトは `~/.codex/skills/`）に配置します。Codex はクロスランタイムパス **`~/.agents/skills/`**（Copilot CLI および Gemini CLI と共有）も読み込みます。両方のディレクトリが同じスコープに存在する場合、Codex は両方を個別のスキルカタログとして読み込みます（現在のCodexドキュメントにはそれらの優先順位の規定はありません）。各スキルは `SKILL.md`（`name` と `description` フロントマターを含む）を含むサブディレクトリです。

## サブエージェント派遣にはマルチエージェントサポートが必要

Codex の設定ファイル (`~/.codex/config.toml`) に以下を追加してください：

```toml
[features]
multi_agent = true
```

これにより、`dispatching-parallel-agents` や `subagent-driven-development` などのスキルで使用する `spawn_agent`、`wait_agent`、`close_agent` が有効になります。

互換性に関するメモ: `rust-v0.115.0` より前の Codex ビルドでは、生成されたエージェントの待機に `wait` を使用していました。現在の Codex では `wait_agent` を使用します。現在の `wait` はコードモードの `exec/wait`（`cell_id` で譲渡された実行セルを再開する）に属しており、エージェント結果取得用ツールではありません。

## 環境検出 (Environment Detection)

ワークツリーを作成したりブランチを完了させたりするスキルは、処理を進める前に読み取り専用の git コマンドで環境を検出する必要があります：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → 既にリンクされたワークツリー内です（作成をスキップ）
- `BRANCH` が空 → HEAD が分離しています（サンドボックスからブランチ作成/プッシュ/PRが不可）

各スキルがこれらのシグナルをどのように使用するかについては、`using-git-worktrees` のステップ0 および `finishing-a-development-branch` のステップ2 を参照してください。

## Codex アプリの完了処理 (Codex App Finishing)

サンドボックスによってブランチ/プッシュ操作がブロックされている場合（外部管理されたワークtreeでの分離 HEAD 状態）、エージェントはすべての作業をコミットし、アプリのネイティブコントロールを使用するようユーザーに案内します：

- **"Create branch"** — ブランチに名前を付け、アプリ UI 経由でコミット/プッシュ/PRを実行
- **"Hand off to local"** — ユーザーのローカルチェックアウトに作業を移管

エージェントは引き続きテストの実行、ファイルのステージング、ユーザーがコピーできる推奨ブランチ名・コミットメッセージ・PR説明の出力を行えます。
