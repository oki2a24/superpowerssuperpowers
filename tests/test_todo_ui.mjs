import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressBar } from '../scripts/todo.mjs';

test('UI ヘルパー: getProgressBar', () => {
  assert.strictEqual(getProgressBar(0, 10), '[░░░░░░░░░░]');
  assert.strictEqual(getProgressBar(5, 10), '[▓▓▓▓▓░░░░░]');
  assert.strictEqual(getProgressBar(10, 10), '[▓▓▓▓▓▓▓▓▓▓]');
});
