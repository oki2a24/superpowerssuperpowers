import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mock } from 'node:test';

// scripts/todo.mjs を import する
import { getBranchName, init, add, show, start, done, main } from '../scripts/todo.mjs';

/**
 * テスト用の一時ディレクトリを作成し、環境変数を設定します。
 * 各テストの前後で呼び出すことで、テスト間の隔離を保証します。
 */
function setupTmpDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-tasks-'));
  process.env.GEMINI_TASK_DIR = tmpDir;
  return tmpDir;
}

function teardownTmpDir(tmpDir) {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

test('todo.mjs コア機能', async (t) => {

  await t.test('ブランチ名の取得', async (t) => {
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

  await t.test('初期化', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('正しい形式でTODOファイルを初期化する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });

      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');
      
      init('Test Task');
      assert.ok(fs.existsSync(expectedPath), `ファイルが ${expectedPath} に作成される必要があります`);
      
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('# TASK: Test Task'));
      assert.ok(content.includes('- Branch: test-branch'));
      assert.ok(content.includes('- Created: '));
      
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('追加', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('タスクを正しい形式で追記する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');
      
      init('Initial List');
      add('New Task');
      
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('- [ ] New Task\n'));
      
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('表示', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('ファイル内容を標準出力に表示する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});
      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');

      init('Shopping');
      add('Apples');
      show();

      assert.ok(mockWrite.mock.callCount() >= 1);
      const lastCall = mockWrite.mock.calls[mockWrite.mock.callCount() - 1];
      assert.ok(lastCall.arguments[0].startsWith('\n--- TODO-test-branch.md ---# TASK: Shopping'));
      assert.ok(lastCall.arguments[0].includes('- [ ] Apples'));
      
      mockWrite.mock.restore();
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

  await t.test('開始', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('指定したタスクを [ ] から [/] に変更する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');

      init('Test Task');
      add('Task 1');
      add('Task 2');
      
      start('Task 1');
      
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('- [/] Task 1\n'));
      assert.ok(content.includes('- [ ] Task 2\n'));
      
      mockSpawnSync.mock.restore();
    });

    await t.test('すでに [/] がある場合にエラーで終了する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockExit = mock.method(process, 'exit', (code) => {
        throw new Error(`process.exit called with ${code}`);
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      init('Test Task');
      add('Task 1');
      start('Task 1');
      
      assert.throws(() => {
        start('Task 1');
      }, /process.exit called with 1/);

      assert.strictEqual(mockWrite.mock.calls[mockWrite.mock.callCount() - 1].arguments[0], 'ERROR: 他のタスクが実行中です。先に完了させてください。');

      mockExit.mock.restore();
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });

    await t.test('start で一致するタスクが見つからない場合に、エラーメッセージを表示して process.exit(1) を呼ぶことを検証', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockExit = mock.method(process, 'exit', (code) => {
        throw new Error(`process.exit called with ${code}`);
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      init('Test Task');
      add('Task 1');
      
      assert.throws(() => {
        start('Non-existent Task');
      }, /process.exit called with 1/);

      assert.strictEqual(mockWrite.mock.calls[mockWrite.mock.callCount() - 1].arguments[0], "Error: Task matching 'Non-existent Task' not found or already started.");
      
      mockExit.mock.restore();
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });

    await t.test('start 成功時に Started: <pattern> を標準出力に表示することを検証', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      init('Test Task');
      add('Task 1');
      
      start('Task 1');
      
      assert.strictEqual(mockWrite.mock.calls[mockWrite.mock.callCount() - 1].arguments[0], 'Started: Task 1');
      
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('完了', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('[/] のタスクを [x] に変更する', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});
      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');

      init('Test Task');
      add('Task 1');
      start('Task 1');
      
      done();
      
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('- [x] Task 1\n'));
      
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });

    await t.test('done 成功時に Task marked as DONE. を標準出力に表示することを検証', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      init('Test Task');
      add('Task 1');
      start('Task 1');
      
      done();
      
      assert.strictEqual(mockWrite.mock.calls[mockWrite.mock.callCount() - 1].arguments[0], 'Task marked as DONE.');
      
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });

    await t.test('進行中のタスクがない場合にメッセージを表示し、正常終了することを検証', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      init('Test Task');
      add('Task 1');
      
      done();

      assert.strictEqual(mockWrite.mock.calls[mockWrite.mock.callCount() - 1].arguments[0], 'No in-progress task found to mark as DONE.');
      
      mockWrite.mock.restore();
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('メインロジック', async (t) => {
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('引数なしで Usage を出力し、終了コード 1 で終了する', (t) => {
      const mockExit = mock.method(process, 'exit', (code) => {
        throw new Error(`process.exit called with ${code}`);
      });
      const mockWrite = mock.method(process.stdout, 'write', () => {});

      assert.throws(() => {
        main(['node', 'todo.mjs']);
      }, /process.exit called with 1/);

      assert.strictEqual(mockWrite.mock.calls[0].arguments[0], 'Usage: todo.py [init|add|start|done|show] [args]');

      mockExit.mock.restore();
      mockWrite.mock.restore();
    });

    await t.test('init コマンドを正しく呼び出す', (t) => {
      const mockSpawnSync = mock.method(cp, 'spawnSync', () => {
        return { stdout: 'test-branch\n', status: 0 };
      });
      const expectedPath = path.join(tmpDir, 'TODO-test-branch.md');
      
      main(['node', 'todo.mjs', 'init', 'Main Test']);
      assert.ok(fs.existsSync(expectedPath));
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('# TASK: Main Test'));
      
      mockSpawnSync.mock.restore();
    });
  });

  await t.test('todo.mjs CLI 挙動', async (t) => {
    const scriptPath = path.resolve('scripts/todo.mjs');
    let tmpDir;
    t.beforeEach(() => {
      tmpDir = setupTmpDir();
    });
    t.afterEach(() => {
      teardownTmpDir(tmpDir);
    });

    await t.test('引数なしの場合に終了コード 1 と Usage を表示する', () => {
      const result = cp.spawnSync('node', [scriptPath], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, 'Usage: todo.py [init|add|start|done|show] [args]');
    });

    await t.test('無効なコマンドの場合に終了コード 1 と Usage を表示する', () => {
      const result = cp.spawnSync('node', [scriptPath, 'invalid'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, 'Usage: todo.py [init|add|start|done|show] [args]');
    });

    await t.test('init 引数不足の場合に終了コード 1 と Usage を表示する', () => {
      const result = cp.spawnSync('node', [scriptPath, 'init'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, 'Usage: todo.py init <title>');
    });

    await t.test('add 引数不足の場合に終了コード 1 と Usage を表示する', () => {
      const result = cp.spawnSync('node', [scriptPath, 'add'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, 'Usage: todo.py add <task>');
    });

    await t.test('start 引数不足の場合に終了コード 1 と Usage を表示する', () => {
      const result = cp.spawnSync('node', [scriptPath, 'start'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, 'Usage: todo.py start <pattern>');
    });

    await t.test('CLI 経由で init, add, start, done, show が一連の動作として成功する', () => {
      const branchName = getBranchName();
      const expectedPath = path.join(tmpDir, `TODO-${branchName}.md`);
      
      // init
      let result = cp.spawnSync('node', [scriptPath, 'init', 'CLI Test'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 0);
      assert.ok(fs.existsSync(expectedPath), `ファイルが ${expectedPath} に作成される必要があります`);

      // add
      result = cp.spawnSync('node', [scriptPath, 'add', 'Task from CLI'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 0);

      // start
      result = cp.spawnSync('node', [scriptPath, 'start', 'Task from CLI'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 0);
      assert.ok(result.stdout.includes('Started: Task from CLI'));

      // show
      result = cp.spawnSync('node', [scriptPath, 'show'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 0);
      assert.ok(result.stdout.includes('Task from CLI'));
      assert.ok(result.stdout.includes('[/]'));

      // done
      result = cp.spawnSync('node', [scriptPath, 'done'], { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }
      });
      assert.strictEqual(result.status, 0);
      assert.ok(result.stdout.includes('Task marked as DONE.'));

      // verify final state
      const content = fs.readFileSync(expectedPath, 'utf8');
      assert.ok(content.includes('[x] Task from CLI'));
    });
  });
});
