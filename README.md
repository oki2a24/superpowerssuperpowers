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
