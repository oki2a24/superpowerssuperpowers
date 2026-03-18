import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressBar, calculateSummary } from '../scripts/todo.mjs';

test('UI ヘルパー: getProgressBar', () => {
  assert.strictEqual(getProgressBar(0, 10), '[░░░░░░░░░░]');
  assert.strictEqual(getProgressBar(5, 10), '[▓▓▓▓▓░░░░░]');
  assert.strictEqual(getProgressBar(10, 10), '[▓▓▓▓▓▓▓▓▓▓]');
});

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
  assert.strictEqual(summary.active.length, 2);
  assert.strictEqual(summary.history.length, 1);
});
