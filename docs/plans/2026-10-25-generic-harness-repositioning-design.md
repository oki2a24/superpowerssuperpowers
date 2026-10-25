# ハーネス汎用化リポジショニング設計 (2026-10-25)

## 意図と背景

`superpowerssuperpowers` は `obra/superpowers` を **Gemini CLI に移植したこと**が始まりだった。その後、後継の **Antigravity CLI (agy)** への対応を経て対応ハーネスが拡張されたが、現在の開発・利用の主環境は opencode と Codex であり、agy/Gemini はほぼ使われていない。

これは「opencode/Codex への引っ越し」を意味するものではない。本プロジェクトの役割は、**特定ハーネス非依存の「生成AIコーディングハーネス向け汎用スキル群」**へと変化している。opencode や Codex は「現に使っているハーネスの一例」であり、位置付けそのものではない。本設計は、この役割の変化をドキュメント・スキル群に反映させる。

## ゴール

- README・配布マニフェスト・スキル本文中の「agy / Gemini CLI 前提」の文言を汎用化し、ハーネス非依存の位置付けを明示する。
- `docs/superpowers_ports.md` 冒頭に「歴史的経緯（Gemini CLI → agy → 汎用）」を記録する。
- プロジェクト憲法ファイル `ANTIGRAVITY.md` を `AGENTS.md` に改名・汎用化する（Claude Code / agy の `CLAUDE.md`・`ANTIGRAVITY.md` に相当するクロスハーネス標準規約ファイル）。
- 上記の意図的な変更・未解決事項を監査可能な形（本書・TODO・ports 記録）に残す。

## 非ゴール（本設計では扱わない）

- **スクリプト・実行時挙動の変更**: `scripts/agy_sub.mjs`、`scripts/todo.mjs` の既定パス（`.antigravity/tasks`）、レジストリ判定などは変更しない。
- **地層パスの再設計**: `observation-distiller` の L3/L4 パス（`~/.antigravity/observations/` 等）の汎用化は行わない（README 内の図も含む）。
- **`session-coordination`（GPAC）の通信方式の再設計**: agy のセッション spawn API に依存する部分はそのまま残す。
- **`observations/` 配下の agy 適応対応表の全面書き換え**: 対応表は agy 環境の実例として保持し、他ハーネスは `using-superpowers/references/` を併用するよう案内するだけに留めた。

## 主な変更と判断

| 変更 | 内容 | 判断の理由 |
| :-- | :-- | :-- |
| 憲法ファイル改名 | `ANTIGRAVITY.md` → `AGENTS.md` | codex / opencode がネイティブに読むクロスハーネス標準のため。agy 用マニフェストの `contextFileName` も追従させ、内容は汎用文言に書き換えた |
| 関連知見ファイル改名 | `observations/ANTIGRAVITY.md`・`.agents/observations/ANTIGRAVITY.md`・`.../ANTIGRAVITY_MD_TESTING.md` を `AGENTS.md` / `AGENTS_MD_TESTING.md` へ | 憲法ファイル名に合わせた名前付け規約の維持 |
| `finish_check.mjs` の監視対象 | `coreFiles` を `AGENTS.md` に更新し、`tests/test_finish_check.mjs` も同期 | 改名後も版更新漏れ検知を機能させるため |
| README | タグライン・概要・カタログ紹介文を汎用化。変遷の NOTE を追加。インストール手順（agy / Pi / opencode / Codex）は現行サポートとして保持 | agy は「現行のインストール先の1つ」であり、削除対象ではない |
| `docs/superpowers_ports.md` | 冒頭に「歴史的経緯」セクションを追加。`ANTIGRAVITY_MD_TESTING.md` の参照を現行名に更新 | 履歴ドキュメントとは別に、プロジェクトの現在の位置付けを明示する必要があるため |
| `docs/FACTORY.md` | 存在しない `gemini_sub.mjs` / `gemini-extension.json` への参照を実物（`agy_sub.mjs` / `finish_check.mjs` 監視対象の3マニフェスト）に修正し、Gemini 固有文言を汎用化 | ドキュメントの誤記修正と汎用化を一括で行う |
| `dispatching-parallel-agents` | 「Antigravity CLI (agy) での実現方法」節を「実行環境での実現方法」に汎用化（ネイティブサブエージェント優先 → マルチワークツリー → バックグラウンド実行 → 論理的並行） | agy 専用だった手順を、各ハーネスに読み替え可能な手順に |
| `writing-skills` | スキル配置先・読み替えガイドの参照を汎用化 | 特定環境名の前提を外す |

## 未解決事項（後続プロジェクト）

1. **地層パスの汎用化**: `strata.md`（`~/.antigravity/observations/`、`./.antigravity/observations/`）と README 記載の L3/L4 パスをクロスランタイムな `.agents/` 系規約へ統一。strata.md と README・実際の運用（`.agents/observations/` に実データ）の間の不整合解消を含む。
2. **GPAC 実装の汎用化**: `scripts/agy_sub.mjs` と `session-coordination` スキルを特定ハーネス非依存へ再設計。`scripts/todo.mjs` の `.antigravity/tasks` 既定パスも対象。
3. **`observations/` 配下の agy 適応対応表の全面汎用化**（例: `observations/writing-skills.md` や `.agents/observations/AGENTS.md` 内の agy リロード手順）。

以上は `docs/TODO.md` の「6. ハーネス汎用化の残課題 (2026-10-25)」にも登録済み。
