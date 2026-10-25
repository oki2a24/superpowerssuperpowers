# GPAC・地層パスの汎用化設計 (2026-10-25)

## 意図と背景

前回のリポジショニング（`docs/plans/2026-10-25-generic-harness-repositioning-design.md`）で、本プロジェクトの役割を「生成AIハーネス全般をカバーする汎用スキル群」として再定義した。しかしアーキテクチャ レベルには agy 依存が残っている。本設計はそれを解消する:

1. **地層パス**: `observation-distiller` の L3/L4 が `~/.antigravity/observations/`・`./.antigravity/observations/` を指す一方、実際のデータは `./.agents/observations/` に置かれており不整合がある。
2. **GPAC スクリプト**: `scripts/agy_sub.mjs` が SSOT 先 `~/.antigravity/sub-sessions/` とハーネス起動 CLI `agy` をハードコード。env 名も `GEMINI_SUB_LAUNCHER`（Gemini 時代の名残）。
3. **todo.mjs**: 既定タスクディレクトリが `.antigravity/tasks`（ただしリポジトリには既に `.agents/tasks/.gitkeep` が存在＝実態上の想定先）。

## ゴール / 非ゴール

**ゴール**
- 地層パスの汎用化と、strata.md・README・実際の運用ディレクトリの不整合解消。
- GPAC スクリプトの汎用化: `agy_sub.mjs` → `gpac_sub.mjs` 改名、SSOT パス・起動方式・env 名の汎用化。
- `todo.mjs` の既定タスクディレクトリを `.agents/tasks` に変更。
- `session-coordination` スキル・README GPAC 節・テストの追従。
- 旧パス利用者向けの移行案内の文書化。

**非ゴール**
- `observations/` 配下知見ファイルの **内容** の全面書き換え（agy 流運用規律の再設計）。ただし、改名したスクリプト名・パスへの機械的参照はこの機会に更新する。
- 各ハーネス（opencode / Codex 等）の**ネイティブ**サブエージェント API への GPAC の置き換え。GPAC は「CLI 画面からハーネスを起動する」という最も汎用的な方式に降着させ、ハーネス固有 API は掴み取らない。
- `superpowers-original/`（上流参照）への同様の改変。

## ユーザー承認済みの設計判断

1. **名前空間を `agents` / `gpac` 系に統一**:
   - GPAC SSOT: `~/.antigravity/sub-sessions/` → `~/.agents/sub-sessions/`
   - 地層 L3: `~/.antigravity/observations/` → `~/.agents/observations/`
   - 地層 L4: `./.antigravity/observations/` → `./.agents/observations/`（既存運用と一致）
   - スクリプト: `scripts/agy_sub.mjs` → `scripts/gpac_sub.mjs`
   - env: `GEMINI_SUB_LAUNCHER` → `GPAC_LAUNCHER` / `ANTIGRAVITY_TASK_DIR` → `AGENTS_TASK_DIR`
   - `todo.mjs` の既定パス: `.antigravity/tasks` → `.agents/tasks`
2. **サブセッション起動**: `GPAC_AGENT_COMMAND` env でハーネス起動コマンドを指定した場合のみ自動起動（tmux モード含む）を有効化。未設定時は **manual モードを既定**とする。

   **契約（ビルダーチェック Q1 の回答）**: `GPAC_AGENT_COMMAND` は **シェルコマンド文字列全体**（harness CLI の実行ファイル名 + 追加引数）として扱う。例: `opencode run`、`codex exec`、`claude -p`、`agy`。実行時は末尾にクォート済みプロンプトを 1 つの引数として付加し、`bash -c` 経由で実行する（tmux モードの現行実装と同様）。値は設定者自身が env で指定する信頼済み文字列という前提で、追加のエスケープは行わない。未設定時の manual モード出力はプレースホルダ表示ではなく、「`GPAC_AGENT_COMMAND` 未設定のため共有する起動命令」の形式でプロンプト本文を提示し、`GPAC_AGENT_COMMAND="<CLI> [args...]" node scripts/gpac_sub.mjs ...` による再実行案内を添える。

   **ミッション参照経路（ビルダーチェック Q2 の回答）**: ペイロード内の `show-task` 呼び出しは、**spawn 時に算出したスクリプトの絶対パス**を埋め込む（`import.meta.url` から解決）。workDir が拡張リポジトリ外の任意プロジェクトでも任務参照が可能になる。相対参照での運用前提は撤廃する。
3. **後方互換性**: 旧 `~/.antigravity/` 配下への自動フォールバックは実装しない。README と TODO に移行手順（`mv`）の案内を記載。ただし `todo.mjs` の env 旧名 `ANTIGRAVITY_TASK_DIR` は、既存のプロジェクトローカル設定を壊さないよう互換読み（廃止予定として扱う）のみ許容する。

