# デザインドキュメント：階層化 Observations アーキテクチャ (Tiered Observation Architecture) Ver 2.2

## 1. 概要 (Context & Goals)

移植元スキル（Core）の整合性を維持しつつ、Gemini CLI 特有の最適化やプロジェクト固有の知見を、PC 間でポータブルに管理するためのアーキテクチャを定義する。知見（Observations）をスキルと同等の「一等市民」として扱い、ドキュメンテーション TDD によってその品質を担保する。

### 成功基準 (Success Criteria)
- **非破壊的進化:** `SKILL.md`（Core）を書き換えることなく、外部定義のみで挙動を最適化できる。
- **ポータビリティ:** 知見をリポジトリのルートに配置し、URL インストール後も `update` だけで英知を再現できる。
- **品質の証明:** すべての知見が RED-GREEN プロセスを経て検証され、断片化による混乱がないこと。

---

## 2. アーキテクチャ (Architecture)

### 2.1 知見の地層と優先順位 (The Strata AA)

AI エージェントは、実行時に以下の 4 つの層を順にスキャンし、インストラクションを動的に合成（上書き）する。

```text
[ 低優先 ]                                                                                        [ 高優先 ]
  L1: Core (Skills)             L2: Extension (Shared)        L3: Personal (Global)         L4: Project (Local)
  (~/.gemini/extensions/skills) (~/.gemini/extensions/obs)    (~/.gemini/observations/)     (./.gemini/observations/)
          |                             |                             |                             |
          +-----------------------------+-----------------------------+-----------------------------+
                                        |
                                        v
                               [ AI Execution Context ]
```
※ 上記 AA 内の `obs` は `observations` の略記。物理パスは以下を参照。

### 2.2 物理パスの定義

| 層 | 名称 | 物理パス (例: macOS) | 役割 | 優先順位 |
| :--- | :--- | :--- | :--- | :---: |
| **L1** | **Core** | `~/.gemini/extensions/superpowers/skills/` | 移植済みスキル。原則固定。 | 4 (低) |
| **L2** | **Extension** | `~/.gemini/extensions/superpowers/observations/` | **リポジトリ同梱。** 全環境配布用。 | 3 |
| **L3** | **Personal** | `~/.gemini/observations/` | PC 固有の「ユーザーの癖」。 | 2 |
| **L4** | **Project** | `./.gemini/observations/` | **プロジェクト同梱。** Git 共有用。 | 1 (高) |

---

## 3. 品質規律：ドキュメンテーション TDD (RED-GREEN-REFACTOR)

知見の採取および昇格において、以下の RED-GREEN サイクルを **必須の義務** とする。

### 3.1 採取 (RED -> GREEN)
1.  **RED (課題の特定)**: 知見を適用する前に、期待しない挙動（または現状の課題）を物理的に確認する。
2.  **GREEN (知見の配置)**: L4 に知見を配置し、AI の挙動が改善されることを確認する。

### 3.2 昇格と精錬 (REFACTOR)
1.  **REFACTOR (精錬)**: L4 から L3、あるいは L3 から L2 へ昇格させる際、知見をより汎用的・簡潔な表現に整理する。
2.  **検証**: 昇格後、上位層（ソース側）を **自動削除 (Strict Cleanup)** し、依然として期待通りの挙動が維持されるか（下位層に正しく継承されたか）を最終確認する。

---

## 4. 知見の循環プロセス (Knowledge Lifecycle)

### 4.1 `observation-distiller` の昇格
本プロジェクトのメタスキル（`.gemini/skills/`）から、拡張機能のコアスキル（`skills/`）へと昇格させ、URL インストールで配信可能にする。

### 4.2 循環のフロー
- **Capture**: RED-GREEN を経て **L4 (Project)** に記録。
- **Personalize**: L4 から **L3 (Personal)** へ移動（昇格）。
- **Distribute**: L3 から **L2 (Extension)** へコピー（配布）。

---

## 5. 憲法への組み込み (Mandate Routing)

`GEMINI.md`（憲法）に、上記 2.1 の四層スキャンロジックを明文化する。これにより、AI はどのプロジェクトにおいても、拡張機能が提供する L2 レイヤーを自動的に認識・合成する。

---

## 6. リスクと対策 (Risks & Mitigations)

- **英知の断片化:** 指示が複数のファイルに分かれることによる AI の混乱。
    - *対策:* AI に対し「常に下位の層の内容を上位の層が補足・修正している」という構造（The Strata）を強く意識させるメタ・インストラクションを付与する。
- **重複情報の蓄積:**
    - *対策:* 昇格時の **Strict Cleanup (自動削除)** を徹底し、一箇所の変更が他に波及しない「唯一の真実のソース (SSOT)」を維持する。
