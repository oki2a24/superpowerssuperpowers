# Copilot CLI ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。Copilot CLI では、これらは以下のツールに対応します。

| スキルが要求するアクション | Copilot CLI での対応ツール |
|----------------------|----------------------|
| ファイルを読み込む | `view` |
| ファイルの作成 / 編集 / 削除 | `apply_patch` (Copilot CLI には個別の作成/編集/書き込みツールがありません) |
| シェルコマンドを実行する | `bash` |
| ファイル内容を検索する | `rg` (ripgrep; Copilot CLI には `grep` ツールがありません) |
| ファイル名で検索する | `glob` |
| URL の内容を取得する | `web_fetch` |
| Web 検索を実行する | `web_search` |
| スキルを呼び出す | `skill` |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | `agent_type: "general-purpose"` を指定した `task` （他に使用可能なタイプ: `explore`, `task`, `code-review`, `research`, `configure-copilot`） |
| 複数の並列派遣 | 1つの応答内に複数の `task` 呼び出し |
| サブエージェントの状態/出力/制御 | `read_agent`, `list_agents`, `write_agent` |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | `update_todo` |
| 計画モードへの移行 / 離脱 | 同等機能なし — メインセッション内にとどまります |

## 指示ファイル (Instructions file)

スキルで「あなたの指示ファイル (your instructions file)」と言及されている場合、Copilot CLI ではリポジトリルートの **`AGENTS.md`** を指します。`AGENTS.md` と `.github/copilot-instructions.md` の両方が存在する場合、Copilot は両方を読み込みます。

## 個人スキルディレクトリ

ユーザーレベルのスキルは **`~/.copilot/skills/`** に配置します。Copilot CLI は Codex や Gemini CLI と共有されるクロスランタイムのエイリアス **`~/.agents/skills/`** も認識します。各スキルは `SKILL.md`（`name` と `description` フロントマターを含む）を含むサブディレクトリです。

## 非同期シェルセッション (Async shell sessions)

Copilot CLI は持続的な非同期シェルセッションをサポートしています：

| ツール | 目的 |
|------|---------|
| `mode: "async"` (およびオプションで `detach: true`) を指定した `bash` | バックグラウンドで長時間のコマンドを開始し、`shellId` を返します |
| `write_bash` | 実行中の非同期セッションに入力（stdin）を送信します |
| `read_bash` | 非同期セッションからの出力を読み込みます |
| `stop_bash` | 非同期セッションを終了します |
| `list_bash` | すべてのアクティブなシェルセッションをリスト表示します |

## その他の Copilot CLI ツール

| ツール | 目的 |
|------|---------|
| `store_memory` | 将来のセッション用にコードベースに関する事実を永続化します |
| `report_intent` | 現在の意図（intent）で UI のステータスラインを更新します |
| `sql` | セッションの SQLite データベース（TODO、メタデータ）をクエリします |
| `fetch_copilot_cli_documentation` | Copilot CLI のドキュメントを検索します |
| GitHub MCP ツール (`github-mcp-server-*`) | ネイティブな GitHub API アクセス（Issue、PR、コード検索） |
