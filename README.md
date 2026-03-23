# Superpowers for Gemini CLI 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)

Gemini CLI の能力を極限まで引き出すための「スキル」の集合体。
[obra/superpowers](https://github.com/obra/superpowers) の高度な思考プロセスを Gemini CLI へ移植し、さらに自律的な自己改善ループを追加した拡張機能です。

---

## 📦 インストール (Installation)

Gemini CLI の拡張機能として直接インストールできます。

```bash
gemini extensions install https://github.com/oki2a24/superpowerssuperpowers
```

---

## 🛠 スキル・カタログ (Skill Catalog)

本リポジトリは、強力な移植スキルと、それらを管理・強化する独自のオリジナル・スキルで構成されています。

### 1. 移植スキル (Ported Skills)
[obra/superpowers](https://github.com/obra/superpowers) から Gemini CLI 向けに最適化して移植された、高度なエンジニアリング・スキルです。

| スキル名 | 概要 |
| :--- | :--- |
| **`brainstorming`** | ユーザーの意図と設計を探求し、実装前に要件を固める。 |
| **`writing-plans`** | タスクの仕様に基づき、実行可能な「一口サイズ」の計画を作成。 |
| **`executing-plans`** | 実装計画をバッチ実行し、レビューと検証を繰り返す。 |
| **`systematic-debugging`** | 根拠に基づいた体系的なデバッグと根本原因の特定。 |
| **`subagent-driven-development`** | 実装・仕様・品質の3段階レビューで品質を担保。 |
| **`test-driven-development`** | 実装前にテストを書く TDD 原則を強制。 |
| **`using-git-worktrees`** | 隔離された Git ワークツリーで安全に開発・検証。 |
| **`finishing-a-development-branch`** | 作業完了後の整理、マージ、改善提案プロセス。 |
| **`verification-before-completion`** | 完了主張前に必ず物理的な証拠（テスト等）を提示。 |
| **`dispatching-parallel-agents`** | 独立したタスクを複数のエージェントで並行処理。 |
| **`using-superpowers`** | 常にスキルの活用を模索し、最適なタイミングで起動。 |

> [!IMPORTANT]  
> **Respect for Original**: これらのスキルは、[obra/superpowers](https://github.com/obra/superpowers) の優れた設計思想に基づいています。オリジナルの構造を尊重しつつ、Gemini CLI の特性に合わせて調整されています。

### 2. オリジナル・スキル (Original/Meta Skills)
本プロジェクト独自の、運用管理や自己改善を支えるメタ・スキルです。

| スキル名 | 概要 |
| :--- | :--- |
| **`roadmap-management`** | 長期セッションの進捗と目標を可視化し同期。 |
| **`session-coordination`** | GPAC プロトコルによるサブセッションへの委譲と統合。 |
| **`observation-distiller`** | セッションの経験を再利用可能な知見として永続化。 |
| **`session-retrospective`** | 終了時にミスと学びを抽出し、物理的なガードレールへ昇華。 |
| **`port-superpowers-skill`** | 移植元からのアップデート追随と新規移植の SOP。 |
| **`update-superpowers-ports-doc`** | 移植履歴とコミットハッシュの正確な記録。 |

---

## 🧠 コア・コンセプト (Core Concepts)

### 1. 運用記憶 (`GEMINI.md`)
プロジェクトルートの `GEMINI.md` は、エージェントの「外部記憶」です。実戦から得た学び、ワークフローの原則、意思決定の背景を記録し、セッションを跨いで成長します。

### 2. 自己改善ループ
`session-retrospective` と `observation-distiller` により、AI 自身が自分の行動を振り返り、スキルや憲法をアップデートし続ける仕組みを構築しています。

### 3. Node.js への統一
環境のセットアップ負荷を最小限にするため、すべてのスクリプトとテストは Node.js (標準機能) に統一されています。Python への依存は完全に排除されています。

---

## 📂 ディレクトリ構造

- **`.gemini/skills/`**: オリジナル・スキル (Meta Skills)
- **`skills/`**: 移植済みスキル (Ported Skills)
- **`agents/`**: サブエージェントのプロンプト定義
- **`scripts/`**: 運用支援ツール (`todo.mjs`, `reset_skill.mjs` 等)
- **`docs/`**: デザインドキュメント、実装計画、移植記録
- **`GEMINI.md`**: AI エージェントの運用記憶と学習記録（最重要）

---
*Created by Gemini CLI Agent — A partner in self-evolving software engineering.*
