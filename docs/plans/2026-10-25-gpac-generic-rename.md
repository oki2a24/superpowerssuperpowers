# GPAC・地層パスの汎用化 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** GPAC スクリプトと知見の地層パスを `agy` / `.antigravity` 依存から解放し、クロスハーネスな `agents` / `gpac` 名前空間へ統一する。

**アーキテクチャ:** `scripts/agy_sub.mjs` を `scripts/gpac_sub.mjs` に改名した上で、SSOT パス・CLI 起動契約・env 名を汎用化する。`scripts/todo.mjs` のタスクディレクトリ既定値を `.agents/tasks` に変更する。すべての挙動変更は既存テストスイートを先に `agents` / `gpac` 系の期待値へ書き換える（RED）ことで駆動する。

**技術スタック:** Node.js (標準モジュールのみ)、`node:test`、git worktree。

**仕様 (Spec):** `docs/plans/2026-10-25-gpac-generic-rename-design.md`

## グローバル制約 (Global Constraints)

- Node.js は標準モジュールのみ使用（新規 npm 依存の追加禁止）。
- 起動 CLI の契約: `GPAC_AGENT_COMMAND` は**シェルコマンド文字列**（実行ファイル名 + 追加引数可、例: `opencode run`、`codex exec`、`claude -p`、`agy`）。実行時は末尾にクォート済みプロンプトを 1 引数として付加し `bash -c` で実行する。
- 旧 `~/.antigravity/` への自動フォールバックは実装しない。ただし `todo.mjs` の env 旧名 `ANTIGRAVITY_TASK_DIR` は互換読み（廃止予定）のみ維持する。
- `superpowers-original/`、履歴文書（過去の `docs/plans/` 資料、`docs/superpowers_ports.md` の上流同期記録）、obs 内の Antigravity 実環境に関する**事実の記述**（`~/.antigravity/skills/` 対応表、`~/.antigravity/extensions/` 等）は変更しない。
- README「最小権限の原則」の `~/.antigravity/` は `~/.agents/` に書き換える。
- コア変更（`scripts/`）を伴うため、完了前に `package.json`・`antigravity-extension.json`・`.codex-plugin/plugin.json` を 1.12.7 に連動させ、`node scripts/finish_check.mjs origin/main` と全テストをパスさせる。
- コミットは Conventional Commits 形式、本文は日本語で「なぜ」を記述する。

## レビューフォーカス (Review Focus)

1. workDir が拡張リポジトリ外のプロジェクトの場合、サブセッション側がミッション参照に失敗する → 期待: ペイロードの `show-task` 呼び出しは spawn 時に算出した**絶対パス**を使う（タスク 3 のテスト 3-2 が担当）。
2. `GPAC_AGENT_COMMAND` に引数を含む値（例: `opencode run`）を設定した場合に CLI 部が分割・欠落する → 期待: 値はそのまま 1 つの文字列としてペイロードに連結される（テスト 3-3 が担当）。
3. `AGENTS_TASK_DIR` 未設定で旧名 `ANTIGRAVITY_TASK_DIR` のみ設定された環境でタスクが旧パスに作成される → 期待: 旧名は互換読みとして機能する（テスト 2-2 が担当）。
4. tmux モード指定だが `GPAC_AGENT_COMMAND` 未設定の環境で、ハーネス不在のまま tmux が失敗ログだけを出す → 期待: CLI が決定できない場合は tmux を試みる前に manual モードへフォールバックする（テスト 3-5 が担当）。
5. `getGpacBaseDir` の返却パスに旧 `.antigravity` が残存し、旧来の実データ存在を黙示する → 期待: 新名前空間 `.agents/sub-sessions` のみを返す（テスト 3-1 が担当）。

---

### タスク 1: `todo.mjs` のタスクディレクトリ汎用化

**ファイル:**
- 変更: `scripts/todo.mjs:11-13`
- テスト: `tests/test_todo_core.mjs`、`tests/test_todo_hierarchy.mjs`、`tests/test_todo_ai_friendly.mjs`、`tests/test_todo_hardening.mjs`

**インターフェース (Interfaces):**
- 消費: なし
- 生産: `getTaskDir(): string` — `AGENTS_TASK_DIR` → （未設定時）`ANTIGRAVITY_TASK_DIR` → （未設定時）`.agents/tasks` の順で返す。後続タスクはこの契約に依存しない。

