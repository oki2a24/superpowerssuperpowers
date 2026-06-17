# Antigravity CLI (agy) 完全移行 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** 従来の Gemini CLI 用に構築された本プロジェクトのレガシーファイルを完全に削除し、Antigravity CLI (agy) 用にスクリプト・スキル定義・ドキュメントを完全移行・クリーンアップする。

**アーキテクチャ:** レガシーディレクトリ（`.gemini/`）と定義ファイルの物理的削除、`scripts/todo.mjs` および `gemini_sub.mjs` (agy_sub.mjs へリネーム) のパス置換、および各種ドキュメントからの Gemini CLI 記述のクリーンアップ。

**技術スタック:** Node.js (標準ライブラリ), Bash/Zsh

---

## 🛠 タスク詳細

### タスク 1: 物理ファイルの削除とリネーム

**ファイル:**
* 削除: `gemini-extension.json`
* 削除: `GEMINI.md`
* 削除: `./.gemini/` (ディレクトリごと)
* リネーム: `scripts/gemini_sub.mjs` ➡️ `scripts/agy_sub.mjs`

* [ ] **ステップ 1: レガシー設定ファイルおよび憲法の削除**
  実行: `rm gemini-extension.json GEMINI.md`
  期待値: ファイルが削除されること。
* [ ] **ステップ 2: レガシーディレクトリの削除**
  実行: `rm -rf .gemini`
  期待値: プロジェクトルートの `.gemini` ディレクトリが完全に削除されること。
* [ ] **ステップ 3: GPAC 制御スクリプトのリネーム**
  実行: `mv scripts/gemini_sub.mjs scripts/agy_sub.mjs`
  期待値: `scripts/gemini_sub.mjs` が `scripts/agy_sub.mjs` に名前変更されること。
* [ ] **ステップ 4: 削除とリネームのコミット**
  実行:
  ```bash
  git add gemini-extension.json GEMINI.md .gemini scripts/gemini_sub.mjs scripts/agy_sub.mjs
  git commit -m "refactor: delete gemini legacy files and rename gemini_sub.mjs to agy_sub.mjs"
  ```
  期待値: Git コミットが正常に完了すること。

---

### タスク 2: `scripts/todo.mjs` の修正

**ファイル:**
* 変更: `scripts/todo.mjs:7-14`

* [ ] **ステップ 1: タスク格納ディレクトリと環境変数の修正**
  修正箇所: `scripts/todo.mjs` の `getTaskDir()` 関数。

  **変更前 (Before):**
  ```javascript
  /**
   * TODO ファイルを保存するディレクトリのパスを取得します。
   * 環境変数 GEMINI_TASK_DIR が設定されている場合はそれを優先し、
   * 設定されていない場合はデフォルトの ".gemini/tasks" を使用します。
   */
  export function getTaskDir() {
    return process.env.GEMINI_TASK_DIR || ".gemini/tasks";
  }
  ```

  **変更後 (After):**
  ```javascript
  /**
   * TODO ファイルを保存するディレクトリのパスを取得します。
   * 環境変数 ANTIGRAVITY_TASK_DIR が設定されている場合はそれを優先し、
   * 設定されていない場合はデフォルトの ".antigravity/tasks" を使用します。
   */
  export function getTaskDir() {
    return process.env.ANTIGRAVITY_TASK_DIR || ".antigravity/tasks";
  }
  ```
* [ ] **ステップ 2: 動作検証（テスト）**
  実行: `node scripts/todo.mjs show`
  期待値:
  * 既存の `.gemini` ディレクトリが消えているため、新規タスクディレクトリ `.antigravity/tasks` 側を参照し、「No active TODO for this project.」と出力されること。
  * `node scripts/todo.mjs init "Test"` を実行した際、`.antigravity/tasks/` 下にファイルが作成されること。
* [ ] **ステップ 3: コミット**
  実行:
  ```bash
  git add scripts/todo.mjs
  git commit -m "refactor: update todo.mjs task path to .antigravity/tasks"
  ```

---

### タスク 3: `scripts/agy_sub.mjs` の修正

**ファイル:**
* 変更: `scripts/agy_sub.mjs` (全体)

* [ ] **ステップ 1: パス解決および CLI 動的判定のクリーンアップ**
  修正箇所:
  * `getGpacBaseDir` 関数 (以前の228行目付近)
  * `getCliCommand` 関数 (以前の243行目付近)
  * 各種ヘルプテキスト、AA案内、エラーメッセージ

  **変更前 (Before):**
  ```javascript
  export function getGpacBaseDir(homeDir = null) {
    const baseHome = homeDir || os.homedir();
    const antigravityDir = path.join(baseHome, '.antigravity', 'sub-sessions');
    const geminiDir = path.join(baseHome, '.gemini', 'sub-sessions');

    if (fs.existsSync(path.join(baseHome, '.antigravity'))) {
      return antigravityDir;
    }
    if (fs.existsSync(path.join(baseHome, '.gemini'))) {
      return geminiDir;
    }
    return antigravityDir;
  }

  export function getCliCommand() {
    try {
      const res = spawnSync('which', ['agy'], { encoding: 'utf8' });
      if (res.status === 0) {
        return 'agy';
      }
    } catch (e) {
      // ignore
    }
    return 'gemini';
  }
  ```

  **変更後 (After):**
  ```javascript
  export function getGpacBaseDir(homeDir = null) {
    const baseHome = homeDir || os.homedir();
    return path.join(baseHome, '.antigravity', 'sub-sessions');
  }

  export function getCliCommand() {
    return 'agy';
  }
  ```

  さらに、ファイル全体（特に `main` 内や AA 案内文）に存在する以下の文字列を置換してください。
  * `node scripts/gemini_sub.mjs` ➡️ `node scripts/agy_sub.mjs`
  * "gemini_sub.mjs" ➡️ "agy_sub.mjs"
  * "Gemini Peer-Agent Coordination" ➡️ "Antigravity Peer-Agent Coordination"
