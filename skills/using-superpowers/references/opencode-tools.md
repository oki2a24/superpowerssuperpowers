# opencode ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。opencode では、これらは以下のネイティブツールに対応します。

| スキルが要求するアクション | opencode での対応ツール |
|----------------------|----------------------|
| ファイルを読み込む | `read` |
| ファイルを作成する | `write` |
| ファイルを編集する | `edit` |
| ファイルを削除する | `edit` で空にせず、`bash` の `rm` で削除 |
| シェルコマンドを実行する | `bash` |
| ファイル内容を検索する | `grep` （ripgrep ベース。大域の検索は `bash` の `rg`） |
| ファイル名で検索する | `glob` |
| URL の内容を取得する | `webfetch` |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | `task` ツールに `subagent_type: "general"`。コードベース探索には `subagent_type: "explore"` |
| 複数の並列派遣 | 1つの応答内に複数の `task` 呼び出し |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | `todowrite` |
| ユーザーに構造化質問を行う | `question` |
| スキルを呼び出す / 読み込む | opencode ネイティブの `skill` ツール |

> opencode には `apply_patch` ツールはありません。ファイルの作成は `write`、変更は `edit` で行います。
> opencode には `web_search` ツールがありません。Web 検索が必要な場合は `webfetch` でドキュメント URL を直接取得するか、`task` でサブエージェントに委譲してください。

## 指示ファイル (Instructions file)

スキルで「あなたの指示ファイル (your instructions file)」と言及されている場合、opencode ではリポジトリルートの **`AGENTS.md`** を指します（`CLAUDE.md` についても読み込みます）。opencode 起動時にカレントディレクトリから worktree ルートへ遡って読み込まれます。

## スキル (Skills)

opencode は `**/SKILL.md` を再帰検索してスキルを検出します。SuperpowersSuperpowers はプラグインの `config` フックを通じて `skills/` ディレクトリを `config.skills.paths` へ自動登録するため、symlink や手動の `skills.paths` 設定は不要です。

| 範囲 | 配置先 |
|------|---------|
| プロジェクトスキル | `.opencode/skills/<name>/SKILL.md` |
| 個人スキル | `~/.config/opencode/skills/<name>/SKILL.md` |
| 外部スキル（自動ロード） | `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md` |

## サブエージェント (Subagents)

opencode の `task` ツールは `subagent_type` でエージェントを選択します。組み込みの非隠しエージェントは `build`, `plan`, `general`, `explore` です。`subagent-driven-development` や `dispatching-parallel-agents` が指す `Subagent (general-purpose):` テンプレートは、`subagent_type: "general"` で呼び出します。
