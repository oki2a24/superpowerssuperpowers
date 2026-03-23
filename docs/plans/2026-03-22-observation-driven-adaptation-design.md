# デザインドキュメント： Observations 駆動型アダプテーション (Observation-Driven Adaptation)

## 1. 概要 (Context & Goals)

現在の「スキル本体（`SKILL.md`）を直接書き換える」ローカルアダプテーション手法は、オリジナルのアップデートへの追随を困難にし、頻繁な `reset_skill.mjs` によるリセット作業を強いている。

本設計は、知見を「外部プラグイン（Observations）」として分離し、AI の「憲法（Mandate）」によって動的に注入する構造を導入することで、スキル本体をクリーンに保ちつつ、プロジェクトや個人の流儀に最適化された挙動を実現する。

### 成功基準 (Success Criteria)
- **非破壊的進化:** `SKILL.md` を変更することなく、プロジェクト固有のルールを適用できる。
- **ハイブリッド知見:** 「個人の流儀（グローバル）」と「プロジェクトの掟（ローカル）」が自然に統合される。
- **リセット不要:** スキル本体が汚染されないため、物理的なファイルリセット作業が不要になる。
- **システムワイドな改善:** 特定のプロジェクトを超えた、汎用的なスキルの改善（昇華）を支援する。

---

## 2. アーキテクチャ (Architecture)

システムは以下の三位一体 (The Trinity) の構造で構成される。

### 構造図 (構造とフロー)
```text
[ グローバル領域 (~/.gemini/) ]          [ ローカルプロジェクト (./) ]
├── GEMINI.md (憲法本体) <---------------+ (1) 憲法の命令: "知見を読み込め"
└── observations/ (知見ディレクトリ)     |
    ├── writing-plans.md (共有のコツ)    |
    └── GEMINI.md (普遍的な行動原理)     |
                                         |
                                         ├── .gemini/observations/
                                         │   ├── writing-plans.md (PJ固有ルール)
                                         │   └── GEMINI.md (PJの基本方針)
                                         |
[ AI エージェント (Gemini CLI) ]         | (2) 適応的な実行
      ^                                  |
      +-------[ タスクセッション ]-------+
                    |
                    v (3) 昇華 (セッション振り返り)
      [ 知見蒸留器 (Distiller スキル) ]
             /            \
      (グローバルへ)    (ローカルへ)
```

---

## 3. 設計の詳細 (Design Details)

### 3.1 命名規則と配置 (Naming & Placement)
知見ファイルの名前は、対象となるエンティティ（スキル名、または `GEMINI.md`）と完全一致させる。

- **スキル知見:** `observations/スキル名.md`
- **憲法知見:** `observations/GEMINI.md`

**優先順位:**
1.  `~/.gemini/observations/{name}.md` (Global: ユーザー個人の流儀)
2.  `./.gemini/observations/{name}.md` (Local: プロジェクト固有の掟)
※ 同一の項目がある場合は、Local が Global を上書きする。

### 3.2 憲法へのプラグイン (Mandate Injection)
`~/.gemini/GEMINI.md` に、以下の「2段階の知見統合プロセス」を追記する。

> **Adaptive Knowledge Integration (適応的知見統合):**
> 
> **ステップ1：セッション開始時 (Discovery & Core Logic)**
> 調査（Research）フェーズの初期段階で、以下のディレクトリ内のファイル一覧を確認せよ。
> - `~/.gemini/observations/`
> - `./.gemini/observations/`
> その際、`GEMINI.md` が存在する場合は直ちに読み込み、本憲法を補完する最優先の行動原理として適用せよ。その他のスキル用知見（`スキル名.md`）については、存在のみを把握し、この段階では読み込むな。
> 
> **ステップ2：スキル使用時 (On-demand Injection)**
> 特定のスキルを使用する直前に、ステップ1で存在を確認した対応する知見ファイル（`スキル名.md`）を読み込め。その内容は、そのスキルの実行における最優先の制約事項として遵守せよ。

### 3.3 活用モードの分離 (Dual Modes)

#### A. スキル利用者モード (適応)
- **対象:** URL からインストールしたスキルなど。
- **挙動:** 知見を `observations/*.md` に留め、本体はクリーンに保つ。オリジナルの更新に安全に追随できる。

#### B. スキル開発者モード (昇華)
- **対象:** 自分が開発・管理しているスキル。
- **挙動:** `observations/*.md` に溜まった知見を定期的に `SKILL.md` 本体へマージし、知見ファイルをクリアする。これが「スキルの進化」となる。

---

## 4. 実装フェーズ (Implementation Phases)

### Phase 1: 基盤整備 (Foundation)
- [ ] `observation-distiller` スキルのプロトタイプ作成（`session-retrospective` の統合・進化）。
- [ ] グローバル憲法（`GEMINI.md`）へのメタ・ルール追記。

### Phase 2: 知見の外部化 (Externalization)
- [ ] 既存の `SKILL.md` 内に書き込まれたプロジェクト固有ルールを、`observations/*.md` へ移行する。
- [ ] `reset_skill.mjs` の役割を「知見の管理（クリア・移行）」へ再定義する。

---

## 5. リスクと対策 (Risks & Mitigations)

- **コンテキストの肥大化:** 知見ファイルが増えすぎるとトークンを圧迫する。
    - *対策:* Distiller による定期的な「要約・圧縮」機能を実装する。
- **知見の衝突:** Global と Local で矛盾する知見がある場合。
    - *対策:* Local を優先する優先順位を憲法で明文化する。