* [ ] **ステップ 2: 動作検証**
  実行: `node scripts/agy_sub.mjs`
  期待値: ヘルプメッセージが表示され、そこに「Antigravity Peer-Agent Coordination」や「agy_sub.mjs」という文言が含まれていること。
* [ ] **ステップ 3: コミット**
  実行:
  ```bash
  git add scripts/agy_sub.mjs
  git commit -m "refactor: update agy_sub.mjs implementation to fully target agy and .antigravity"
  ```

---

### タスク 4: 内部スキル定義 (`.antigravity/skills/`) の修正

**ファイル:**
* 変更: `.antigravity/skills/port-superpowers-skill/SKILL.md`
* 変更: `.antigravity/skills/sync-upstream-skill/SKILL.md`
* 変更: `.antigravity/skills/update-superpowers-ports-doc/SKILL.md`

* [ ] **ステップ 1: `port-superpowers-skill/SKILL.md` の置換**
  `.antigravity/skills/port-superpowers-skill/SKILL.md` 内の `.gemini` パスおよび `gemini` コマンド記述を置換します。

  * 以前の8行目付近: `Gemini CLIへのスキル移植プロセス` ➡️ `Antigravity CLIへのスキル移植プロセス`
  * 以前の48-52行目付近: `gemini skills list` ➡️ `agy extension list`（または対応する extension コマンド）
  * 以前の56行目付近: `./.gemini/skills/{skill_name}/SKILL.md` ➡️ `./.antigravity/skills/{skill_name}/SKILL.md`
  * 以前の77行目付近: `gemini --resume latest` ➡️ `agy --resume latest`
  * 以前の102行目付近: `./.gemini/skills/{skill_name}/SKILL.md` ➡️ `./.antigravity/skills/{skill_name}/SKILL.md`
* [ ] **ステップ 2: `sync-upstream-skill/SKILL.md` & `update-superpowers-ports-doc/SKILL.md` の置換**
  * 各ファイル内の `gemini` および `Gemini CLI` 表記を `agy` および `Antigravity CLI (agy)` に置換。
* [ ] **ステップ 3: コミット**
  実行:
  ```bash
  git add .antigravity/skills/
  git commit -m "refactor: port internal skill definitions to Antigravity CLI"
  ```

---

### タスク 5: 外部提供スキル定義 (`skills/session-coordination/SKILL.md`等) の修正

**ファイル:**
* 変更: `skills/session-coordination/SKILL.md`

* [ ] **ステップ 1: 外部提供スキル内のパス置換**
  `skills/session-coordination/SKILL.md` 内に存在する `gemini_sub.mjs` および `.gemini` への参照を修正します。

  * `node scripts/gemini_sub.mjs` ➡️ `node scripts/agy_sub.mjs`
  * `~/.gemini/sub-sessions` ➡️ `~/.antigravity/sub-sessions`
* [ ] **ステップ 2: コミット**
  実行:
  ```bash
  git add skills/session-coordination/SKILL.md
  git commit -m "refactor: update external session-coordination skill to call agy_sub.mjs"
  ```

---

### タスク 6: ドキュメントおよび設定ファイルのクリーンアップ

**ファイル:**
* 変更: `README.md`
* 変更: `ANTIGRAVITY.md`
* 変更: `.gitignore`

* [ ] **ステップ 1: `README.md` のクリーンアップ**
  `README.md` の中の `gemini` / `gemini-extension.json` 関連の以下の記述を削除または整理します。
  * Gemini CLI 用のインストールコマンド部分（35-44行目の `Gemini CLI の場合` ブロック）を完全に削除。
  * アーキテクチャ図（The Strata）などにある `(~/.gemini/observations/)` などの併記記述をクリーンアップし、`~/.antigravity/` のみに統一。
* [ ] **ステップ 2: `ANTIGRAVITY.md` のクリーンアップ**
  * `ANTIGRAVITY.md` に残っている `.gemini/` や `GEMINI.md` への参照表記を整理し、完全に `.antigravity/` や `ANTIGRAVITY.md` に一本化。
* [ ] **ステップ 3: `.gitignore` の修正**
  * `.gemini/tasks/*` ➡️ `.antigravity/tasks/*` に修正。
  * `!.gemini/tasks/.gitkeep` ➡️ `!.antigravity/tasks/.gitkeep`
* [ ] **ステップ 4: コミット**
  実行:
  ```bash
  git add README.md ANTIGRAVITY.md .gitignore
  git commit -m "docs: cleanup gemini references and update gitignore"
  ```

---

## 🔍 最終物理的検証 (Verification)

全ての修正完了後、以下の手順で動作を確認してください。

1. **スクリプトの直接実行確認**:
   `node scripts/todo.mjs show` および `node scripts/agy_sub.mjs` がエラーなく実行できること。
2. **Git差分の監査**:
   `git status` および `git diff origin/main` を確認し、`.gemini` ディレクトリや `gemini-extension.json`, `GEMINI.md` が完全に削除され、変更内容に意図しない一時ファイルやゴミが残っていないこと。
3. **プラグインとしてのロード確認**:
   `agy extension update superpowerssuperpowers`（ローカルリンク開発中の場合は `agy` の再ロード）を実行し、エラーなく拡張機能が認識され、新しく移植された `sync-upstream-skill` などが `agy` のコンテキスト内で認識されることを確認。
