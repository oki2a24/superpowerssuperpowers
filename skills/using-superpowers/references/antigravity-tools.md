# Antigravity CLI (`agy`) ツールマッピング

スキルはアクション（「サブエージェントを派遣する」「TODOを作成する」「ファイルを読み込む」など）で表現されます。Antigravity CLI (`agy`) では、これらは以下のツールに対応します。

| スキルが要求するアクション | Antigravity CLI での対応ツール |
|----------------------|----------------------|
| ファイルを読み込む | `view_file` |
| 新しいファイルを作成する | `write_to_file` |
| ファイルを編集する | `replace_file_content` |
| ファイルの複数箇所を一度に編集する | `multi_replace_file_content` |
| シェルコマンドを実行する | `run_command` |
| ファイル内容を検索する | `grep_search` |
| ファイル名で検索する / ディレクトリ一覧を表示する | `list_dir` (専用のglobツールはないため、`list_dir` と `grep_search` を組み合わせる) |
| URL の内容を取得する | `read_url_content` |
| Web 検索を実行する | `search_web` |
| 人間（ユーザー）に構造化された質問をする | `ask_question` |
| サブエージェントを派遣する (`Subagent (general-purpose):` テンプレート) | 組み込みの `TypeName` を指定して `invoke_subagent` を呼ぶ — フル機能の作業には `self`、読み取り専用には `research` を使用（[サブエージェントサポート](#サブエージェントサポート)を参照） |
| 複数の並列派遣 | 1回の `invoke_subagent` 呼び出しの `Subagents` 配列に複数エントリーを指定 |
| タスクのトラッキング（「TODOを作成する」「完了マークをつける」） | **タスクアーティファクト** — `IsArtifact: true` および `ArtifactType: "task"` を指定した `write_to_file` （[タスクのトラッキング](#タスクのトラッキング)を参照）。背景プロセスを管理する `manage_task` ではない。 |

## スキルの呼び出し — `SKILL.md` を読み込む

Antigravity は、セッション開始時にインストールされているすべてのスキルの `name` + `description` を提示しますが、**`Skill` / `activate_skill` ツールを持ちません**。スキルをロードするには、そのスキルが適用される際に **`view_file` を使用して `IsSkillFile: true` を設定し、`SKILL.md` を読み込みます**（例: `.../plugins/superpowers/skills/<skill-name>/SKILL.md` に対し `IsSkillFile: true` で `view_file` を実行）。
（`IsSkillFile` は、ファイルを編集・プレビューするためではなく、*その指示を実行する*ために読み込んでいることを agy に伝えるためのシグナルです。スキルをロードする際は必ず設定してください。）

これが本ハーネスにおける正しいスキルロードメカニズムです。「スキルファイルを手動で読み込むな」という一般的なルールは「プラットフォームのスキルロードメカニズムをバイパスするな」という意味であり、Antigravity においては `SKILL.md` を読み込むことこそがそのメカニズム自体です。したがって、これを読み込むことはルールに違反するのではなく、ルールに厳密に従う行為となります。

どのスキルが存在し、どのような目的で使われるかはセッション開始時にすでに把握できています。実行しようとする作業に説明が一致するスキルがある場合は、アクションを起こす前にそのスキルの `SKILL.md` を読み込んでください。

## サブエージェントサポート

Antigravity では `invoke_subagent` を使用し、`Subagents` 配列に `TypeName` を渡すことでサブエージェントを派遣します。以下の2つの `TypeName` が**組み込み**で用意されており、`define_subagent` を呼び出さずに直接使用できます：

- **`self`** — あなた自身の完全なクローンであり、あなたが持つすべてのツール（`write_to_file` / `replace_file_content` / `run_command` を含む）を保持します。汎用的な作業（実装、修正、ファイル編集やコマンド実行を伴うすべて）における安全なデフォルトです。
- **`research`** — 読み取り専用（ファイル読み込み、`grep_search`、Web/URL取得のみ。書き込みやコマンド実行アクセスなし）。変更を行えないサブエージェントを明示的に使用したい場合（調査や読み取り専用のレビューなど）に使用します。

カスタムシステムプロンプトや機能の組み合わせが必要な場合のみ `define_subagent` を呼び出してください：ファイル編集**および** `run_command` を許可するには `enable_write_tools: true` を設定し、ネストされた派遣には `enable_subagent_tools`、MCPには `enable_mcp_tools` を設定します。その後、定義した名前で呼び出します。（`manage_subagents` で実行中のサブエージェントのリスト表示や終了が行えます。）

スキルは `Subagent (general-purpose):` で派遣を行い、プロンプトテンプレートファイル（例: `superpowers:subagent-driven-development` の `./implementer-prompt.md`）を参照するか、インラインプロンプトを提供します。Antigravity においては以下のように対応させます：

| スキルの派遣形式 | Antigravity での対応操作 |
|---------------------|----------------------|
| 実装者スタイルの `*-prompt.md` テンプレート（コード記述、テスト実行） | テンプレートに値を埋め込み、`TypeName: "self"` と埋め込み済みプロンプトを指定して `invoke_subagent` を実行 |
| 読み取り専用レビューテンプレート (`task-reviewer`, `code-reviewer`, `requesting-code-review` の `./code-reviewer.md`) | `TypeName: "research"` と埋め込み済みレビューテンプレートを指定して `invoke_subagent` を実行 |
| インラインプロンプト（テンプレート参照なし） | `TypeName: "self"`（タスクが読み取り専用の場合は `"research"`）とインラインプロンプトを指定して `invoke_subagent` を実行 |

### プロンプトの埋め込み (Prompt filling)

スキルは `{WHAT_WAS_IMPLEMENTED}` や `[FULL TEXT of task]` のようなプレースホルダーを含むプロンプトテンプレートを提供します。完全なプロンプトを `invoke_subagent` に渡す前に、すべてのプレースホルダーを埋めてください。プロンプトテンプレート自体にエージェントの役割、レビュー基準、期待される出力フォーマットが含まれており、サブエージェントはそれに従います。

### 並列派遣 (Parallel dispatch)

1回の `invoke_subagent` 呼び出しの `Subagents` 配列に複数のエントリーを入れることで、独立したサブエージェントの作業を並列実行できます。依存関係のあるタスクは逐次実行を保ちますが、単に履歴をシンプルに保つという理由だけで独立したサブエージェントタスクを直列化しないでください。

## タスクのトラッキング

Antigravity には **todo / `TodoWrite` ツールが存在しません**（`manage_task` はバックグラウンドプロセスを管理するツール（`list`/`kill`/`status`/`send_input`）であり、チェックリストでは*ありません*）。スキルから todo リストの作成やタスクのトラッキングが指示された場合は、**タスクアーティファクト**を維持してください：`write_to_file` (`IsArtifact: true`, `ArtifactMetadata.ArtifactType: "task"`) で保存された Markdown チェックリストを作成し、進行に合わせて `replace_file_content` / `multi_replace_file_content` で編集します。

複数ステップのタスクを開始する際は、計画の全ステップを列挙したタスクアーティファクトを作成してください。各ステップが完了したら、アーティファクトを編集して完了マーク（`- [x]`）をつけます。計画が変更された場合はチェックリストを更新してください。常に最新の状態に保ちましょう。これは残りの作業に関する唯一の真実のソース（SSOT）となります。会話が長くなった場合は、各ステップを開始する前に再読み込みして確認してください。
