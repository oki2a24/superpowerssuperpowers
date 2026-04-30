# Upstream 同期成果の反映とドキュメント刷新 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** 最新の Upstream 同期成果を反映し、カタログの規律を「鉄則」レベルへ昇華させるとともに、実施レポートとバージョニングを完了させる。

**アーキテクチャ:** 既存の README.md の「二軸構造」を維持しつつ、記述の純度を高める。また、監査ログとしての `superpowers_ports.md` と、プロセス記録としての実施レポートを完備する。

**技術スタック:** Markdown, JSON, Git

---

### タスク 1: カタログのスキル説明のリファクタリング (Inherited Foundations)

**ファイル:**
- 変更: `README.md`

- [ ] **ステップ 1: 主要スキルの説明を「鉄則」ベースに更新**

`README.md` 内の `Development Catalog` セクションにある以下のスキルの説明を更新します。

- `test-driven-development`: 「RED-GREEN-REFACTOR の原則を強制」→「**[鉄の掟]** 変更前に失敗を物理的に確認し、検証を成功の唯一の証明とする」
- `systematic-debugging`: 「根拠に基づいた体系的なデバッグ」→「**[鉄則]** 推測を排し、バグの再現と多角的な証拠収集を絶対条件とする」
- `brainstorming`: 「要件の曖昧さを排除し、堅牢な設計を探索」→「**[HARD-GATE]** 構築前に設計の合意を物理的に得ること。曖昧さを排除する設計の守護者」
- `verification-before-completion`: 「完了宣言の前に『物理的な検証』を物理的に強制」→「**[鉄則]** 最新の検証証拠なき主張を認めない、完了の最終ゲート」

- [ ] **ステップ 2: カタログ導入文に同期ハッシュを明記**

`Development Catalog` の冒頭に以下の注記を追加します。
「> Upstream `6efe32c` (2026-04) 準拠。最新の規律が物理的に反映されています。」

- [ ] **ステップ 3: 検証とコミット**

`README.md` を読み直し、トーンがプロフェッショナルであることを確認。
```bash
git add README.md
git commit -m "docs: README のスキルカタログを最新の規律に合わせてリファクタリングする"
```

---

### タスク 2: メンテナンスセクションの更新 (Maintenance & Evolution)

**ファイル:**
- 変更: `README.md`

- [ ] **ステップ 1: メンテナンススキルの説明をリファイン**

`Maintenance & Evolution` セクションのテーブルを更新します。

- `port-superpowers-skill`: 「移植元からの新規スキルの導入と、構造的な統合。」→「**[統合 & 進化]** 新規スキルの移植、および既存スキルの構造的な大規模アップデート。」
- `sync-upstream-skill`: (新規追加) 「**[自律同期]** 移植元と自律的に同期し、全スキルのロジックを一括で最新に維持。**NEW**」

- [ ] **ステップ 2: 検証とコミット**

```bash
git add README.md
git commit -m "docs: README のメンテナンスセクションに sync-upstream-skill を追加する"
```

---

### タスク 3: ポート監査ログの確定と同期レポートの作成

**ファイル:**
- 変更: `docs/superpowers_ports.md`
- 作成: `docs/plans/2026-04-30-upstream-sync-report.md`

- [ ] **ステップ 1: `docs/superpowers_ports.md` の記述を確認し、必要に応じて微調整**

`6efe32c` への同期が完了していることを再確認し、末尾に確定した旨の短い注記を追加。

- [ ] **ステップ 2: 同期実施レポートの作成**

`docs/plans/2026-04-30-upstream-sync-report.md` を作成し、同期対象（15スキル）、主要なロジック注入内容、検証済みハッシュを記録。

- [ ] **ステップ 3: コミット**

```bash
git add docs/superpowers_ports.md docs/plans/2026-04-30-upstream-sync-report.md
git commit -m "docs: Upstream 同期ログを確定させ、実施レポートを作成する"
```

---

### タスク 4: バージョンインクリメントと最終 DoD

**ファイル:**
- 変更: `gemini-extension.json`

- [ ] **ステップ 1: バージョンを 1.9.0 に更新**

`gemini-extension.json` の `version` フィールドを `"1.9.0"` に変更。

- [ ] **ステップ 2: DoD の最終チェック**
- README のリンク切れがないか。
- `activate_skill` で新しい記述が（物理的に）反映されているか（`cat` 等で確認）。

- [ ] **ステップ 3: 最終コミット**

```bash
git add gemini-extension.json
git commit -m "chore: バージョンを 1.9.0 にインクリメントする"
```
