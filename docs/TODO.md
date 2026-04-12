# プロジェクト TODO リスト (2026-04-04 更新)

本プロジェクトのさらなる進化、スキルの高度化、および未完了タスクの管理表です。

## 1. 優先課題：フラッグシップ化とオリジナルスキルの昇格 (2026-04-04)
- [x] **[基盤] オリジナルスキルの正規化 (Promotion)**:
    - **成果**: `roadmap-management`, `session-handoff` 等の独自知能スキルを `skills/` へ移動し、外部配布に対応させた。
- [x] **[ブランディング] フラッグシップ README の刷新**:
    - **成果**: 二軸構造（Foundation & Intelligence）と AI-Ready な設計を導入し、ブランドを確立した。
- [x] **[堅牢化] YAML パーサーの外科的強化 (Flagship Edition)**:
    - **成果**: クォート内コロン許容、マルチライン文字列 (|)、空行サポートを、自前実装のミニマリズムを維持したまま TDD で実装。複雑な指示書のパース失敗を完全に解消した。
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
## 3. 自己進化の規律 (Self-Evolutionary Discipline) - Observations による自律化
- [x] **[基盤] Observations 駆動型アダプテーションの導入**:
    - **成果**: 知見を外部化し、本体を汚染せず進化させる `observation-distiller` スキルと憲法プラグインを実装。
- [ ] **[運用] 各スキルの「知見」の蓄積と本体への昇華**:
    - **TDD 防弾化**: `writing-skills` 等への改善知見を `observations/` に蓄積し、十分熟成した段階で上位レイヤーへ昇格させる。
    - **図解検品**: AA 図解の「空間的スキャン」プロトコルを `observations/brainstorming.md` 等に記録し、送信前の自律チェックを習慣化する。

## 4. ツールの堅牢化 (Tool Hardening)
- [x] **`scripts/todo.mjs` の操作 UX 改善 (2026-04-05)**:
    - **成果**: ID ベースの一意な操作、Auto-suspend、構造化ヘルプ、および AI 操作ガイド（`TODO_GUIDE.md`）を実装。状態遷移エラーを根本的に排除し、AI との共鳴を強化した。
    - **検証**: すべての回帰テストがパスし、ID 操作の安定性を TDD で証明。

## 5. 既知の不具合・技術負債 (Known Issues)
- [ ] **`GEMINI.md` 内のインポートエラー調査**: `observation-distiller:start:strata` 等のインポートが ENOENT で失敗する問題の修正。パスの不整合（相対パス vs 絶対パス）のリファクタリングを検討せよ。

---
*Created by Gemini CLI Agent. 過去の完了済みセクションは、プロジェクトの歴史としてコミット履歴に保存されています。*
- [ ] code-reviewer サブエージェントの安定性調査、またはマニュアル・レビュー用チェックリストの整備
