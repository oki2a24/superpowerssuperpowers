# Antigravity CLI (agy) 移行・最適化計画

本計画は、従来の Gemini CLI 用に構築された本プロジェクト `superpowerssuperpowers` （スキル・ライブラリ拡張）を、後継である **Antigravity CLI (agy)** に最適化し、新旧両システムで安全に動作・移行できるように整備するものです。

---

## ユーザー確認事項

> [!IMPORTANT]
> **移行アプローチの選択**
> 従来の `Gemini CLI` との互換性を完全に保ったまま、並行して `Antigravity CLI` にも適応させるアプローチを提案します。
> これにより、移行期間中であってもどちらの CLI からも安全にこの拡張機能を呼び出すことができます。

---

## 提案する変更内容

変更は以下の 4 つのフェーズに分けて、安全かつアトミックに実施します。

### 1. 拡張機能定義ファイルの追加とコンテキストファイルの移行

#### [NEW] [antigravity-extension.json](file:///Users/oki2a24/superpowerssuperpowers/antigravity-extension.json)
- `gemini-extension.json` と同様の定義を持ちつつ、`contextFileName` を `ANTIGRAVITY.md` に設定します。

#### [NEW] [ANTIGRAVITY.md](file:///Users/oki2a24/superpowerssuperpowers/ANTIGRAVITY.md)
- 現行の `GEMINI.md`（プロジェクト全体の憲法）をベースに、`ANTIGRAVITY.md` を新規作成します。
- 内容における「Gemini CLI」などの呼称を「Antigravity CLI」または「agy」へ更新します。
- ※ `GEMINI.md` は互換性のために残します。

### 2. プロジェクト開発用ローカル設定の移行 (`.gemini/` -> `.agents/`)

本プロジェクトを開発・保守する AI エージェントが読み込む、ローカルの設定ディレクトリを複製・適応します。

#### [NEW] [`.agents/` ディレクトリ](file:///Users/oki2a24/superpowerssuperpowers/.agents)
- `.gemini/` ディレクトリの内容（`observations/`, `skills/`, `tasks/`）を `.agents/` にコピーします。
- `.agents/observations/GEMINI.md` を `.agents/observations/ANTIGRAVITY.md` にリネームし、内容を Antigravity 向けに調整します。
- 内部の各知見ファイル内の `gemini` 参照を `antigravity` (または `agy`) に更新します。

#### [MODIFY] [.gitignore](file:///Users/oki2a24/superpowerssuperpowers/.gitignore)
- `.agents/tasks/*` などを Git 管理から除外するルールを追加します。

### 3. ドキュメントおよびスキルの文言アップデート

ユーザー向けの案内や、各スキルのメタ定義について、Antigravity CLI 向けの記述を追加・更新します。

#### [MODIFY] [README.md](file:///Users/oki2a24/superpowerssuperpowers/README.md)
- クイックスタートや解説図などの `gemini` / `gemini-extension.json` に関する記述を `agy` / `antigravity-extension.json` にアップデートし、Antigravity をファーストクラスとして扱います。

#### [MODIFY] [skills/**/SKILL.md](file:///Users/oki2a24/superpowerssuperpowers/skills)
- 各スキルの説明やプロンプト例に現れる「Gemini CLI」などの表現を「Antigravity CLI (agy)」にリプレース、または両対応の記述にします。

---

## 検証計画

### 自動テスト / 物理的検証
1. `antigravity-extension.json` および `ANTIGRAVITY.md` の構文エラーがないことの検証。
2. 移行後の `.antigravity/` ディレクトリ構造が、アトミックな整合性を維持していることの検証。
3. バージョンのインクリメントルール（DoD）が物理的に正常に適用されているかの確認。

### 手動検証
1. ユーザーの環境（Antigravity CLI 起動中）で、本拡張機能が正常に認識され、`/skill` 等でスキルがロードできることを確認。
