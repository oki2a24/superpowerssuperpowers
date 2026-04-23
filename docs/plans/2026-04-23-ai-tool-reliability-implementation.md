# AI-Safe Task Management (todo.mjs v2) 実装計画

> **AIエージェントへの指示:** REQUIRED SUB-SKILL: この計画をタスクごとに実装するには、移植された `subagent-driven-development` スキル（推奨）または `executing-plans` スキルを `activate_skill` で起動して使用してください。ステップには追跡用のチェックボックス (`- [ ]`) を使用します。

**目標:** `todo.mjs` をAIが誤解なく操作できるように拡張し、信頼性の高いタスク管理プロトコル（IDR）を確立する。

**アーキテクチャ:**
1. **JSON出力**: AIが確実にパースできるデータ形式を `show` コマンドに追加。
2. **堅牢な引数処理**: フラグの順序やクォートの有無に左右されないパースロジックへの改善。
3. **エラーハンドリング**: `stderr` への分離と適切な終了コードの徹底。
4. **ドキュメントと規律**: IDRプロトコルを `TODO_GUIDE.md` および `observations/` に反映。

**技術スタック:** Node.js (Standard Modules)

---

### タスク 1: AIフレンドリー機能のテスト作成 (TDD)

**ファイル:**
- 作成: `tests/test_todo_ai_friendly.mjs`

- [ ] **ステップ 1: 失敗するテストを作成**
```javascript
import assert from 'node:assert';
import cp from 'node:child_process';
import fs from 'node:fs';

const TODO_SCRIPT = 'scripts/todo.mjs';
const TEST_TASK_DIR = '.gemini/tasks_test_ai';

if (fs.existsSync(TEST_TASK_DIR)) fs.rmSync(TEST_TASK_DIR, { recursive: true });

function runTodo(args) {
  return cp.spawnSync('node', [TODO_SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GEMINI_TASK_DIR: TEST_TASK_DIR }
  });
}

// 1. JSON出力のテスト
console.log("Testing show --json...");
runTodo(['init', 'AI Test']);
const resJson = runTodo(['show', '--json']);
try {
  const data = JSON.parse(resJson.stdout);
  assert.strictEqual(data.title, 'AI Test');
} catch (e) {
  console.log("Expected initial failure: JSON output not implemented");
}

// 2. フラグ順序のテスト
console.log("Testing flag order independence...");
runTodo(['add', 'Subtask', '--child']);
// 実装前は '--child' がテキストの一部になるか、エラーになるはず

// 3. stderr のテスト
console.log("Testing stderr for errors...");
const resErr = runTodo(['start', '999']);
assert.notStrictEqual(resErr.status, 0);
if (resErr.stdout.includes("Error")) {
    console.log("Expected initial behavior: Error in stdout instead of stderr");
}
```

- [ ] **ステップ 2: テストが失敗することを確認するために実行**
実行: `node tests/test_todo_ai_friendly.mjs`

- [ ] **ステップ 3: コミット**
```bash
git add tests/test_todo_ai_friendly.mjs
git commit -m "test: AIフレンドリー機能の検証用テストを追加"
```

---

### タスク 2: 引数パースとエラー出力の改善

**ファイル:**
- 変更: `scripts/todo.mjs`

- [ ] **ステップ 1: main 関数の引数処理の刷新**
```javascript
export function main(argv = process.argv, cwd = process.cwd()) {
  const command = argv[2];
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  const rawArgs = argv.slice(3);
  const flags = rawArgs.filter(a => a.startsWith('--'));
  const positional = rawArgs.filter(a => !a.startsWith('--'));

  switch (command) {
    case 'init':
      init(positional[0], cwd);
      break;
    case 'add':
      const isChild = flags.includes('--child');
      const text = positional.join(' ');
      add(text, isChild, cwd);
      break;
    case 'start':
      start(positional[0], cwd);
      break;
    case 'done':
      done(cwd);
      break;
    case 'show':
      show(flags, cwd); // flags を渡すように変更
      break;
    default:
      process.stderr.write("Unknown command\n");
      process.exit(1);
  }
}
```

- [ ] **ステップ 2: エラー箇所の stderr への変更**
`process.stdout.write` を `process.stderr.write` に（エラー時のみ）変更。

- [ ] **ステップ 3: コミット**
```bash
git commit -am "refactor: 引数パースの堅牢化とエラー出力の stderr 分離"
```

---

### タスク 3: show --json の実装

**ファイル:**
- 変更: `scripts/todo.mjs`

- [ ] **ステップ 1: show 関数に JSON 出力ロジックを追加**
```javascript
export function show(flags = [], cwd = process.cwd()) {
  // ... (既存のパース処理)
  if (flags.includes('--json')) {
    const output = {
      title: summary.title,
      percent: summary.percent,
      tasks: tasks.map((t, index) => ({
        id: index + 1,
        text: t.text,
        status: t.status,
        indent: t.indent,
        parentId: t.parent ? tasks.indexOf(t.parent) + 1 : null
      }))
    };
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } else {
    // 既存の表示
  }
}
```

- [ ] **ステップ 2: テストの実行（全パス確認）**
実行: `node tests/test_todo_ai_friendly.mjs`

- [ ] **ステップ 3: コミット**
```bash
git commit -am "feat: AIがパース可能な show --json オプションを追加"
```

---

### タスク 4: ガイドと規律の更新

**ファイル:**
- 変更: `scripts/TODO_GUIDE.md`
- 作成: `observations/todo-mjs.md`

- [ ] **ステップ 1: ガイドの更新**
- [ ] **ステップ 2: 知見の作成**
- [ ] **ステップ 3: コミット**
```bash
git add scripts/TODO_GUIDE.md observations/todo-mjs.md
git commit -m "docs: AI操作プロトコル(IDR)をガイドと知見に反映"
```
