# Antigravity CLI (agy) 完全移行・クリーンアップ計画 (Design Document)

本計画は、従来の Gemini CLI 用に構築されていた本プロジェクト `superpowerssuperpowers` のレガシー設定やファイル（`.gemini` など）を完全に廃止し、後継である **Antigravity CLI (agy)** および `.antigravity` へ完全に一本化・クリーンアップするための設計書です。

別セッションでのスムーズな実装引き継ぎのために、物理的な変更内容と影響範囲を定義します。

---

## 1. 物理ファイル構成の変更 (Physical Changes)

### 1.1 削除対象 (Deletions)
* **`gemini-extension.json`**:
  * Gemini CLI 専用の拡張機能定義ファイル。Antigravity CLI は `antigravity-extension.json` のみを読み込むため不要。
* **`GEMINI.md`**:
  * Gemini CLI 専用のプロジェクト憲法。`ANTIGRAVITY.md` が存在するため不要。
* **`./.gemini/` ディレクトリ**:
  * 旧 CLI 用の設定、スキル定義、タスク一覧などが格納されている。中身の必要な定義はすでに `.antigravity/` にコピーされているため、このディレクトリごと完全に削除。

### 1.2 リネーム対象 (Renames)
* **`scripts/gemini_sub.mjs` ➡️ `scripts/agy_sub.mjs`**:
  * サブセッション（GPAC）管理スクリプト。`gemini` の名を廃し、完全に `agy` 用として統一。

---

## 2. コードおよびスクリプト内の置換設計 (Code Level Modifications)

### 2.1 `scripts/todo.mjs` の修正
タスク管理スクリプトについて、保存先および参照環境変数を Antigravity 用に変更します。
* `getTaskDir()` 関数の戻り値を `".gemini/tasks"` から `".antigravity/tasks"` に書き換え。
* 環境変数の優先順位を `process.env.GEMINI_TASK_DIR` から `process.env.ANTIGRAVITY_TASK_DIR` に変更。

### 2.2 `scripts/agy_sub.mjs` (旧 `gemini_sub.mjs`) の修正
GPAC 制御スクリプトから、旧 CLI のための動的検出・フォールバックロジックを排除し、`agy` 固定に変更します。
* `getGpacBaseDir(homeDir)`:
  * `.gemini/sub-sessions` の検出とフォールバック処理を削除し、`~/.antigravity/sub-sessions` のみを使用するように書き換え。
* `getCliCommand()`:
  * `which agy` による動的検出や `gemini` へのフォールバックを削除し、常に `'agy'` を返すように変更。
* `createPayload(workDir, taskId)`:
  * 実行するコマンド文字列を `agy` に固定。
* `main()` などのヘルプメッセージや案内文:
  * "Gemini Peer-Agent Coordination" ➡️ "Antigravity Peer-Agent Coordination"
  * `node scripts/gemini_sub.mjs ...` ➡️ `node scripts/agy_sub.mjs ...`
  * "gemini_sub.mjs" ➡️ "agy_sub.mjs"

### 2.3 内部スキル定義のパス・コマンド修正 (`.antigravity/skills/` 配下)
本リポジトリの開発・保守専用 of メタ・スキル内の記述を修正します。
* **`port-superpowers-skill/SKILL.md`**:
  * ステップ5: `./.gemini/skills/{skill_name}/SKILL.md` ➡️ `./.antigravity/skills/{skill_name}/SKILL.md`
  * ステップ8: `gemini --resume latest` ➡️ `agy --resume latest`
  * ステップ10: `./.gemini/skills/{skill_name}/SKILL.md` ➡️ `./.antigravity/skills/{skill_name}/SKILL.md`
  * その他、手順内の `gemini skills list` ➡️ `agy extension list`（または対応する extension コマンド）に修正。
* **`sync-upstream-skill/SKILL.md`**:
  * 概要や手順内にある `gemini` 関連の文言を `agy` / `Antigravity` に変更。
* **`update-superpowers-ports-doc/SKILL.md`**:
  * 概要や手順内にある `gemini` 関連の文言を `agy` / `Antigravity` に変更。

### 2.4 提供スキル定義のパス修正 (`skills/session-coordination/SKILL.md` 等)
外部に提供するスキルの中で、`gemini_sub.mjs` への参照がある部分を `agy_sub.mjs` に修正します。
* **`skills/session-coordination/SKILL.md`**:
  * `node scripts/gemini_sub.mjs` ➡️ `node scripts/agy_sub.mjs`
  * `~/.gemini/sub-sessions` ➡️ `~/.antigravity/sub-sessions`

---

## 3. ドキュメントのクリーンアップ (Documentation Updates)

### 3.1 `README.md`
* Gemini CLI のインストール方法（`gemini extensions install...`）を完全に削除。
* アーキテクチャ図や説明文における `gemini` / `.gemini` などの表記を排除し、`agy` / `.antigravity` に統一。

### 3.2 `ANTIGRAVITY.md`
* ルール記述内の `.gemini/` を参照している箇所を削除・整理し、`.antigravity/` のみに統一。

### 3.3 `.gitignore`
* `.gemini/tasks/*` ➡️ `.antigravity/tasks/*`
