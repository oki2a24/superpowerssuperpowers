# Muse ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「todoを作成する」「ファイルを読み込む」など）で表現されます。Muse では、これらは以下のツールに対応します。

| スキルが要求するアクション | Muse での対応ツール |
|----------------------|------------------|
| ファイルを読み込む | `read_file` |
| 複数ファイルを読み込む | `read_file`（複数回呼び出し）または `search` |
| 新しいファイルを作成する | `write_file` |
| ファイルを編集する | `edit_file` |
| シェルコマンドを実行する | `bash` |
| ファイル内容を検索する | `search` |
| ファイル名で検索する | `glob` 指定の `search` |
| URL の内容を取得する | `web_fetch` |
| Web 検索を実行する | `web_search` |
| スキルを呼び出す | `skills/<name>/SKILL.md` に対する `read_file` またはネイティブのスキルツール |
| サブエージェントを派遣する（`Subagent (general-purpose):` テンプレート） | プロンプトを埋めて `subagent_spawn` |
| タスクのトラッキング（「todoを作成する」「完了マークをつける」） | `write_todos` または `bash` によるタスクファイル管理 |
| ユーザーに質問する | `request_user_input` |

## 指示ファイル

スキルで「あなたの指示ファイル」と言及されている場合、Muse ではプロジェクトルートの **`CLAUDE.md`** または **`AGENTS.md`** を指します。設定に応じて階層的に読み込まれます。

## スキルの起動

Muse は `muse skills` によるネイティブのスキルサポートを持ちます。Superpowers スキルを起動するには、その `SKILL.md` を読んで指示に従います。ブートストラップ（`using-superpowers`）はプラグインフックにより `SessionStart` で自動注入されます — 既に従っているため、再ロードしないでください。

## サブエージェントの派遣

隔離されたサブエージェントへの委任には `subagent_spawn` を使用します。派遣前にプロンプトテンプレート（例: `implementer-prompt.md`、`task-reviewer-prompt.md`）を埋めてください。サブエージェントツールが利用できない場合は、ツール呼び出しを捏造せず、作業をインラインで実行します。

## タスクトラッキング

チェックリストの追跡には `write_todos` を使用します。スキルチェックリストの各項目に todo を作成し、`in_progress` / `completed` を更新します。`write_todos` が利用できない場合は、`write_file` / `edit_file` で Markdown タスクファイルを管理します。
