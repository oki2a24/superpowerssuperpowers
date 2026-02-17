---
name: update-superpowers-ports-doc
description: 移植したSuperpowersスキルと移植元のコミットハッシュをdocs/superpowers_ports.mdに記録する場合に使用します。
---

# Superpowersスキル移植記録ドキュメント更新スキル

## 概要

このスキルは、`docs/superpowers_ports.md` を更新し、移植されたSuperpowersスキルとその移植元コミットハッシュの記録を自動化します。これにより、移植履歴の一貫性を保ち、手動での更新忘れを防ぎます。

## いつ使用するか

*   Superpowersスキルの移植が完了し、`docs/superpowers_ports.md` にその情報を記録する必要がある場合。
*   特定のコミットハッシュの下に、新しく移植されたスキル名を追加する場合。

## 実装

このスキルは、以下のステップで `docs/superpowers_ports.md` を更新します。

1.  **現在の内容の読み込み**: `docs/superpowers_ports.md` の内容を読み込みます。
2.  **コミットハッシュの検索と追記**:
    *   指定されたコミットハッシュがファイル内に存在するかどうかを確認します。
    *   存在する場合、そのコミットハッシュのセクションの下（`**移植済みスキル:**` の箇条書きリスト）に、新しいスキル名を追記します。
    *   存在しない場合、新しいコミットハッシュのセクションをファイルの末尾に追加し、その下に新しいスキル名を記述します。
3.  **ファイルの書き込み**: 更新された内容で `docs/superpowers_ports.md` を上書きします。
4.  **Git コミット**: 変更をステージングし、「`docs: <スキル名> の移植情報を superpowers_ports.md に追加する`」のようなコミットメッセージでコミットします。

## コアパターン

**入力**: `skill_name` (string), `commit_hash` (string)

**ロジックの概要**:

*   `docs/superpowers_ports.md` を読み込む。
*   `commit_hash` を正規表現で検索。
*   見つかった場合: `commit_hash` のセクションの下に `*   <skill_name>` を追加。
*   見つからなかった場合: テンプレートに従い、新しい `commit_hash` セクションと `*   <skill_name>` をファイルの末尾に追加。
*   更新された内容で `docs/superpowers_ports.md` を `write_file` で書き込む。
*   `git add docs/superpowers_ports.md` および `git commit -m "docs: <skill_name> の移植情報を superpowers_ports.md に追加する"` を実行する。
