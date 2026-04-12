# user-oriented-constitution-refinement 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** 現在の `GEMINI.md` から「移植工場の掟」を分離し、利用者にとって最適な「AI 行動憲法」へと再設計する。

**アーキテクチャ:**
1.  **静的な掟の分離**: 開発者・移植者向けの手順を `docs/FACTORY.md` へ移動。
2.  **憲法の刷新**: ルートの `GEMINI.md` を「プロジェクトの整合性を守る AI の行動指針」に特化。
3.  **スキルトリガーの強化**: `port-superpowers-skill` を更新し、必要な時だけ `docs/FACTORY.md` を参照するように橋渡し。

**技術スタック:** Markdown, Git

---

### タスク 1: `docs/FACTORY.md` の作成と開発ノウハウの移動

**ファイル:**
- 作成: `docs/FACTORY.md`

**ステップ 1: `docs/FACTORY.md` を作成し、工場の運営規定と開発者向け DoD を記述する**

```markdown
# スキル移植・開発工場 運営規定 (Porting Factory Mandate)

本ファイルは、`superpowers` スキルの移植、新規開発、およびオリジナルのアップデートへの追随を行うための「工場の運営規定」である。

---

## Ⅰ. 移植・開発の基本原則 (Principles of Porting)

- **オリジナルの尊重 (Original Fidelity)**:
    - 移植元の構造やロジックを最大限尊重しつつ、Gemini CLI の特性（`ask_user`、`activate_skill` 等）に適合させよ。
- **Node.js への完全準拠**:
    - スクリプトおよび移植後のロジックはすべて Node.js (v20+) で実装せよ。Python の新規導入は禁止する。

## Ⅱ. 開発支援ツール (Factory Tools)

- **Todo 管理**: `node scripts/todo.mjs` を使用し、作業の進捗を管理せよ。
- **連携プロトコル**: 大規模タスクの分割には `scripts/gemini_sub.mjs` (GPAC) を活用せよ。

## Ⅲ. リリースの定義 (Definition of Release / DoR)

**スキルそのものを変更・追加した際は、以下の規律に従い、リリースの完全性を証明せよ。**

1. **リリースの完全性**:
    - AI の振る舞いに影響を与える「コアファイル（プロンプト、スクリプト等）」に変更を加えた際は、必ずバージョン番号を更新せよ。
    - [ ] **Versioning**: `gemini-extension.json` の更新状況を確認せよ。
2. **移植の記録**:
    - [ ] **Porting Record**: `docs/superpowers_ports.md` への追記を確認せよ。
```

**ステップ 2: コミット**

```bash
git add docs/FACTORY.md
git commit -m "docs: 開発者向け運営規定を docs/FACTORY.md に分離する"
```

---

### タスク 2: `GEMINI.md` の刷新（利用者向け憲法）

**ファイル:**
- 変更: `GEMINI.md`

**ステップ 1: `GEMINI.md` を利用者向けの行動指針に書き換える**

```markdown
# Gemini CLI プロジェクト憲法 (Project Constitution)

本ファイルは、本プロジェクトにおいて Gemini CLI エージェントが遵守すべき「行動原理」および「品質基準」を規定する。

---

## Ⅰ. 核心的三原則 (The Triple Core)

### 1. 原子的な整合性 (Atomic Integrity)
**「不純な状態をシステムに混入させてはならない。」**
- すべての変更は検証済みの最小単位（アトミック）でなければならない。
- ユーザーのプロジェクトに未検証のコードや、中途半端な作業状態を残すことを厳禁とする。

### 2. 透明な共鳴 (Transparent Resonance)
**「意図と現状を、ユーザーの認知と完全に同期させよ。」**
- 作業のロードマップ（todo）を常に可視化し、AI の現在地をユーザーが直感的に理解できるようにせよ。

### 3. 自己進化の規律 (Self-Evolutionary Discipline)
**「失敗と知見を、プロジェクト固有の知恵へと昇華させよ。」**
- 過去の指摘や発見を `observations/` に記録し、次回の作業に動的に反映させよ。

---

## Ⅱ. スキル活用の規律 (Skill Discipline)

- **スキルの自発的提案**: プロジェクトに導入されているスキルを、課題の性質に応じて自発的に提案・有効化せよ。
- **スキルの指示への忠実性**: スキル有効化中は、その SKILL.md を最優先の行動ガイドとして遵守せよ。

---

## Ⅲ. 階層化 Observations アーキテクチャ (Tiered Observation)

<!-- observation-distiller:start:strata -->
**「知見は地層として積み重なり、現在のコンテキストへと動的に合成される。」**
(Strata セクションを維持)
<!-- observation-distiller:end:strata -->

---

## Ⅳ. 完了の定義 (Definition of Done / DoD)

**「『完了』を宣言する前に、以下の規律に従い、システムの完全性を物理的に証明しなければならない。」**

1. **整合性の物理的証明**:
    - 変更が意図通り動作することを、テストまたは実証（検証コマンド）によって証明せよ。
2. **プロジェクトの健全性**:
    - [ ] **Cleanup**: 作業用の一時ファイル、不要なログ、一時ブランチの削除。
    - [ ] **Doc Sync**: コード変更に伴う関連ドキュメント（README等）の更新。
    - [ ] **Git Integrity**: 予期せぬ未コミット変更の有無。
```

**ステップ 2: コミット**

```bash
git add GEMINI.md
git commit -m "docs: GEMINI.md を利用者向けの行動憲法に刷新する"
```

---

### タスク 3: `port-superpowers-skill` への参照追加

**ファイル:**
- 変更: `.gemini/skills/port-superpowers-skill/SKILL.md`

**ステップ 1: スキル冒頭に `docs/FACTORY.md` への参照を追加する**

```markdown
# Superpowersスキル移植ガイド

このスキルは、`obra/superpowers`からGemini CLIへのスキル移植プロセスをガイドします。
**移植作業に関する詳細な運営規定（Node.js準拠、ツール使用法等）については、必ず `docs/FACTORY.md` を事前に確認せよ。**
```

**ステップ 2: コミット**

```bash
git add .gemini/skills/port-superpowers-skill/SKILL.md
git commit -m "feat: port-superpowers-skill に FACTORY.md への参照を追加する"
```
