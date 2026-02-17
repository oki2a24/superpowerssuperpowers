# Gemini CLI エージェント スキル移植プロジェクト

## 目的と概要

このリポジトリは、Gemini CLIエージェントが、[obra/superpowers](https://github.com/obra/superpowers)からスキルを移植し、運用記憶を構築するためのプロジェクトです。エージェントは、この運用記憶を通じて得られた知見、作業のベストプラクティス、および特定のルールを永続的に記録し、将来のタスク実行に役立てます。

## 移植元リポジリの管理

移植元の `obra/superpowers` リポジリは、`superpowers-original` という名前の Git サブモジュールとして管理されています。これにより、移植元の特定のバージョンを正確に参照し、本リポジリのバージョン管理と独立して更新することが可能です。

### サブモジュールの初期化と更新

本リポジリをクローンした後、以下のコマンドでサブモジュールを初期化し、内容を取得します。

```bash
git submodule update --init --recursive
```

### サブモジュールの特定のコミットハッシュへの固定

`superpowers-original` サブモジュールは、移植作業に使用している特定のコミットハッシュに固定することが可能です。これにより、移植作業の再現性を保証しています。

サブモジュールが現在参照しているコミットハッシュを確認するには、以下のコマンドを使用します。

```bash
git submodule status superpowers-original
```

## 移植手順

TODO: ここにスキル移植の手順を記述します。移植元リポジリの参照方法を含めます。

## 移植元のアップデートに追従する方法

`superpowers-original` サブモジュールのコミットハッシュを更新し、移植元の最新の変更に追従するには、以下の手順を実行します。

1.  `superpowers-original` ディレクトリに移動します。
    ```bash
    cd superpowers-original
    ```
2.  リモートリポジリから最新の変更をプルします。
    ```bash
    git pull origin main # または、適切なブランチ
    ```
3.  親リポジリに戻ります。
    ```bash
    cd ..
    ```
4.  サブモジュールの変更をステージングし、コミットします。
    ```bash
    git add superpowers-original
    git commit -m "chore: Update superpowers-original submodule to latest commit"
    ```
5.  必要に応じて、特定のコミットハッシュに再度固定することも可能です。
