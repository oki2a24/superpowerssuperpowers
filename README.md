# Superpowerssuperpowers for Gemini CLI 🚀

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

本拡張機能のスキルはすべて `skills/` ディレクトリに配置され、シームレスに利用可能です。これらは、優れた設計思想を持つ移植元由来のスキルと、自律的な成長を支える本プロジェクト独自のスキルで構成されています。

### 1. コア・スキル (Core Skills)

| スキル名 | 出自 (Origin) | 目的 (Intent) |
| :--- | :--- | :--- |
| **`session-handoff`** | **Original** | **[重要]** セッション肥大化時の「無損失」なコンテキスト引き継ぎ。 |
| **`observation-distiller`** | **Original** | **[最重要]** 経験を「知見の地層」として採取・昇格・ポータブル化する。 |
| **`brainstorming`** | Ported | 実装前の要件定義と設計の探索。 |
| **`writing-plans`** | Ported | 実行可能な「一口サイズ」の計画作成。 |
| **`executing-plans`** | Ported | 計画のバッチ実行と逐次検証。 |
| **`systematic-debugging`** | Ported | 根拠に基づいた体系的なデバッグ。 |
| **`subagent-driven-development`** | Ported | 3段階レビューによる品質担保。 |
| **`test-driven-development`** | Ported | TDD 原則（RED/GREEN/REFACTOR）の強制。 |
| **`using-git-worktrees`** | Ported | 隔離環境での安全な開発・検証。 |
| **`finishing-a-development-branch`** | Ported | 作業完了後の整理と改善提案。 |

> [!IMPORTANT]  
> **Respect for Original**: `Ported` 表記のスキルは、[obra/superpowers](https://github.com/obra/superpowers) の優れた設計思想に基づいています。オリジナルの構造を尊重しつつ、Gemini CLI の特性に合わせて最適化されています。

### 2. メタ・スキル (Meta Skills)
セッション管理や開発運用を支える、本プロジェクト独自の内部スキルです。

| スキル名 | 目的 (Intent) | プロンプト例 |
| :--- | :--- | :--- |
| **`roadmap-management`** | 長期セッションの進捗と目標の可視化。 | 「現在のロードマップを表示して」 |
| **`session-coordination`** | GPAC によるサブセッションへの委譲。 | 「このタスクをサブエージェントに任せたい」 |
| **`session-retrospective`** | セッション終了時の振り返りと改善。 | 「セッションを終了して、振り返りを行いたい」 |
| **`port-superpowers-skill`** | 移植元からのアップデートと新規移植。 | 「新しいスキルを superpowers から移植して」 |

---

## 🧠 コア・コンセプト (Core Concepts)

### 1. 知見の地層 (The Strata)
本プロジェクトの核心は、知見を **L1 (Core) から L4 (Project) までの四層構造** で管理する「階層化 Observations アーキテクチャ」にあります。
- **ポータビリティ**: 移植元（L1）を汚さず、自分の「英知（L2）」を拡張機能の一部として Git 経由で別の PC やプロジェクトへ安全に配信・同期できます。
- **品質規律**: すべての知見は TDD (RED-GREEN) を経て採取され、精錬（昇格）されます。
- *詳細は [Tiered Observation Architecture デザイン](./docs/plans/2026-03-24-tiered-observation-architecture-design.md) を参照。*

### 2. 運用記憶 (`GEMINI.md`)
プロジェクトルートの `GEMINI.md` は、エージェントの「外部記憶」です。実戦から得た学び、ワークフローの原則、意思決定の背景を記録し、セッションを跨いで成長します。

---

## 🔒 セキュリティ & プライバシー (Security & Privacy)

本拡張機能は、ユーザーのコードとプライバシーを保護するために、以下の原則を遵守します。

- **100% ローカル実行**: すべての推論（Gemini API 呼び出しを除く）、スクリプト、およびファイル操作はユーザーのローカル環境でのみ実行されます。
- **透明な英知 (Transparent Knowledge)**: 採取された「知見 (Observations)」はすべてプレーンな Markdown 形式で保存されます。暗号化や難読化は一切行われず、ユーザーはいつでも自身の英知を閲覧、修正、削除できます。
- **コードの監査性**: `scripts/` 内のツールはすべて純粋な JavaScript (Node.js) で記述されており、外部の不透明なバイナリに依存しません。
- **最小権限の原則**: ファイル操作は、プロジェクトディレクトリおよび `~/.gemini/` 内の規定のパスに限定されます。

---

## 📂 ディレクトリ構造

- **`skills/`**: コア・スキル (移植済み & オリジナル)
- **`observations/`**: 共有知見レイヤー (L2: Extension Shared)
- **`.gemini/skills/`**: 開発中のメタ・スキル
- **`.gemini/observations/`**: プロジェクト固有の知見 (L4: Project Local)
- **`agents/`**: サブエージェントのプロンプト定義
- **`scripts/`**: 運用支援ツール (`todo.mjs` 等)
- **`docs/`**: デザインドキュメント、実装計画、移植記録

---
*Created by Gemini CLI Agent — A partner in self-evolving software engineering.*
