import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mock } from 'node:test';
import { fileURLToPath } from 'node:url';

// scripts/todo.mjs を import する
import { 
  getBranchName, 
  getTaskDir,
  getTodoPath,
  init, 
  add, 
  show, 
  start, 
  done, 
  main 
} from '../scripts/todo.mjs';

/**
 * テスト用の一時ディレクトリを作成し、環境変数を設定します。
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

/**
 * テスト用の Git リポジトリを初期化します。
 */
function setupRepo(dir) {
  cp.spawnSync('git', ['init'], { cwd: dir });
  cp.spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  cp.spawnSync('git', ['config', 'user.name', 'Test User'], { cwd: dir });
  cp.spawnSync('git', ['commit', '--allow-empty', '-m', 'initial'], { cwd: dir });
}

test('todo.mjs コア機能と階層管理', async (t) => {

  await t.test('ブランチ名の取得', async (t) => {
    await t.test('Git ブランチ名 feature/abc を feature-abc に変換する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      cp.spawnSync('git', ['checkout', '-b', 'feature/abc'], { cwd: tmpDir });
      const branch = getBranchName(tmpDir);
      assert.strictEqual(branch, 'feature-abc');
      teardownTmpDir(tmpDir);
    });

    await t.test('Git エラー時は "default" を返す', () => {
      const tmpDir = setupTmpDir();
      const branch = getBranchName(tmpDir);
      assert.strictEqual(branch, 'default');
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('初期化', async (t) => {
    await t.test('正しいタイトルでTODOファイルを初期化する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Custom Title', tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /# TASK: Custom Title/);
      teardownTmpDir(tmpDir);
    });

    await t.test('引数なしの場合にブランチ名からタイトルを自動生成する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      cp.spawnSync('git', ['checkout', '-b', 'feat/awesome-feature'], { cwd: tmpDir });
      init(null, tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /# TASK: Awesome Feature/);
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('追加', async (t) => {
    await t.test('タスクを正しい形式で追記する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('Basic Task', false, tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[ \] Basic Task/);
      teardownTmpDir(tmpDir);
    });

    await t.test('add --child が実行中の親タスクの下にインデント付きで追加すること', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('Parent', false, tmpDir);
      start('Parent', tmpDir);
      add('Child', true, tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, new RegExp('- \\[/\\] Parent\\n  - \\[ \\] Child'));
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('開始', async (t) => {
    await t.test('指定したタスクを [ ] から [/] に変更する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('Task 1', false, tmpDir);
      start('Task 1', tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[\/\] Task 1/);
      teardownTmpDir(tmpDir);
    });

    await t.test('すでに [/] がある独立したタスクを開始しようとするとエラー', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('T1', false, tmpDir);
      add('T2', false, tmpDir);
      start('T1', tmpDir);
      
      const mockExit = mock.fn((code) => { if (code !== 0) throw new Error('Exit ' + code); });
      const originalExit = process.exit;
      process.exit = mockExit;
      try {
        assert.throws(() => start('T2', tmpDir), /Exit 1/);
      } finally {
        process.exit = originalExit;
      }
      teardownTmpDir(tmpDir);
    });

    await t.test('親子関係にあるタスクの同時実行を許可すること', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('P', false, tmpDir);
      start('P', tmpDir);
      add('C', true, tmpDir);
      assert.doesNotThrow(() => start('C', tmpDir));
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[\/\] P/);
      assert.match(content, /  - \[\/\] C/);
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('完了', async (t) => {
    await t.test('最も深い階層の実行中タスクから優先的に完了させること', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('P', false, tmpDir);
      start('P', tmpDir);
      add('C', true, tmpDir);
      start('C', tmpDir);
      
      done(tmpDir); // 子が完了
      let content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /  - \[x\] C/);
      
      done(tmpDir); // 親が完了
      content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[x\] P/);
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('CLI 挙動', async (t) => {
    const scriptPath = path.resolve('scripts/todo.mjs');

    await t.test('引数なしの場合に終了コード 1 と Usage を表示する', () => {
      const tmpDir = setupTmpDir();
      const result = cp.spawnSync('node', [scriptPath], { env: { ...process.env, GEMINI_TASK_DIR: tmpDir }, encoding: 'utf8' });
      assert.strictEqual(result.status, 1);
      assert.match(result.stdout, /Usage: todo.py/);
      teardownTmpDir(tmpDir);
    });

    await t.test('CLI 経由で階層タスクの操作が成功する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      const env = { ...process.env, GEMINI_TASK_DIR: tmpDir };
      const opt = { env, cwd: tmpDir, encoding: 'utf8' };

      cp.spawnSync('node', [scriptPath, 'init'], opt);
      cp.spawnSync('node', [scriptPath, 'add', 'Parent'], opt);
      cp.spawnSync('node', [scriptPath, 'start', 'Parent'], opt);
      cp.spawnSync('node', [scriptPath, 'add', '--child', 'Child'], opt);
      cp.spawnSync('node', [scriptPath, 'start', 'Child'], opt);
      
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /  - \[\/\] Child/);
      teardownTmpDir(tmpDir);
    });
  });
});
