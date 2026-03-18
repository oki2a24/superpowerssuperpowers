# todo.mjs UX Enhancement 実装計画 (TDD準拠版)

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`subagent-driven-development`スキルを使用してください。

**目標:** `todo.mjs show` コマンドに動的なダッシュボード表示機能（プログレスバー、Focus、セクション分割）を追加し、すべてのロジックを TDD で検証可能にする。

**アーキテクチャ:**
1.  **データ抽出層**: `parseTodoFile` で得られた Task オブジェクト群を分類。
2.  **ロジック層**: 
    - `getProgressBar`: Unicode 文字を用いたプログレスバー文字列を生成。
    - `calculateSummary`: 全タスク数、完了数、Focus（進行中）タスク、Active、History を分類し、進捗率を計算。
3.  **表示文字列生成層 (New)**: 
    - `formatDashboard`: `calculateSummary` の結果を受け取り、ANSI カラーコードを付加したダッシュボード全体の文字列を構築する。この関数を純粋関数（Pure Function）とすることで、表示内容の正しさを TDD で担保する。
4.  **統合層**: `show()` 関数内で `formatDashboard` を呼び出し、`process.stdout.write` する。

---

### タスク 1: ユーティリティ定数とプログレスバー関数の実装

**ファイル:**
- 変更: `scripts/todo.mjs`
- テスト: `tests/test_todo_ui.mjs` (新規作成)

**ステップ 1: ANSI 定数とヘルパーのテストを作成**
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressBar } from '../scripts/todo.mjs';

test('UI ヘルパー: getProgressBar', () => {
  assert.strictEqual(getProgressBar(0, 10), '[░░░░░░░░░░]');
  assert.strictEqual(getProgressBar(5, 10), '[▓▓▓▓▓░░░░░]');
  assert.strictEqual(getProgressBar(10, 10), '[▓▓▓▓▓▓▓▓▓▓]');
});
```

**ステップ 2: テストが失敗することを確認するために実行**
実行: `node --test tests/test_todo_ui.mjs`
期待値: `getProgressBar is not a function`

**ステップ 3: 最小限の実装を作成**
```javascript
export const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  CYAN: '\x1b[36m'
};

export function getProgressBar(done, total, width = 10) {
  if (total === 0) return '[' + '░'.repeat(width) + ']';
  const filled = Math.round((done / total) * width);
  return '[' + '▓'.repeat(filled) + '░'.repeat(width - filled) + ']';
}
```

**ステップ 4: テストがパスすることを確認するために実行**
期待値: PASS

**ステップ 5: コミット**

---

### タスク 2: 進捗計算とセクション分類ロジックの実装

**ファイル:**
- 変更: `scripts/todo.mjs`
- テスト: `tests/test_todo_ui.mjs`

**ステップ 1: 分類ロジックのテストを作成**
```javascript
test('ロジック: タスクの分類', () => {
  const mockTasks = [
    { status: 'x', text: 'Done', indent: 0 },
    { status: '/', text: 'Doing', indent: 0, parent: null },
    { status: ' ', text: 'Todo', indent: 0 }
  ];
  const summary = calculateSummary(mockTasks);
  assert.strictEqual(summary.total, 3);
  assert.strictEqual(summary.done, 1);
  assert.strictEqual(summary.percent, 33);
  assert.strictEqual(summary.focus.length, 1);
});
```

**ステップ 2: テストが失敗することを確認するために実行**
期待値: `calculateSummary is not defined`

**ステップ 3: 最小限の実装を作成**
```javascript
export function calculateSummary(tasks) {
  const summary = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'x').length,
    focus: tasks.filter(t => t.status === '/'),
    active: tasks.filter(t => t.status !== 'x'),
    history: tasks.filter(t => t.status === 'x')
  };
  summary.percent = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  return summary;
}
```

**ステップ 4: テストがパスすることを確認するために実行**
期待値: PASS

**ステップ 5: コミット**

---

### タスク 3: ダッシュボード文字列生成関数 `formatDashboard()` の実装

**ファイル:**
- 変更: `scripts/todo.mjs`
- テスト: `tests/test_todo_ui.mjs`

**ステップ 1: 失敗するテストを作成**
ANSI カラーコードとセクション構成（Focus のパンくず、Active の階層、History の分離）を検証する。

```javascript
test('UI: formatDashboard のレイアウト検証', () => {
  const summary = {
    title: 'Test Project',
    total: 2, done: 1, percent: 50,
    focus: [{ status: '/', text: 'Task B', parent: { text: 'Task A' } }],
    active: [
      { status: '/', text: 'Task A', indent: 0, format: () => '- [/] Task A' },
      { status: '/', text: 'Task B', indent: 2, format: () => '  - [/] Task B' }
    ],
    history: [{ text: 'Done Task' }]
  };
  const output = formatDashboard(summary);
  assert.match(output, /--- TODO: Test Project ---/);
  assert.match(output, /\[▓▓▓▓▓░░░░░\] 50%/);
  assert.match(output, /Focus: \[ Task A \] > Task B/);
  assert.match(output, /Active Tasks:/);
  assert.match(output, /--- Completed Tasks ---/);
});
```

**ステップ 2: テストが失敗することを確認するために実行**
期待値: `formatDashboard is not defined`

**ステップ 3: 最小限の実装を作成**
`formatDashboard` 関数を実装。`COLORS` を用いて強調を行う。

**ステップ 4: テストがパスすることを確認するために実行**
期待値: PASS

**ステップ 5: コミット**

---

### タスク 4: `show()` 関数の統合と最終検証

**ファイル:**
- 変更: `scripts/todo.mjs`

**ステップ 1: `show()` 関数を更新し、`formatDashboard` を使用する**
```javascript
export function show(cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  if (!fs.existsSync(todoPath)) {
    process.stdout.write("No active TODO for this branch.\n");
    return;
  }
  const { header, tasks } = parseTodoFile(todoPath);
  const summary = calculateSummary(tasks);
  // タイトルをヘッダーから抽出（既存の init タイトルを想定）
  summary.title = header.find(l => l.startsWith('# TASK:'))?.replace('# TASK:', '').trim() || 'Task List';
  
  const output = formatDashboard(summary);
  process.stdout.write(output);
}
```

**ステップ 2: 全テスト（既存コア機能含む）の実行**
実行: `node --test tests/*.mjs`

**ステップ 3: 手動検証**
実際のワークツリー内の `TODO-feat-todo-ux-enhancement.md` で `node scripts/todo.mjs show` を実行し、目視で確認。

**ステップ 4: コミット**
```bash
git commit -am "feat: dashboard 統合完了と全テストパス"
```