- [x] **ステップ 1: 失敗するテストを作成** — `tests/test_todo_core.mjs` に追加:

```js
test('todo.mjs - AGENTS_TASK_DIR 未設定で旧名 ANTIGRAVITY_TASK_DIR のみ設定時、互換読みとして旧値を使う', () => {
  const env = { ...baseEnv, AGENTS_TASK_DIR: '', ANTIGRAVITY_TASK_DIR: '/tmp/legacy-tasks' };
  // getTaskDir を評価するサブプロセス or 直接 import（既存テストの実装パターンに合わせる）
  assert.match(result, /\/tmp\/legacy-tasks|legacy-tasks/, '旧 env 名で旧パスが使えること');
});
```

さらに既存 4 テストファイル内の `ANTIGRAVITY_TASK_DIR` / `.antigravity/tasks` 記述を `AGENTS_TASK_DIR` / `.agents/tasks` 系に置換する（この段階では既存アサーションが不正になる＝RED）。

- [x] **ステップ 2: テストが失敗することを確認**
  実行: `node --test tests/test_todo_core.mjs`
 期待値: 既定パスと旧名のテストが FAIL（現状は `.antigravity/tasks` を返すため）

- [x] **ステップ 3: `getTaskDir()` を実装**

```js
export function getTaskDir() {
  return process.env.AGENTS_TASK_DIR || process.env.ANTIGRAVITY_TASK_DIR || ".agents/tasks";
}
```

旧 env 名は「廃止予定の互換読み」である旨を JSDoc（日本語）で明記する。

- [x] **ステップ 4: テストがパスすることを確認**
  実行: `node --test tests/test_todo_core.mjs tests/test_todo_hierarchy.mjs tests/test_todo_ai_friendly.mjs tests/test_todo_hardening.mjs tests/test_todo_ui.mjs`
  期待値: 全 PASS

- [x] **ステップ 5: コミット**

```bash
git add -A && git commit -m "refactor: todo.mjs のタスクディレクトリを汎用名前空間へ移行"
```

### タスク 2: `agy_sub.mjs` → `gpac_sub.mjs` 改名（挙動変更なし）

**ファイル:**
- 変更（改名）: `scripts/agy_sub.mjs` → `scripts/gpac_sub.mjs`、`tests/test_agy_sub.mjs` → `tests/test_gpac_sub.mjs`、`tests/test_agy_sub_ui.mjs` → `tests/test_gpac_sub_ui.mjs`
- 文言参照の更新（挙動なし）: `scripts/gpac_sub.mjs` 内の `generateHelpText()`・`createPayload()` の命令文中の `agy_sub.mjs` → `gpac_sub.mjs`、ヘルプ出力 "Antigravity Peer-Agent Coordination" → "Peer-Agent Coordination"

**インターフェース (Interfaces):**
- 消費: なし
- 生産: `scripts/gpac_sub.mjs` の全公開関数（`getGpacBaseDir` / `getCliCommand` / `createPayload` / `launchSession` / `spawn` / `report` / `listSessions` / `showFile` / `handleImport` / `createFromTemplate` / `main` / `generateTaskId` / `parseYamlFrontmatter` / `validateFrontmatter` / `handoffDocument`）。シグネチャは改名前と同一。タスク 3 はこのモジュールを改変する。

- [x] **ステップ 1: `git mv` で 3 ファイルを改名**
- [x] **ステップ 2: テスト・本文中の参照を更新**（`agy_sub.mjs` の文字列参照と import パスのみ。`.antigravity` の期待値は**この時点では触らない**）
- [x] **ステップ 3: テストがパスすることを確認**（挙動無変更の改名であることをグリーンで証明する）
  実行: `node --test tests/test_gpac_sub.mjs tests/test_gpac_sub_ui.mjs`
  期待値: 全 PASS
- [x] **ステップ 4: コミット**
  `git commit -m "refactor: agy_sub.mjs を gpac_sub.mjs に改名"`

### タスク 3: GPAC の SSOT パス・CLI 契約・env 名の汎用化（挙動変更）

**ファイル:**
- 変更: `scripts/gpac_sub.mjs`（`getGpacBaseDir`、`getCliCommand`、`createPayload`、`launchSession`、`main` の launcher env）
- テスト: `tests/test_gpac_sub.mjs`、`tests/test_gpac_sub_ui.mjs`

