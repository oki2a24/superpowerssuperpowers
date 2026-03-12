import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import { mock } from 'node:test';

// scripts/todo.mjs を import する
import { getBranchName, getTodoPath } from '../scripts/todo.mjs';

test('getBranchName', async (t) => {
  await t.test('Git ブランチ名 feature/abc を feature-abc に変換する', (t) => {
    const mockSpawnSync = mock.method(cp, 'spawnSync', (cmd, args) => {
      if (cmd === 'git' && args.includes('rev-parse')) {
        return { stdout: 'feature/abc\n', status: 0 };
      }
      return { status: 1 };
    });

    const branch = getBranchName();
    assert.strictEqual(branch, 'feature-abc');
    mockSpawnSync.mock.restore();
  });

  await t.test('Git エラー時は "default" を返す', (t) => {
    const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
      return { status: 1, error: new Error('git error') };
    });

    const branch = getBranchName();
    assert.strictEqual(branch, 'default');
    mockSpawnSync.mock.restore();
  });
});

test('getTodoPath', async (t) => {
  await t.test('.gemini/tasks/TODO-<branch>.md を返す', (t) => {
    const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
      return { stdout: 'feat-1\n', status: 0 };
    });

    const path = getTodoPath();
    assert.strictEqual(path, '.gemini/tasks/TODO-feat-1.md');
    mockSpawnSync.mock.restore();
  });
});
