# プロジェクト TODO リスト (2026-03-24 更新)

本プロジェクトのさらなる進化、スキルの高度化、および未完了タスクの管理表です。

## 1. 優先課題：階層化アーキテクチャの運用と遺産の整理
- [x] **[基盤] 階層化 Observations アーキテクチャ (The Strata) の導入**:
    - **成果**: L1-L4 の四層構造を確立し、`observation-distiller` をコアスキルへ昇格させた。
- [x] **[移行] 旧 Local Adaptation の Observations への統合**:
    - **成果**: 各移植済みスキルの末尾にあった「ローカル・アダプテーション」を `observations/` (L2) へ移動し、本体をクリーンにした。
- [x] **[整理] 不要になった旧世代ツールの削除**:
    - **成果**: `reset_skill.mjs` およびそのテストを物理削除し、各スキルや README からの依存も解消した。

## 2. スキル定義の継続的進化
- [ ] **`session-retrospective` の高度化**: 
    - **[成果] 構造化された振り返りプロセスの導入 (2026-04-03)**: 物理的証拠に基づく RED と資産マッピングを実装。
    - **[残題] `observation-distiller` との密結合**: 振り返り時に特定された改善案を、`observation-distiller` に直接引き渡して実行するプロンプトの自動化。
- [ ] **`session-coordination` スキルの高度化**: 
...
## 5. ツールの堅牢化 (Tool Hardening)
- [ ] **`scripts/todo.mjs` の操作 UX 改善**:
    - **課題 (2026-04-03)**: `init` -> `start` -> `done` の状態遷移において、タスク名（pattern）での指定が曖昧な場合や、状態の不一致によるエラーが頻発した。
    - **物理的証拠**: `Error: Task matching '...' not found or already started.`
    - **対策案**: `show` コマンドで ID を優先表示し、すべてのコマンドで ID 指定を第一選択とするよう、ヘルプおよびスキル（`roadmap-management`）を更新する。

## 3. 自己進化の規律 (Self-Evolutionary Discipline) - Observations による自律化
- [x] **[基盤] Observations 駆動型アダプテーションの導入**:
    - **成果**: 知見を外部化し、本体を汚染せず進化させる `observation-distiller` スキルと憲法プラグインを実装。
- [ ] **[運用] 各スキルの「知見」の蓄積と本体への昇華**:
    - **TDD 防弾化**: `writing-skills` 等への改善知見を `observations/` に蓄積し、十分熟成した段階で上位レイヤーへ昇格させる。
    - **図解検品**: AA 図解の「空間的スキャン」プロトコルを `observations/brainstorming.md` 等に記録し、送信前の自律チェックを習慣化する。

## 4. 未来の布石：システムワイドな知見統合 (System-wide Observation Integration)
- [ ] **[フェーズ 2]Observations のグローバル展開と自己改善ループの完成**:
    - **成功条件**: 本プロジェクト内での **10セッション以上の実戦運用** で、知見が正しく蒸留・活用されることを確認すること。
    - **展開先**: グローバルな **`~/.gemini/GEMINI.md`** へのメタ・ルール追加。
    - **技術課題**: ワークスペース外のグローバル領域への安全な書き込み（`replace` 提案）の自動化と、ユーザーによる「resume 依頼」の正規フロー化。
    - **マイルストーン**: `reset_skill.mjs` が完全に不要になり、「知見」が AI の主要な適応手段として確立された状態。

---
*Created by Gemini CLI Agent. 過去の完了済みセクションは、プロジェクトの歴史としてコミット履歴に保存されています。*