**インターフェース (Interfaces):**
- 消費: タスク 2 の `scripts/gpac_sub.mjs`
- 生産: `getGpacBaseDir(homeDir=null): string`（`path.join(baseHome, '.agents', 'sub-sessions')`）、`getCliCommand(): string|null`（`process.env.GPAC_AGENT_COMMAND || null`）、`createPayload(workDir: string, taskId: string): string`（CLI 部に `getCliCommand()` の値または `<YOUR_AGENT_CLI>`、命令文は spawn 時に算出したスクリプト絶対パスの `node <abs>/scripts/gpac_sub.mjs show-task <id>` を参照）、`launchSession(sessionId, taskPath, workDir, launcherMode='manual')`（`GPAC_AGENT_COMMAND` 未設定時は tmux モードを拒否して manual へフォールバックし、`GPAC_AGENT_COMMAND="<CLI> [args...]" node <abs>/scripts/gpac_sub.mjs ...` の再実行案内を出す）、`main()` の launcher env は `GPAC_LAUNCHER`

- [x] **ステップ 1: 失敗するテストを作成** — `tests/test_gpac_sub.mjs` に追加（既存テストの `.antigravity` 期待値も併せて `.agents` に書き換え）:

```js
// 3-1: SSOT パス
test('gpac_sub.mjs - getGpacBaseDir は ~/.agents/sub-sessions を返す', () => {
  const dir = getGpacBaseDir(tempHome);
  assert.strictEqual(dir, path.join(tempHome, '.agents', 'sub-sessions'));
});

// 3-2: show-task 絶対パス埋め込み
test('gpac_sub.mjs - createPayload の show-task 命令はスクリプト絶対パスを参照する', () => {
  const payload = createPayload('/tmp/some-other-project', 'TASK-1');
  assert.match(payload, / node .*\/scripts\/gpac_sub\.mjs show-task TASK-1 /);
  assert.ok(payload.includes(path.resolve(process.cwd(), 'scripts', 'gpac_sub.mjs')));
});

// 3-3: 引数付き CLI 契約
test('gpac_sub.mjs - GPAC_AGENT_COMMAND の引数付き値が CLI 部にそのまま使われる', () => {
  process.env.GPAC_AGENT_COMMAND = 'opencode run';
  try {
    const payload = createPayload('/tmp/x', 'T');
    assert.ok(payload.includes('cd /tmp/x && opencode run "'));
  } finally { delete process.env.GPAC_AGENT_COMMAND; }
});

// 3-4: 未設定時のプレースホルダ
test('gpac_sub.mjs - GPAC_AGENT_COMMAND 未設定時、createPayload は <YOUR_AGENT_CLI> を使う', () => {
  assert.ok(createPayload('/tmp/x', 'T').includes('<YOUR_AGENT_CLI>'));
});

// 3-5: CLI 未設定の tmux 拒否
test('gpac_sub.mjs - GPAC_AGENT_COMMAND 未設定の tmux モードは tmux を試みず manual にフォールバックし GPAC_AGENT_COMMAND 再実行案内を出す', () => {
  // console.log をスパイして出力を集約してから復元する
});
```

さらに `tests/test_agy_sub.mjs` 由来の既存テスト（spawn/report/list/show/import 系）の期待パスを `tempHome/.agents/sub-sessions` に書き替え、UI テスト（`tests/test_gpac_sub_ui.mjs`）の env 期待を `GPAC_LAUNCHER` に書き替える。

- [x] **ステップ 2: テストが失敗することを確認**
  実行: `node --test tests/test_gpac_sub.mjs`
 期待値: 上記 5 件と既存パス期待値が FAIL（`.antigravity` 返却・`agy` ハードコードゆえ）

- [x] **ステップ 3: `scripts/gpac_sub.mjs` を実装**
  - `getGpacBaseDir`: `.antigravity` → `.agents`
  - `getCliCommand`: `process.env.GPAC_AGENT_COMMAND || null`
  - `createPayload`: スクリプト絶対パスを `fileURLToPath(import.meta.url)` から解決して命令文に埋め込み、CLI 部は `getCliCommand() || '<YOUR_AGENT_CLI>'`
  - `launchSession`: `launcherMode === 'tmux' && !getCliCommand()` の場合は tmux 実行前に manual へフォールバック（manual 文面に `GPAC_AGENT_COMMAND` 再実行案内を追加）
  - `main`: `const launcher = process.env.GPAC_LAUNCHER || 'manual';`
