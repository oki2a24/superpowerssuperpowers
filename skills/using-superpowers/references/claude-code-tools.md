# Claude Code ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。Claude Code では、これらは以下のツールに対応します。

## ツール

| スキルが要求するアクション | Claude Code での対応ツール |
|----------------------|------------------|
| ファイルを読み込む | `Read` |
| 新しいファイルを作成する | `Write` |
| ファイルを編集する | `Edit` |
| シェルコマンドを実行する | `Bash` |
| ファイル内容を検索する | `Grep` |
| ファイル名で検索する | `Glob` |
| URL の内容を取得する | `WebFetch` |
| Web 検索を実行する | `WebSearch` |
| スキルを呼び出す | `Skill` |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | `Agent` （古いリリースでは `Task` という名前でした） |
| 複数の並列派遣 | 1つの応答内に複数の `Agent` 呼び出し |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | `TaskCreate`, `TaskUpdate`, `TaskList`, `TaskGet`; `claude -p` / Agent SDK 環境では `CLAUDE_CODE_ENABLE_TASKS=1` が設定されていない限り `TodoWrite` |
| バックグラウンドプロセス / サブエージェントのライフサイクル（出力の取得、停止） | `TaskOutput`, `TaskStop` — これらは上記の TODO ツールとは区別され、実行中のシェル、エージェント、リモートセッションに適用されます |

## 指示ファイル (Instructions file)

スキルで「あなたの指示ファイル (your instructions file)」と言及されている場合、Claude Code では **`CLAUDE.md`** を指します。Claude Code はカレントワークディレクトリから親ディレクトリに向かって遡り、見つかったすべての `CLAUDE.md` および `CLAUDE.local.md` を連結します。標準的な配置場所は以下の通りです：

| スコープ | 場所 |
|-------|----------|
| プロジェクト (チーム共有) | `./CLAUDE.md` または `./.claude/CLAUDE.md` |
| ユーザーグローバル | `~/.claude/CLAUDE.md` |
| ローカルプライベート (gitignored) | `./CLAUDE.local.md` |
| 管理ポリシー (組織全体) | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS), `/etc/claude-code/CLAUDE.md` (Linux/WSL), `C:\Program Files\ClaudeCode\CLAUDE.md` (Windows) |

CLAUDE.md ファイルは `@path/to/file` インポート（相対パスまたは絶対パス、最大5ホップ深さまで）を使用して追加コンテンツを取り込めます。サブディレクトリの `CLAUDE.md` ファイルも自動的に検出され、Claude Code がそれらのサブディレクトリ内のファイルを読み込む際にオンデマンドでロードされます。

Claude Code は `AGENTS.md` を直接読み込み**ません**。他のエージェント用にプロジェクトで `AGENTS.md` が既に維持されている場合は、`CLAUDE.md` からそれをインポートし、両方のランタイムが同じ指示を共有できるようにします：

```markdown
@AGENTS.md

## Claude Code

(Claude-Code 固有の指示をここに記述)
```

パスごとのルール設定や大規模プロジェクトの組織化については、`.claude/rules/` を参照してください（ルールは `paths` フロントマターを介して特定ファイルにスコープ化でき、オンデマンドでロードされます）。

## 個人スキルディレクトリ

ユーザーレベルのスキルは **`~/.claude/skills/`** に配置します。各スキルは `SKILL.md`（`name` と `description` フロントマターを含む）およびサポートファイルを含むサブディレクトリです。Claude Code は現在、Codex、Copilot CLI、Gemini CLI が読み込むクロスランタイムパス `~/.agents/skills/` を認識しません。将来クロスランタイムサポートに依存する場合は、[公式スキルドキュメント](https://code.claude.com/docs/en/skills) を確認してください。
