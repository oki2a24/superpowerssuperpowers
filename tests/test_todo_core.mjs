import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { 
  getBranchName, 
  getTodoPath,
  init, 
  add, 
  start,
  done,
  show, 
} from '../scripts/todo.mjs';

function setupTmpDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-core-test-'));
  process.env.GEMINI_TASK_DIR = tmpDir;
  return tmpDir;
}

function teardownTmpDir(tmpDir) {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function setupRepo(dir) {
  cp.spawnSync('git', ['init'], { cwd: dir });
  cp.spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  cp.spawnSync('git', ['config', 'user.name', 'Test User'], { cwd: dir });
  cp.spawnSync('git', ['commit', '--allow-empty', '-m', 'initial'], { cwd: dir });
}

test('todo.mjs コア機能 (階層管理以外)', async (t) => {
  const scriptPath = path.resolve('scripts/todo.mjs');

  await t.test('ブランチ名の取得', async (t) => {
    await t.test('Git ブランチ名 feature/abc を feature-abc に変換する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      cp.spawnSync('git', ['checkout', '-b', 'feature/abc'], { cwd: tmpDir });
      const branch = getBranchName(tmpDir);
      assert.strictEqual(branch, 'feature-abc');
      teardownTmpDir(tmpDir);
    });

    await t.test('Git エラー時は null を返す', () => {
      const tmpDir = setupTmpDir();
      const branch = getBranchName(tmpDir);
      assert.strictEqual(branch, null);
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('初期化', async (t) => {
    await t.test('正しいタイトルでTODOファイルを初期化する', () => {
      const tmpDir = setupTmpDir();
      // setupRepo を行わない（Git 非依存のテスト）
      init('Custom Title', tmpDir);
      const todoPath = path.join(tmpDir, 'TODO.md');
      const content = fs.readFileSync(todoPath, 'utf8');
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

  await t.test('基本追加・開始・完了', async (t) => {
    await t.test('タスクを正しい形式で追記する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('Basic Task', false, tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[ \] Basic Task/);
      teardownTmpDir(tmpDir);
    });

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

    await t.test('完了操作で [x] に変更する', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      init('Test', tmpDir);
      add('Task 1', false, tmpDir);
      start('Task 1', tmpDir);
      done(tmpDir);
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[x\] Task 1/);
      teardownTmpDir(tmpDir);
    });
  });

  await t.test('CLI 挙動', async (t) => {
    await t.test('引数なしの場合に終了コード 1 と Usage を表示する', () => {
      const tmpDir = setupTmpDir();
      const result = cp.spawnSync('node', [scriptPath], { 
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir }, 
        encoding: 'utf8' 
      });
      assert.strictEqual(result.status, 1);
      assert.match(result.stdout, /Usage: todo.mjs/);
      teardownTmpDir(tmpDir);
    });

    await t.test('CLI 経由で複数単語のタスク追加、開始、完了ができること', () => {
      const tmpDir = setupTmpDir();
      setupRepo(tmpDir);
      const env = { ...process.env, GEMINI_TASK_DIR: tmpDir };
      const opt = { env, cwd: tmpDir, encoding: 'utf8' };

      cp.spawnSync('node', [scriptPath, 'init'], opt);
      cp.spawnSync('node', [scriptPath, 'add', 'My', 'Task', 'Name'], opt);
      cp.spawnSync('node', [scriptPath, 'start', 'My Task Name'], opt);
      cp.spawnSync('node', [scriptPath, 'done'], opt);
      
      const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
      assert.match(content, /- \[x\] My Task Name/);
      teardownTmpDir(tmpDir);
    });

    await t.test('TODOファイルが存在しない場合に show がメッセージを表示する', () => {
      const tmpDir = setupTmpDir();
      // Git がない環境での show
      const stdout = cp.spawnSync('node', [scriptPath, 'show'], { 
        env: { ...process.env, GEMINI_TASK_DIR: tmpDir },
        encoding: 'utf8' 
      }).stdout;
      assert.match(stdout, /No active TODO for this project/);
      teardownTmpDir(tmpDir);
    });
  });
});
