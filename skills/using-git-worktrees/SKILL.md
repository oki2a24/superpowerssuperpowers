---
name: using-git-worktrees
description: "現在のワークスペースから隔離された作業環境をGitワークツリーでセットアップし、安全な開発を支援します。"
parameters:
  branch_name:
    type: string
    description: 新しいワークツリーを作成するブランチ名
    required: true
---

# Gitワークツリーの利用

## 概要

Gitワークツリーを使用して隔離されたワークスペースをセットアップします。
Gitワークツリーは、同じリポジトリを共有しながらも隔離された作業環境を作成し、ブランチを切り替えることなく複数のブランチで同時に作業することを可能にします。

**コア原則:** 系統的なディレクトリ選択と安全性検証により、信頼性の高い隔離を実現します。

## ディレクトリ選択プロセス

以下の優先順位に従って、ワークツリーを作成するディレクトリを決定します。

### 1. 既存ディレクトリの確認

```bash
# 優先順位に従って確認
ls -d .worktrees 2>/dev/null     # 第一優先 (隠しディレクトリ)
ls -d worktrees 2>/dev/null      # 第二優先
```

**見つかった場合**: そのディレクトリを使用します。両方存在する場合は `.worktrees` が優先されます。

### 2. `GEMINI.md` の確認

```bash
grep -i "worktree.*director" GEMINI.md 2>/dev/null
```

**設定がある場合**: ユーザーに尋ねることなくそれを使用します。また、`.gemini/settings.json` などの設定ファイルも併せて確認します。

### 3. ユーザーへの確認

既存のディレクトリも設定も見つからない場合にのみ、以下の選択肢を提示します：

1. `.worktrees/` (プロジェクトローカル、非表示)
2. `~/.gemini/worktrees/<project-name>/` (グローバルロケーション)

どちらを希望するかユーザーに尋ねます。

## 安全性検証

### プロジェクトローカルディレクトリの場合 (`.worktrees/` または `worktrees/`)

**重要: ワークツリーを作成する前に、ディレクトリが無視されていることを必ず検証してください。**

