# Gemini CLI スキル製造基地 & 実験場

本プロジェクトは、[obra/superpowers](https://github.com/obra/superpowers) の Gemini CLI への移植・最適化、および AI エージェントの自律的改善プロセスの確立を目的とした「実験場」です。

単なるスキルの移植に留まらず、Gemini CLI 環境での最適な動作、運用の記憶 (`GEMINI.md`)、そして AI 自身によるスキルの自律的アップデートという「自己改善ループ」の構築を目指しています。

## 1. スキル・カタログ

カテゴリー別に移植済みスキルを分類しています。各スキルの詳細は、`.gemini/skills/<skill-name>/SKILL.md` を参照してください。

### 1.1. プロセス・思考系
複雑なタスクを分解し、確実な実行を支援するスキル。
- **`brainstorming`**: ユーザーの意図と設計を探求し、実装前に要件を固める。
- **`writing-plans`**: タスクの仕様に基づき、一口サイズの実行可能な計画を作成する。
- **`executing-plans`**: 実装計画をバッチで実行し、レビューと検証を繰り返す。
- **`systematic-debugging`**: バグやテスト失敗に対し、根拠に基づいた体系的なデバッグを行う。
- **`test-driven-development`**: 実装前にテストを書き、最小限のコードでパスさせる TDD を強制する。

### 1.2. 基盤・ワークフロー系
安全な開発環境と標準的な作業フローを提供するスキル。
- **`using-superpowers`**: 適切なスキルの起動を促し、1% の可能性でもスキルを活用する。
- **`using-git-worktrees`**: 隔離された Git ワークツリーをセットアップし、安全に開発・テストを行う。
- **`port-superpowers-skill`**: `obra/superpowers` からスキルを移植するための標準作業手順（SOP）。
- **`finishing-a-development-branch`**: 作業完了後のブランチ整理、マージ、および改善提案プロセス。
- **`update-superpowers-ports-doc`**: 移植済みスキルと元コミットの記録を更新する。

### 1.3. 品質・レビュー系
コード品質の維持と、マルチエージェントによる検証を行うスキル。
- **`subagent-driven-development`**: 実装、仕様レビュー、コード品質レビューの 3 段階で品質を担保する。
- **`verification-before-completion`**: 作業完了の主張前に、必ず証拠（テスト出力等）の提示を義務付ける。
- **`requesting-code-review` / `receiving-code-review`**: 効果的なコードレビューの依頼と、建設的なフィードバックの受容。
- **`dispatching-parallel-agents`**: 独立したタスクを複数のエージェントで並行処理する。

## 2. 自律的運用・自己改善システム

本プロジェクトでは、AI エージェントが自身の行動を律し、継続的に学習するための仕組みを導入しています。

### 2.1. 運用記憶 (`GEMINI.md`)
プロジェクトルートの `GEMINI.md` は、エージェントの「外部記憶」です。以下の内容を永続的に記録します。
- **実戦からの学び**: 遭遇した問題と解決策、特定のツール使用時の注意点（例: ワークツリーでの `dir_path` 指定の徹底）。
- **ワークフローの原則**: ブランチ戦略、テスト実施手順、セッション管理（リフレッシュと再起動）のルール。
- **意思決定の記録**: 採用したアーキテクチャや技術的選択の背景。

### 2.2. スキルの自己改善と保護
- **改善のトリガー**: 開発完了時 (`finishing-a-development-branch`)、エージェントは振り返りを行い、必要に応じてスキル (`SKILL.md`) を更新します。
- **スキルのリセット**: `scripts/reset_skill.py` を使用して、スキル内のローカルな改変（Gemini 固有のアダプテーション）をリセットし、移植直後の状態に戻すことができます。
- **アップデート保護**: 移植元からのアップデート時、ローカルでの改善内容を一時退避し、アップデート後に安全に再結合する手順を `port-superpowers-skill` に定義しています。

## 3. 標準作業手順 (SOP)

確実かつ安全な開発のための標準フローです。

### 3.1. スキル移植・開発
1. **移植開始**: `activate_skill(name="port-superpowers-skill")` を起動し、SOP に従う。
2. **実装**: フィーチャーブランチを作成し、スキル定義を記述・コミットする。
3. **テスト**: `using-git-worktrees` で隔離環境を作成し、`activate_skill` で動作を確認する。
4. **完了**: `finishing-a-development-branch` を起動し、検証、マージ、改善提案を行う。

### 3.2. 隔離環境での検証
実際のファイル操作や破壊的な変更を伴うタスクは、必ず `using-git-worktrees` を用いた隔離環境で実行します。これにより、メインの開発環境を汚染することなく、安全に実証テストを行えます。

## 4. スキルのグローバル展開

移植・改善したスキルを他のプロジェクトでも利用できるようにするための手順です。

### 4.1. 全プロジェクトへの適用 (シンボリックリンク)
Gemini CLI のグローバルなスキルディレクトリ (`~/.gemini/skills/`) に、本リポジトリのスキルディレクトリへのシンボリックリンクを作成することで、すべてのプロジェクトでこれらのスキルが利用可能になります。

```bash
# 例: brainstorming スキルをグローバルに登録する
ln -s /path/to/your/superpowerssuperpowers/.gemini/skills/brainstorming ~/.gemini/skills/brainstorming
```

これにより、本リポジトリでスキルを改善すると、すべてのプロジェクトに即座に反映されます。

### 4.2. 個別プロジェクトへの適用
特定のプロジェクトのみに適用したい場合は、そのプロジェクトの `.gemini/skills/` 内にシンボリックリンクを作成してください。

## 5. ディレクトリ構造

本プロジェクトの主要なディレクトリ構成です。

- **`.gemini/skills/`**: 移植済みスキルの実体 (`SKILL.md` 等) が格納されています。
- **`agents/`**: `subagent-driven-development` 等で使用される、特定役割を持つサブエージェントのプロンプト定義。
- **`docs/`**: デザインドキュメント、実装計画、および移植記録 (`superpowers_ports.md`)。
- **`scripts/`**: 運用を支援する Python スクリプト群 (例: `todo.py`, `reset_skill.py`)。
- **`superpowers-original/`**: 移植元の [obra/superpowers](https://github.com/obra/superpowers) をサブモジュールとして管理。
- **`tests/`**: スクリプトやスキルの動作を検証するためのテストコード。
- **`GEMINI.md`**: AI エージェントの運用記憶と学習記録（最重要ファイル）。

---
*Created by Gemini CLI Agent as a partner in exploration.*
