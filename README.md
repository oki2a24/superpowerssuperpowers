# Superpowers for Gemini CLI 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)

Gemini CLI の能力を極限まで引き出すための「スキル」の集合体。
[obra/superpowers](https://github.com/obra/superpowers) の高度な思考プロセスを Gemini CLI へ移植し、さらに自律的な自己改善ループを追加した拡張機能です。

---

## 🚀 クイックスタート (Quick Start)

インストールから最初のスキル起動まで、わずか 3 ステップです。

### 1. インストール
```bash
gemini extensions install https://github.com/oki2a24/superpowerssuperpowers
```

### 2. スキルの確認
インストール後、エージェントにこう問いかけてください：
> 「導入された superpowers スキルのリストを見せて」

### 3. 最初のスキル起動
長期的なタスクを開始する前に、進捗を管理するスキルを起動するのがおすすめです：
> 「`roadmap-management` スキルを起動して、今回の作業の計画を立てて」

---

## 🛠 スキル・カタログ (Skill Catalog)

本拡張機能は、強力なエンジニアリング・スキル（移植）と、それらを支えるメタ・スキル（オリジナル）で構成されています。

### 1. 移植スキル (Ported Skills)
[obra/superpowers](https://github.com/obra/superpowers) から Gemini CLI 向けに最適化して移植された、高度なエンジニアリング・スキルです。

| スキル名 | 目的 (Intent) | プロンプト例 |
| :--- | :--- | :--- |
| **`brainstorming`** | 実装前の要件定義と設計の探索。 | 「この機能の設計をブレインストーミングしたい」 |
| **`writing-plans`** | 実行可能な「一口サイズ」の計画作成。 | 「この仕様に基づいて実装計画を立てて」 |
| **`executing-plans`** | 計画のバッチ実行と逐次検証。 | 「立てた計画に従って実装を進めて」 |
| **`systematic-debugging`** | 根拠に基づいた体系的なデバッグ。 | 「このテスト失敗の根本原因を調査して」 |
| **`subagent-driven-development`** | 3段階レビューによる品質担保。 | 「サブエージェントを使ってこのコードをレビューして」 |
| **`test-driven-development`** | TDD 原則（RED/GREEN/REFACTOR）の強制。 | 「TDD スキルを起動して、このバグのテストを書いて」 |
| **`using-git-worktrees`** | 隔離環境での安全な開発・検証。 | 「ワークツリーを作って、この PR の動作確認をして」 |
| **`finishing-a-development-branch`** | 作業完了後の整理と改善提案。 | 「作業が終わったので、ブランチを片付けて」 |

> [!IMPORTANT]  
> **Respect for Original**: これらのスキルは、[obra/superpowers](https://github.com/obra/superpowers) の優れた設計思想に基づいています。オリジナルの構造を尊重しつつ、Gemini CLI の特性に合わせて調整されています。

### 2. オリジナル・スキル (Meta Skills)
本プロジェクト独自の、運用管理や自己改善を支えるメタ・スキルです。

| スキル名 | 目的 (Intent) | プロンプト例 |
| :--- | :--- | :--- |
| **`roadmap-management`** | 長期セッションの進捗と目標の可視化。 | 「現在のロードマップを表示して」 |
| **`session-coordination`** | GPAC によるサブセッションへの委譲。 | 「このタスクをサブエージェントに任せたい」 |
| **`observation-distiller`** | 経験を再利用可能な知見として永続化。 | 「今回の学びを Observations にまとめて」 |
| **`session-retrospective`** | セッション終了時の振り返りと改善。 | 「セッションを終了して、振り返りを行いたい」 |
| **`port-superpowers-skill`** | 移植元からのアップデートと新規移植。 | 「新しいスキルを superpowers から移植して」 |

---

## 🧠 コア・コンセプト (Core Concepts)

### 1. 運用記憶 (`GEMINI.md`)
プロジェクトルートの `GEMINI.md` は、エージェントの「外部記憶」です。実戦から得た学び、ワークフローの原則、意思決定の背景を記録し、セッションを跨いで成長します。

### 2. 自己改善ループ
`session-retrospective` と `observation-distiller` により、AI 自身が自分の行動を振り返り、スキルや憲法をアップデートし続ける仕組みを構築しています。

### 3. Node.js への統一
すべてのスクリプトとテストは Node.js (標準機能) に統一されています。Python への依存は完全に排除されており、環境を汚染することなく動作します。

---

## 🔒 セキュリティ & プライバシー

- **ローカル実行**: すべてのスクリプトと処理はローカル環境で実行されます。
- **透明性**: `scripts/` 内のコードはすべてプレーンな JavaScript (Node.js) であり、ユーザーがいつでも内容を確認・監査できます。
- **最小権限**: ファイル操作や Git 操作は、ユーザーが許可した範囲内（現在のディレクトリ等）に限定されます。

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
