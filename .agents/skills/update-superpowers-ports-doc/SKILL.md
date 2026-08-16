---
name: update-superpowers-ports-doc
description: 移植したSuperpowersスキルと移植元のコミットハッシュをdocs/superpowers_ports.mdに記録する場合に使用します。Pi, Antigravity, Claude Code などの各プラットフォーム環境で実行可能です。
---

# Superpowersスキル移植記録ドキュメント更新スキル

## 概要

このスキルは、`docs/superpowers_ports.md` を更新し、移植されたSuperpowersスキルとその移植元コミットハッシュの記録を自動化します。これにより、移植履歴の一貫性を保ち、手動での更新忘れを防ぎます。
Pi, Antigravity CLI (agy), Claude Code, Gemini CLI などの多様なエージェント環境（プラットフォーム）で実行可能です。

## いつ使用するか

*   Superpowersスキルの移植が完了し、`docs/superpowers_ports.md` にその情報を記録する必要がある場合。
*   特定のコミットハッシュの下に、新しく移植されたスキル名を追加する場合。

## 実装手順 (Platform Independent Protocol)

このスキルは、使用しているエージェント環境（Pi, Antigravity, Claude Code 等）の標準ツールを用いて、以下のステップで `docs/superpowers_ports.md` を更新します。

各操作でどの具象ツールを使用するかについては、`skills/using-superpowers/references/` (Pi環境では `pi-tools.md`) のツールのマッピングを参照してください。

1.  **現在の内容の読み込み**:
    *   ファイル読み込みツール（Pi: `read`, Antigravity: `view_file`, Claude: `Read` など）で `docs/superpowers_ports.md` の内容を読み込みます。
2.  **コミットハッシュの検索と追記**:
    *   指定されたコミットハッシュ (`commit_hash`) がファイル内に存在するかどうかを確認します。（`commit_hash` が未指定の場合は、サブモジュール `superpowers-original` の HEAD コミットハッシュを Git コマンドで確認・取得します。）
    *   存在する場合: そのコミットハッシュのセクションの下（`**移植済みスキル:**` の箇条書きリスト）に、新しいスキル名 (`*   <skill_name>`) を追記します。
    *   存在しない場合: テンプレートに従い、新しいコミットハッシュのセクションをファイルの末尾に追加し、その下に新しいスキル名 (`*   <skill_name>`) を記述します。
3.  **ファイルの書き込み・更新**:
    *   ファイル編集/書き込みツール（Pi: `edit` / `write`, Antigravity: `replace_file_content` / `write_to_file`, Claude: `Edit` / `Write` など）で更新された内容を `docs/superpowers_ports.md` に保存します。
4.  **Git コミットの実行**:
    *   シェルコマンド実行ツール（Pi: `bash`, Antigravity: `run_command`, Claude: `Bash` など）を使用して以下のコマンドを実行します:
        `git add docs/superpowers_ports.md`
        `git commit -m "docs: <skill_name> の移植情報を superpowers_ports.md に追加する"`

## コアパターン

**入力**: `skill_name` (string), `commit_hash` (string, オプション)

**ロジックの概要**:

*   `docs/superpowers_ports.md` を読み込む（ファイル読み込みツールを使用）。
*   `commit_hash` を検索。
*   見つかった場合: `commit_hash` のセクションの下に `*   <skill_name>` を追加。
*   見つからなかった場合: テンプレートに従い、新しい `commit_hash` セクションと `*   <skill_name>` をファイルの末尾に追加。
*   更新された内容で `docs/superpowers_ports.md` を保存（ファイル書き込み/編集ツールを使用）。
*   `git add docs/superpowers_ports.md` および `git commit -m "docs: <skill_name> の移植情報を superpowers_ports.md に追加する"` を実行（シェルコマンド実行ツールを使用）。