- [x] **ステップ 4: テストがパスすることを確認**
  実行: `node --test tests/test_gpac_sub.mjs tests/test_gpac_sub_ui.mjs`
  期待値: 全 PASS
- [x] **ステップ 5: コミット**
  `git commit -m "feat: GPAC を GPAC_AGENT_COMMAND / .agents 名前空間で汎用化"`

### タスク 4: スキル・地層ドキュメントの追従

**ファイル:**
- 変更: `skills/session-coordination/SKILL.md`、`skills/observation-distiller/strata.md`

**インターフェース (Interfaces):**
- 消費: タスク 2・3 のスクリプト名・パス・env 契約
- 生産: なし（ドキュメント）

- [x] **ステップ 1: `strata.md` の L3/L4 パスを汎用化**（図解込み）: L3 `~/.agents/observations/`、L4 `./.agents/observations/`。クロスランタイムな `~/.agents` / `.agents` 規約に乗る旨を 1 文追記。
- [x] **ステップ 2: `session-coordination/SKILL.md` を更新**: GPAC 名称を "Peer-Agent Coordination (GPAC)" に、全コマンド例を `scripts/gpac_sub.mjs` に、SSOT を `~/.agents/sub-sessions/` に更新し、`GPAC_AGENT_COMMAND`（未設定時は manual 既定）と `GPAC_LAUNCHER` の運用を追記。`[extension-path]` の例示を汎用化。
- [x] **ステップ 3: 物理検証** — `grep -rn "agy_sub\|~/.antigravity/sub-sessions" skills/ | grep -v superpowers-original` が空であること。
- [x] **ステップ 4: コミット**
  `git commit -m "docs: session-coordination と strata を gpac/agents 名前空間へ追従"`

### タスク 5: README・TODO・obs の機械的参照更新

**ファイル:**
- 変更: `README.md`、`docs/TODO.md`、`observations/dispatching-parallel-agents.md`（他に `grep` で見つかった機械的参照先）

**インターフェース (Interfaces):**
- 消費: タスク 1〜4 の確定名称
- 生産: なし（ドキュメント）

- [ ] **ステップ 1: README** — ①「知見の地層と優先順位」図解の L3/L4 を新パスへ、②「ファイルシステムへの影響」表を新パスへ、③ GPAC 節の名称を "Peer-Agent Coordination (GPAC)" に、④「最小権限の原則」の `~/.antigravity/` → `~/.agents/`、⑤ 移行 NOTE 追記（`mv ~/.antigravity/observations ~/.agents/observations` 等の手順 + 「旧環境データは自動移行されない」旨）。
- [ ] **ステップ 2: `docs/TODO.md`** — 「6. ハーネス汎用化の残課題」の該当 2 項目を `[x]` にして成果（本設計・計画へのリンク）を記録。
- [ ] **ステップ 3: obs 等の機械的参照更新** — `grep -rn "agy_sub\|ANTIGRAVITY_TASK_DIR\|GEMINI_SUB_LAUNCHER\|\.antigravity/tasks\|sub-sessions"`（`skills/ observations/ .agents/ docs/`、`superpowers-original` と履歴文書・obs 事実記述を除く）をすべて現行名へ更新。
- [ ] **ステップ 4: 物理検証** — 上記 `grep`（ obs 事実記述以外）が空であること。
- [ ] **ステップ 5: コミット**
  `git commit -m "docs: README/TODO/obs を gpac・agents 名前空間へ整合"`

### タスク 6: 配布バージョン連動と完了検証

**ファイル:**
- 変更: `package.json`・`antigravity-extension.json`・`.codex-plugin/plugin.json`（→ 1.12.7）

- [ ] **ステップ 1: 3 マニフェストの version を 1.12.7 に更新**
- [ ] **ステップ 2: 全テスト実行** — `for f in tests/test_*.mjs; do node --test "$f" || exit 1; done` 期待値: FAIL なし
- [ ] **ステップ 3: `node scripts/finish_check.mjs origin/main`** — 期待値: "✨ All checks passed"
- [ ] **ステップ 4: コミット** — `git commit -m "chore: GPAC 汎用化に伴う配布バージョンを 1.12.7 に連動"`
