# Gemini CLI ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。Gemini CLI では、これらは以下のツールに対応します。

| スキルが要求するアクション | Gemini CLI での対応ツール |
|----------------------|----------------------|
| ファイルを読み込む | `read_file` |
| 一度に複数のファイルを読み込む | `read_many_files` |
| 新しいファイルを作成する | `write_file` |
| ファイルを編集する | `replace` |
| シェルコマンドを実行する | `run_shell_command` |
| ファイル内容を検索する | `grep_search` |
| ファイル名で検索する | `glob` |
| ファイルとサブディレクトリの一覧を表示する | `list_directory` |
| URL の内容を取得する | `web_fetch` |
| Web 検索を実行する | `google_web_search` |
| スキルを呼び出す | `activate_skill` |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | `agent_name: "generalist"` を指定した `invoke_agent` （チャット構文 `@generalist` 経由でも呼び出し可能 — [サブエージェントサポート](#サブエージェントサポート)を参照） |
| 複数の並列派遣 | 1つの応答内に複数の `invoke_agent` 呼び出し |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | `write_todos` (ステータス: pending, in_progress, completed, cancelled, blocked) |

## 指示ファイル (Instructions file)

スキルで「あなたの指示ファイル (your instructions file)」と言及されている場合、Gemini CLI では **`GEMINI.md`** を指します。Gemini CLI は `GEMINI.md` を階層的にロードします：グローバル（`~/.gemini/GEMINI.md`）、ワークスペースディレクトリおよびその親ディレクトリのプロジェクトレベルファイル、そしてツールがそのディレクトリ内のファイルにアクセスした際のサブディレクトリ `GEMINI.md` ファイル。

## 個人スキルディレクトリ

ユーザーレベルのスキルは **`~/.gemini/skills/`** に配置し、**`~/.agents/skills/`** はクロスランタイムのエイリアス（Codex および Copilot CLI と共有）となります。両方のディレクトリが同じスコープに存在する場合、`.agents/skills/` が優先されます。各スキルは `SKILL.md`（`name` と `description` フロントマターを含む）を含むサブディレクトリです。

## サブエージェントサポート

Gemini CLI は `agent_name` と `prompt` パラメータを受け取る `invoke_agent` ツールを通じてサブエージェントを派遣します。同じ派遣処理はチャット構文ショートカットとしても利用可能です：`@generalist <prompt>` と入力することは、`agent_name: "generalist"` を指定して `invoke_agent` を呼び出すことと同等です。組み込みのエージェント名には `generalist`, `cli_help`, `codebase_investigator`, および (ブラウザツールが有効な場合) `browser_agent` が含まれます。

スキルは `Subagent (general-purpose):` で派遣を行い、プロンプトテンプレートファイル（例: `superpowers:subagent-driven-development` の `./implementer-prompt.md`）を参照するか、インラインプロンプトを提供します。Gemini CLI においては以下のように対応させます：

| スキルの派遣形式 | Gemini CLI での対応操作 |
|---------------------|----------------------|
| `*-prompt.md` テンプレートを参照する場合 (implementer, task-reviewer, code-reviewer など) | テンプレートに値を埋め込み、`agent_name: "generalist"` と埋め込み済みプロンプトを指定して `invoke_agent` を実行 |
| `superpowers:requesting-code-review` の `./code-reviewer.md` を参照する場合 | `agent_name: "generalist"` と埋め込み済みレビューテンプレートを指定して `invoke_agent` を実行 |
| インラインプロンプト（テンプレート参照なし） | `agent_name: "generalist"` とインラインプロンプトを指定して `invoke_agent` を実行 |

### プロンプトの埋め込み (Prompt filling)

スキルは `{WHAT_WAS_IMPLEMENTED}` や `[FULL TEXT of task]` のようなプレースホルダーを含むプロンプトテンプレートを提供します。完全なプロンプトを `invoke_agent` に渡す前に、すべてのプレースホルダーを埋めてください。プロンプトテンプレート自体にエージェントの役割、レビュー基準、期待される出力フォーマットが含まれており、サブエージェントはそれに従います。

### 並列派遣 (Parallel dispatch)

Gemini CLI は並列サブエージェント派遣をサポートしています。1つの応答内に複数の `invoke_agent` 呼び出しを発行する（または1つのプロンプト内に複数の `@generalist` 呼び出しを入れる）ことで、独立したサブエージェントの作業を並列実行できます。依存関係のあるタスクは逐次実行を保ちますが、単に履歴をシンプルに保つという理由だけで独立したサブエージェントタスクを直列化しないでください。

## その他の Gemini CLI ツール

以下のツールは Gemini CLI 固有のものです：

| ツール | 目的 |
|------|---------|
| `save_memory` (レガシー) | `experimental.memoryV2 = false` の際にセッション間で事実を永続化します |
| `get_internal_docs` | Gemini CLI にバンドルされているドキュメントを検索します |
| `ask_user` | ユーザーに構造化された質問を提示します（テキスト / 単一選択 / 複数選択） |
| `enter_plan_mode` / `exit_plan_mode` | 読み取り専用の計画モードへの切替および離脱を行ないます |
| `update_topic` | 現在の会話のトピック / 戦略的意図のメタデータを更新します |
| `complete_task` | Gemini サブエージェントが完了したことをシグナルし、その結果を親エージェントに返します |
| `tracker_create_task`, `tracker_update_task`, `tracker_get_task`, `tracker_list_tasks`, `tracker_add_dependency`, `tracker_visualize` | 依存関係と視覚化をサポートする高機能なタスクトラッカー |
| `read_mcp_resource`, `list_mcp_resources` | MCP リソースへのアクセス |