```bash
# ローカル、グローバル、システムの gitignore を尊重してチェック
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**無視されていない場合**:
Jesse's rule「壊れているものは即座に直す」に従い、直ちに以下の対応を行います：
1. 適切な行（`.worktrees/` など）を `.gitignore` ファイルに追加する
2. その変更をコミットする
3. その後、ワークツリーの作成を続行する

### グローバルディレクトリの場合 (`~/.gemini/worktrees/`)

プロジェクトの外に作成されるため、`.gitignore` による検証は不要です。

## 作成ステップ

### 1. プロジェクト名の検出

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. ワークツリーの作成

```bash
# フルパスの決定
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.gemini/worktrees/*)
    path="~/.gemini/worktrees/$project/$BRANCH_NAME"
    ;;
esac

# 新しいブランチでワークツリーを作成
git worktree add "$path" -b "$BRANCH_NAME"
```

### 3. プロジェクトセットアップの実行

ワークツリーディレクトリに移動して環境に合わせてセットアップを自動実行します。
**重要**: `run_shell_command` などのツールを使用する際は、必ず `dir_path` パラメータにワークツリーのパスを明示的に指定してください。

```bash
# Node.js
if [ -f package.json ]; then npm install; fi
...

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. クリーンベースラインの検証

テストを実行し、ワークツリーが正常な状態で開始されたことを確認します。

**テストが失敗した場合**: 失敗を報告し、続行するか調査するかをユーザーに尋ねます。
**テストが成功した場合**: 準備完了を報告します。

### 5. 場所の報告

```
ワークツリーの準備が完了しました: <full-path>
テスト成功 (<N> テスト通過, 0 失敗)
機能 <feature-name> の実装準備が整いました
```

## 参考情報

### クイックリファレンス

| 状況 | アクション |
|-----------|--------|
| 通常の機能開発 | ワークツリーの使用を強く推奨 |
| スキル開発・移植 (実装フェーズ) | **例外**: 通常のブランチ（メインワークスペース）を推奨。CLI再起動やパス指定の煩雑さを避け、実装プロセスをシンプルに保つため |
| スキル開発・移植 (テストフェーズ) | ワークツリーの使用を必須。隔離環境での再起動（`gemini --resume latest`）と検証のため |
| `.worktrees/` が存在する場合 | それを使用する (無視されていることを検証) |
| `worktrees/` が存在する場合 | それを使用する (無視されていることを検証) |
| 両方存在する場合 | `.worktrees/` を使用する |
| どちらも存在しない場合 | `GEMINI.md` (または設定ファイル) を確認 → ユーザーに尋ねる |
| ディレクトリが無視されていない場合 | `.gitignore` に追加 + コミット |
| ベースラインテスト中にテストが失敗した場合 | 失敗を報告 + ユーザーに尋ねる |
| `package.json`/`Cargo.toml` がない場合 | 依存関係のインストールをスキップ |

### よくある間違い

*   **無視検証のスキップ**:
    *   **問題:** ワークツリーの内容が追跡され、Gitの状態を汚染する
    *   **修正:** プロジェクトローカルなワークツリーを作成する前に、常に`git check-ignore`を使用する
*   **ディレクトリリセットの失念**:
    *   **問題:** `run_shell_command` の `cd` はその呼び出し内でのみ有効であり、次のツール呼び出しではルートに戻ってしまう。
    *   **修正:** ワークツリー内で継続的な作業を行う場合は、各ツール呼び出しの `dir_path` パラメータにワークツリーのパスを明示的に指定する。
*   **ワークツリー削除時のカレントディレクトリ (Gemini固有)**:
    *   **問題:** 削除対象のワークツリーディレクトリ内に自分がいる状態で `git worktree remove` を実行すると、ディレクトリが使用中であるというエラーが発生する。
    *   **修正:** 削除コマンドを実行する際は、必ずプロジェクトルート（メインワークスペース）のコンテキストで実行する（`run_shell_command` の `dir_path` を指定しない）。
*   **ディレクトリの場所の仮定**:
    *   **問題:** 一貫性がなくなり、プロジェクトの慣習に反する
    *   **修正:** 優先順位に従う: 既存 > `GEMINI.md` (または設定ファイル) > 尋ねる
*   **失敗したテストで続行**:
    *   **問題:** 新しいバグと既存の問題を区別できない
    *   **修正:** 失敗を報告し、続行するための明示的な許可を得る
*   **セットアップコマンドのハードコーディング**:
    *   **問題:** 異なるツールを使用するプロジェクトでは動作しない
    *   **修正:** プロジェクトファイル (`package.json`など) から自動検出する

### ワークフロー例

```
You: 私はusing-git-worktreesスキルを使用して、隔離されたワークスペースをセットアップします。

[Check .worktrees/ - exists]
[Verify ignored - git check-ignore confirms .worktrees/ is ignored]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## レッドフラッグ (警告サイン)

### 決してしないこと (Never)
- 無視されていることを検証せずにプロジェクトローカルなワークツリーを作成する
- ベースラインテストの検証をスキップする
- テストが失敗したまま、ユーザーの明示的な許可なく続行する
- ディレクトリの場所が曖昧な場合に勝手に仮定する
- `GEMINI.md` (またはプロジェクト設定) の確認をスキップする

### 常にすること (Always)
- ディレクトリ選定の優先順位を遵守する: 既存ディレクトリ > `GEMINI.md` > ユーザーに尋ねる
- プロジェクトローカルなディレクトリが `.gitignore` で無視されていることを物理的に検証する
- プロジェクトのセットアップコマンドをファイルから自動検出して実行する
- 隔離環境でクリーンなテストベースラインが確保されていることを検証する

### 統合

*   **呼び出し元**: `brainstorming` (フェーズ4) - 設計承認後に実装が続く場合に必須, `subagent-driven-development` - タスク実行前に必須, `executing-plans` - タスク実行前に必須, 孤立したワークスペースを必要とするあらゆるスキル
*   **連携先**: `finishing-a-development-branch` - 作業完了後のクリーンアップに必須


