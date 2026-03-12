import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { mock } from 'node:test';

// scripts/todo.mjs を import する
import { getBranchName, getTodoPath, init, add, show } from '../scripts/todo.mjs';

test('todo.mjs core functions', async (t) => {
  const tmpTasksDir = path.join(process.cwd(), 'tests/tmp_tasks');
  
  t.beforeEach(() => {
    if (fs.existsSync(tmpTasksDir)) {
      fs.rmSync(tmpTasksDir, { recursive: true, force: true });
    }
  });

  t.after(() => {
    if (fs.existsSync(tmpTasksDir)) {
      fs.rmSync(tmpTasksDir, { recursive: true, force: true });
    }
  });

  await t.test('getBranchName', async (t) => {
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

  await t.test('init', async (t) => {
    await t.test('正しい形式でTODOファイルを初期化する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });

      // テスト用に作業ディレクトリをモックする代わりに、実際のファイルパスを操作
      // scripts/todo.mjs の TASK_DIR をテスト用に書き換えるか、あるいは環境に合わせてテストする。
      // ここでは、一時ディレクトリを使用する方針。
      const expectedPath = path.join('.gemini/tasks', 'TODO-test-branch.md');
      
      try {
        init('Test Task');
        assert.ok(fs.existsSync(expectedPath), 'File should be created');
        
        const content = fs.readFileSync(expectedPath, 'utf8');
        assert.ok(content.includes('# TASK: Test Task'));
        assert.ok(content.includes('- Branch: test-branch'));
        assert.ok(content.includes('- Created: '));
      } finally {
        if (fs.existsSync(expectedPath)) fs.unlinkSync(expectedPath);
      }
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('add', async (t) => {
    await t.test('タスクを正しい形式で追記する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const expectedPath = path.join('.gemini/tasks', 'TODO-test-branch.md');
      
      try {
        init('Initial List');
        add('New Task');
        
        const content = fs.readFileSync(expectedPath, 'utf8');
        assert.ok(content.includes('- [ ] New Task\n'));
      } finally {
        if (fs.existsSync(expectedPath)) fs.unlinkSync(expectedPath);
      }
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('show', async (t) => {
    await t.test('ファイル内容を標準出力に表示する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});
      const expectedPath = path.join('.gemini/tasks', 'TODO-test-branch.md');

      try {
        init('Shopping');
        add('Apples');
        show();

        assert.ok(mockWrite.mock.callCount() >= 1);
        const lastCall = mockWrite.mock.calls[mockWrite.mock.callCount() - 1];
        assert.ok(lastCall.arguments[0].includes('--- TODO-test-branch.md ---'));
        assert.ok(lastCall.arguments[0].includes('- [ ] Apples'));
      } finally {
        if (fs.existsSync(expectedPath)) fs.unlinkSync(expectedPath);
        mockWrite.mock.restore();
      }
      mockSpawnSync.mock.restore();
    });

    await t.test('ファイルが存在しない場合にメッセージを表示する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'non-existent-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      show();

      assert.ok(mockWrite.mock.callCount() >= 1);
      assert.strictEqual(mockWrite.mock.calls[0].arguments[0], 'No active TODO for this branch.');

      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });
  });
});
