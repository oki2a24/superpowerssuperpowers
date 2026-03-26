# 階層化 Observations アーキテクチャ 実装計画 (Ver 2.3)

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** L1-L4 の四層構造による知見の動的合成、一等市民としての Observations 配置、および PC 間ポータビリティを実現する。

**アーキテクチャ:**
- **知見の地層 (The Strata)**: Core (L1) から Project (L4) までの四層構造。フルパス指定。
- **一等市民化**: 共有知見（L2）をリポジトリルートの `observations/` に配置。
- **品質規律**: 全ての知見に RED-GREEN-REFACTOR (ドキュメンテーション TDD) を適用。

---

### 知見の地層と優先順位 (The Strata AA)

```text
[ 低優先 ]                                                                                                          [ 高優先 ]
  L1: Core (Skills)             L2: Extension (Shared)                L3: Personal (Global)         L4: Project (Local)
  (~/.gemini/extensions/skills) (~/.gemini/extensions/observations)   (~/.gemini/observations/)     (./.gemini/observations/)
          |                             |                             |                             |
          +-----------------------------+-----------------------------+-----------------------------+
                                        |
                                        v
                               [ AI Execution Context ]
```

---

### タスク 1: observation-distiller スキルの昇格 (コアスキル化)

**ファイル:**
- 移動: `./.gemini/skills/observation-distiller/` -> `./skills/observation-distiller/`
- 変更: `./skills/observation-distiller/SKILL.md`

**ステップ 1: スキルディレクトリの移動**
`observation-distiller` をメタスキルから拡張機能のコアスキルへと物理的に移動します。

**ステップ 2: SKILL.md の更新 (品質規律の統合)**
`writing-skills` の RED-GREEN-REFACTOR を知見採取の必須プロセスとして組み込みます。また、L1-L4 の地層 AA 図とフルパス（略称なし）を記述します。

**ステップ 3: 検証**
AI に対し「新しいスキルの場所と、昇格の条件（RED-GREEN）を説明して」と問い、正しく認識しているか確認。

**ステップ 4: コミット**
`git add . && git commit -m "feat: observation-distiller をコアスキルに昇格させ、品質規律を導入する"`

---

### タスク 2: L2 (Extension/Shared) 基盤の構築

**ファイル:**
- 作成: `./observations/.gitkeep`
- 移動: `./.gemini/observations/*.md` (汎用的なもの) -> `./observations/`

**ステップ 1: リポジトリルートへの observations ディレクトリ新設**
「一等市民」としての共有知見レイヤーを作成します。

**ステップ 2: 知見の昇格テスト (L4 -> L2)**
本プロジェクトの `.gemini/observations/` にある汎用的な知見を、新設したルートの `observations/` へ移動させます。

**ステップ 3: 検証**
リポジトリ構造がデザイン Ver 2.2 と一致していることを確認。

**ステップ 4: コミット**
`git add . && git commit -m "feat: ルートに observations ディレクトリを新設し、共有知見の基盤を構築する"`

---

### タスク 3: 憲法 (GEMINI.md) の更新 (スキャンロジックの刻印)

**ファイル:**
- 変更: `GEMINI.md`

**ステップ 1: 四層スキャン命令の記述**
L1-L4 のフルパスと優先順位、および「上位層による下位層の補足・上書き」ルールを明文化します。

**ステップ 2: 動作検証 (RED-GREEN)**
- **RED**: L2 にしかない知見が、現在の L3/L4 設定なしで読み込まれないことを確認（一時的にパスを外す等）。
- **GREEN**: 憲法の命令に従い、AI が L1-L4 を正しく合成して回答することを確認。

**ステップ 3: コミット**
`git add . && git commit -m "feat: 憲法を更新し、四層構造の知見スキャンロジックを導入する"`

---

### タスク 4: PC間ポータビリティの最終検証 (リリースシミュレーション)

**ステップ 1: 変更の最終確認**
全てのファイルが正しいパスに配置され、意図した内容であることを確認します。

**ステップ 2: メインブランチ統合準備 (シミュレーション)**
`main` ブランチへのマージと、`gemini extension update` による配信フローを想定し、配信後のパス `~/.gemini/extensions/superpowers/observations/` が機能する構造になっていることを確認。

**ステップ 3: 最終コミット**
`git add . && git commit -m "feat: 階層化 Observations アーキテクチャの実装を完了する"`

---

### タスク 5: 完了報告

1. 四層構造が物理的・論理的に機能していることを最終確認。
2. ロードマップを完了状態に更新。
