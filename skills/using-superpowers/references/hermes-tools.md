# Hermes Agent ツールマッピング

スキルは「サブエージェントを派遣する」「todo を作成する」「ファイルを読む」といったアクションで記述されています。Hermes Agent では次のツールに対応します。

## ツール

| スキルが要求するアクション | Hermes ツール |
|---|---|
| ファイルを読む | `read_file` |
| ファイルを作成する | `write_file` |
| ファイルを編集する（対象を絞ったパッチ） | `patch` |
| シェルコマンドを実行する | `terminal` |
| ファイル内容を検索する | `search_files` |
| ファイル名で検索する | `terminal` から `find` を使う |
| URL を取得・閲覧する | `web_extract(urls=[...])` |
| Web 検索をする | `web_search(query=...)` |
| サブエージェントを派遣する | `delegate_task(goal=..., context=..., toolsets=[...], role="leaf")` |
| タスクを追跡する | `todo` ツール |
| スキルを呼び出す | `skill_view("skill-name")` |

## 指示ファイル

スキルが「あなたの指示ファイル」と述べる場合、Hermes Agent ではプロジェクト内の `AGENTS.md`、またはグローバルの `~/.hermes/SOUL.md` を指します。

## スキルの呼び出し

Hermes Agent には `skill_view` と `skills_list` を含む `skills` ツールセットがあります。Superpowers スキルは次のように呼び出します。

```text
skill_view("brainstorming")
skill_view("test-driven-development")
```

`skill_view` がスキルを見つけられない場合（プラグインの登録が完了する前など）は、次のパスから `SKILL.md` を直接読み込みます。

```text
read_file(path="~/.hermes/plugins/superpowers/skills/<skill-name>/SKILL.md")
```

このフォールバックは、ネイティブなスキル読み込み機能を持たない他のハーネスと同じ考え方です。

## サブエージェントの派遣

分離したサブエージェントには `delegate_task` を使います。

```text
delegate_task(goal="...", context="...", toolsets=[...], role="leaf")
```

このツールが利用できない場合、存在しないツールを作り出さず、インラインで作業します。

## タスク追跡

セッション内のタスクには `todo` ツールを使います。複数エージェントのタスクボードには、利用可能なら `hermes kanban` CLI を使います。古い `TodoWrite` の記載もタスク追跡アクションとして扱います。
