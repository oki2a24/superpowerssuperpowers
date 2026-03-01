# デザインドキュメント: README.md の刷新 (2026-03-01)

## 1. 目的
本プロジェクトが `obra/superpowers` の Gemini CLI への移植・最適化の「実験場」であり、かつ将来の開発活動を支える「スキルの製造・供給基地」であることを明確にする。ユーザー（自分自身）および AI エージェントが、迷わずスキルの利用・移植・改善・展開を行えるガイドとして `README.md` を全面刷新する。

## 2. 構成案 (実践的ガイド形式)

### 2.1. イントロダクション
- 移植元 [obra/superpowers](https://github.com/obra/superpowers) へのリファレンスと、本プロジェクトの趣旨（移植と自律的改善）を明記。

### 2.2. スキル・カタログ
- カテゴリー別に移植済みスキルをリストアップし、それぞれの主要な用途を簡潔に解説。
    - プロセス系 (`brainstorming`, `writing-plans`, `executing-plans`, `systematic-debugging`)
    - 基盤・ワークフロー系 (`using-superpowers`, `using-git-worktrees`, `port-superpowers-skill`, `finishing-a-development-branch`)
    - 品質・レビュー系 (`subagent-driven-development`, `verification-before-completion`)

### 2.3. 自律的運用・自己改善システム
- `GEMINI.md` による運用記憶の蓄積と行動原則の更新。
- `scripts/reset_skill.py` によるスキルの初期化手順。

### 2.4. 標準作業手順 (SOP) - 運用のためのガイド
- 新しいスキルの移植手順 (`port-superpowers-skill` の活用)。
- `using-git-worktrees` による隔離環境での実証テスト（実際のファイル操作を伴うタスク）の義務化。
- 開発完了時のシーケンス（振り返り → プロセス改善 → セッション管理）。

### 2.5. スキルのグローバル展開・他プロジェクトへの適用 (シンボリックリンク版)
- `~/.gemini/skills/` へのシンボリックリンク作成によるグローバル適用手順。
- 他プロジェクトへのシンボリックリンク作成による個別適用と、自動同期（メンテナンスコスト削減）のメリット。

### 2.6. ディレクトリ構造の解説
- `.gemini/skills/`, `scripts/`, `docs/`, `superpowers-original/` の役割を明記。

## 3. アーキテクチャとデータフロー
- `README.md` は静的なドキュメントだが、`GEMINI.md` や各スキルの `SKILL.md` と整合性を保つ必要がある。
- 特に「スキル・カタログ」のセクションは、`.gemini/skills/` 下の実際のディレクトリ構造と同期させる。

## 4. テストと検証
- 刷新された `README.md` のリンク（特に移植元 URL や内部ファイルパス）が正しいかを確認する。
- 記述された SOP（特にシンボリックリンクによる適用手順）が、実際の Gemini CLI 環境で再現可能であることを確認する。
