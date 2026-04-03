# 設計・実装統合ドキュメント: 構造化された振り返り (Structured Retrospective)

## 1. 目的
`session-retrospective` スキルが、感情的な気づきや抽象的な反省に留まっている現状を改善し、実際の開発資産（Observations / TODO / Scripts）への「物理的な改善アクション」へと直結させる。
ユーザーとの共鳴を維持しつつ、AI の自律的な自己進化ループを「物理的な証拠」に基づいて確立する。

## 2. 核心的な設計 (Core Design)

### 2.1 コンテキスト再認識 (Pre-Reflection: Context Reload)
振り返りを開始する前に、以下のコマンド等で現在の「規律（憲法）」と「利用可能なスキル」を物理的に再スキャンする。
- `cat GEMINI.md`
- `ls .gemini/skills/`
これにより、「自分がどの規律に基づいて動くべきだったか」という基準を再構築する。

### 2.2 物理的な「証拠」に基づく RED (Evidence-based RED)
抽象的な「ミスをした」という反省を排除し、以下の「物理的な証拠」をリストアップする。
- **[Error Logs]**: ツール呼び出しの失敗や、不適切なパラメータ。
- **[User Hints]**: ユーザーからの軌道修正、不満の表明、設計の提案。
- **[File States]**: `git status` での未追跡ファイルの残存や、DoD 違反。

### 2.3 資産への精密なマッピング (Asset Mapping & Strata)
不備を、以下の資産にマッピングし、適切な「層（Strata）」を決定する。
- **[Distill] (最優先)**: `observation-distiller` を介し、`observations/<skill-name>.md` (L2-L4) へ蒸留する。
  - **重要**: 直接 `SKILL.md` や `GEMINI.md` 本体を更新してはならない。必ず Observations を初動とする。
- **[TODO]**: 構造的・大規模な課題を `docs/TODO.md` に物理的な「宿題」として記録する。
- **[SCRIPT]**: `scripts/` への検証スクリプト追加や、テストコードの強化。

### 2.4 物理的アクション・マトリクスの導入
振り返りの出力に、以下の形式の構造化データを必須とし、感情的な表現を 20% 以下に抑える。

| 課題 (RED: 物理的証拠) | 修正対象 (Asset) | 層 (Strata) | 具体的な物理アクション |
| :--- | :--- | :--- | :--- |
| 例: コミットメッセージの揺れ | `GEMINI.md` | L4 Project | DoD に `git log -n 3` の確認を必須化 |
| 例: YAML パースエラー | `session-coordination` | L2 Shared | `observations/` に YAML キー保護ルールを追記 |

## 3. 実装規律 (Implementation Discipline)

### 3.1 Documentation TDD (using `writing-skills`)
実装コード（プロンプト）を書く前に、以下の「テストケース」を定義する。
- 期待される振り返りの出力（ゴールイメージ）。
- その出力を得るために必要な、入力情報の構造。
これらを `writing-skills` の指示に従ってドキュメント化し、検証を行う。

### 3.2 原子的なインクリメンタル更新 (Atomic & Incremental)
一度に全てを変更せず、以下の Step ごとに実装し、都度ユーザーのレビューを仰ぐ。

- **Step 1**: コンテキスト再認識と、物理的 RED・資産マッピングロジックの導入。
- **Step 2**: 物理的アクション・マトリクス（出力形式）の導入。
- **Step 3**: `TODO.md` への自動的な切り出しプロンプトの導入。

## 4. 完了の定義 (DoD)
- [ ] 各ステップの完了が、Documentation TDD に基づいて検証されていること。
- [ ] 最終的な `session-retrospective` の出力が、感情論を排除し、物理的なファイル操作（Observations / TODO / Scripts）を提示していること。
- [ ] 変更が 1 つずつ反映され、各段階で整合性が証明されていること。
