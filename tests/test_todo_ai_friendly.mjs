import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TODO_SCRIPT = path.resolve('scripts/todo.mjs');
const TEST_TASK_DIR = path.resolve('.gemini/tasks_test_ai_refactored');

function setupTestEnv() {
  if (fs.existsSync(TEST_TASK_DIR)) fs.rmSync(TEST_TASK_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEST_TASK_DIR, { recursive: true });
}

function runTodo(args) {
  return cp.spawnSync('node', [TODO_SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GEMINI_TASK_DIR: TEST_TASK_DIR }
  });
}

test('todo.mjs AIフレンドリー機能 (v2)', async (t) => {
  setupTestEnv();

  t.after(() => {
    if (fs.existsSync(TEST_TASK_DIR)) {
      fs.rmSync(TEST_TASK_DIR, { recursive: true, force: true });
    }
  });

  await t.test('show --json: 正しい JSON 構造を出力する', () => {
    runTodo(['init', 'AI Test']);
    const result = runTodo(['show', '--json']);
    assert.strictEqual(result.status, 0);
    
    const data = JSON.parse(result.stdout);
    assert.strictEqual(data.title, 'AI Test');
    assert.ok(Array.isArray(data.tasks));
    assert.strictEqual(data.tasks.length, 0);
  });

  await t.test('引数パース: フラグと位置引数の順序が不問である', () => {
    runTodo(['add', 'Parent Task']);
    runTodo(['start', '1']);
    
    // フラグをテキストの後ろに置く
    runTodo(['add', 'Subtask A', '--child']);
    // フラグをテキストの前に置く
    runTodo(['add', '--child', 'Subtask B']);
    
    const result = runTodo(['show', '--json']);
    const data = JSON.parse(result.stdout);
    
    const subA = data.tasks.find(t => t.text === 'Subtask A');
    const subB = data.tasks.find(t => t.text === 'Subtask B');
    
    assert.ok(subA, "Subtask A should exist");
    assert.strictEqual(subA.indent, 2, "Subtask A should be a child (indent 2)");
    assert.ok(subB, "Subtask B should exist");
    assert.strictEqual(subB.indent, 2, "Subtask B should be a child (indent 2)");
  });

  await t.test('エラー出力: エラーメッセージが stderr に出力される', () => {
    const result = runTodo(['start', '999']); // 存在しないID
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /Error|not found/i);
    assert.strictEqual(result.stdout, "");
  });

  await t.test('複数単語の結合: クォートなしでもタスク名が正しく扱われる', () => {
    runTodo(['add', 'This', 'is', 'a', 'long', 'task', 'name']);
    const result = runTodo(['show', '--json']);
    const data = JSON.parse(result.stdout);
    assert.ok(data.tasks.some(t => t.text === 'This is a long task name'));
  });
});