## 実装すべき内容（ビルダー向け詳細）

### scripts/gpac_sub.mjs（改名・改変）
- `getGpacBaseDir()` → `~/.agents/sub-sessions` を返す。
- `getCliCommand()` → `process.env.GPAC_AGENT_COMMAND || null` を返す。
- `createPayload(workDir, taskId)` → 未設定時も生成可能とし、CLI 部を `GPAC_AGENT_COMMAND`、未設定なら `<YOUR_AGENT_CLI>`（案内コメント付き）とする。内部の命令文は `node scripts/gpac_sub.mjs show-task <id>` を参照させる。
- `launchSession()` は `GPAC_AGENT_COMMAND` が未設定の場合 tmux モードを出さず manual モードにフォールバックする。
- `main()` の launcher env 既定値は `GPAC_LAUNCHER`。
- 全コマンドのヘルプ・出力文言も GPAC 名で統一（"Peer-Agent Coordination (GPAC)"）。

### scripts/todo.mjs
- `getTaskDir()` → `process.env.AGENTS_TASK_DIR || process.env.ANTIGRAVITY_TASK_DIR || ".agents/tasks"`（旧名は廃止予定の互換読み、コメントで明記）。

### skills/session-coordination/SKILL.md
- GPAC の名称表現："Antigravity Peer-Agent Coordination (GPAC)" → "Peer-Agent Coordination (GPAC)"。
- クイックリファレンスの全コマンドを `scripts/gpac_sub.mjs` に更新。
- SSOT パスを `~/.agents/sub-sessions/` に更新。`[extension-path]` の例示を汎用化（例: 本リポジトリを URL インストールした場合の配置先）。
- `GPAC_AGENT_COMMAND` / `GPAC_LAUNCHER` / manual 既定の運用を追記。

### skills/observation-distiller/strata.md
- L3/L4 パスを汎用化（`~/.agents/observations/`、`./.agents/observations/`）。図解も同様。
- L3/L4 がクロスランタイムな `~/.agents` / `.agents` 規約に乗る旨を追記。

### README.md
- 「知見の地層と優先順位」図解・「ファイルシステムへの影響」表を新パスに更新。
- 「GPAC プロトコル (Antigravity/Gemini Peer-Agent Coordination)」→「Peer-Agent Coordination (GPAC)」とし、SSOT パス記載があれば更新。
- 旧 `~/.antigravity/` からの移行案内（mv コマンド例）を Rote として追加。

### テスト
- `tests/test_agy_sub.mjs` → `tests/test_gpac_sub.mjs`、`tests/test_agy_sub_ui.mjs` → `tests/test_gpac_sub_ui.mjs` に改名し、内部の `~/.antigravity` パス・env 名を更新。
- `tests/test_todo_*` の env 名 `ANTIGRAVITY_TASK_DIR` → `AGENTS_TASK_DIR` に統一（互換読みのテストも 1 つ追加）。

### その他の機械的参照更新
- `observations/`・`skills/`・`.agents/`・`docs/` 内の、改名対象（`agy_sub` / `.antigravity/tasks` / `sub-sessions` / `GEMINI_SUB_LAUNCHER`）への参照を現実の名前に合わせる。履歴文書（`docs/plans/` の過去資料、`docs/superpowers_ports.md` の上流同期記録）は除く。

   **スコープの限定（ビルダーチェック Q3 の回答）**: 以下は更新**対象外**とする。
   - `observations/writing-skills.md` の `~/.antigravity/skills/` 対応表、`.agents/observations/verification-before-completion.md` の `~/.antigravity/extensions/...` — Antigravity 実インストール先の**事実の記述**であり、知見内容の改変（非ゴール）に当たるため。
   - README「セキュリティ & プライバシー > 最小権限の原則」の `~/.antigravity/` は README 自体が汎用ドキュメントであり、**新パス `~/.agents/` に書き換える**。

   **移行案内の配置（ビルダーチェック Q4 の回答）**: 移行手順（`mv` コマンド例）は README に追記する（「Rote」は NOTE の誤記）。実装完了時に `docs/TODO.md` の「6. ハーネス汎用化の残課題」の該当 2 項目をチェック済みにして完了化する。

- 配布バージョン: コア（`skills/`、`scripts/`）変更のため 3 マニフェストを `1.12.7` に連動。完了前 `node scripts/finish_check.mjs origin/main` と全テストをパスさせる。

### 運用上の注意
- `hooks/session-start.mjs`・`.opencode/plugins/` 内に .antigravity 参照が無いことをビルダーが検証すること。
- 旧環境変数名のエイリアス以外に、挙動互換は要求しない（パス変更は意図的な破壊的変更であり、移行案内でカバーする）。
