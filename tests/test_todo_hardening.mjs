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
} from '../scripts/todo.mjs';

test('todo.mjs 堅牢化テスト', async (t) => {
  const scriptPath = path.resolve('scripts/todo.mjs');

  await t.test('Git 非依存動作', async (t) => {
    await t.test('Git リポジトリでない場合、getBranchName は null を返す', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-nogit-'));
      // Git 初期化をしない
      const branch = getBranchName(tmpDir);
      assert.strictEqual(branch, null); // 現在は "default" を返すため失敗するはず
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    await t.test('ブランチ名が取得できない場合、getTodoPath は TODO.md を返す', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-path-'));
      process.env.GEMINI_TASK_DIR = tmpDir;
      const todoPath = getTodoPath(tmpDir);
      assert.strictEqual(path.basename(todoPath), 'TODO.md'); // 現在は "TODO-default.md" を返すため失敗するはず
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  await t.test('ディレクトリ自動生成', async (t) => {
    await t.test('親ディレクトリが存在しない状態で add を実行しても成功する', () => {
      const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-autodir-'));
      const taskDir = path.join(tmpBase, 'nested', '.gemini', 'tasks');
      process.env.GEMINI_TASK_DIR = taskDir;
      
      // init を飛ばして直接 add (または init でも親が存在しない場合)
      init('Auto Dir Test', tmpBase);
      
      assert.ok(fs.existsSync(taskDir), 'ディレクトリが自動作成されていること');
      assert.ok(fs.existsSync(getTodoPath(tmpBase)), 'TODOファイルが作成されていること');
      
      fs.rmSync(tmpBase, { recursive: true, force: true });
    });
  });

  await t.test('--help の構造化 (AI-Specific Rules)', async (t) => {
    const result = cp.spawnSync('node', [scriptPath, '--help'], { encoding: 'utf8' });
    const output = result.stdout + result.stderr;
    
    // AI 向けの規律セクションが含まれているか
    assert.match(output, /### AI-Specific Rules/, 'ヘルプには AI 向けの規律セクションが含まれるべき');
    assert.match(output, /show.*を実行して/, 'アクションの前に show を実行する規律が明示されるべき');
    assert.match(output, /ID ベースの操作を優先/, 'ID ベースの操作を優先する規律が明示されるべき');
  });

  await t.test('ID 表示の実装', async (t) => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-id-display-'));
    process.env.GEMINI_TASK_DIR = path.join(tmpBase, '.gemini', 'tasks');
    
    // タスクを 2 つ追加
    cp.spawnSync('node', [scriptPath, 'init', 'ID Test', tmpBase], { cwd: tmpBase });
    cp.spawnSync('node', [scriptPath, 'add', 'Task A', tmpBase], { cwd: tmpBase });
    cp.spawnSync('node', [scriptPath, 'add', 'Task B', tmpBase], { cwd: tmpBase });
    
    const result = cp.spawnSync('node', [scriptPath, 'show', tmpBase], { cwd: tmpBase, encoding: 'utf8' });
    const output = result.stdout;
    
    // ID が表示されているか
    assert.match(output, /- \[ \] \(1\) Task A/, '最初のタスクには (1) が付与されるべき');
    assert.match(output, /- \[ \] \(2\) Task B/, '2 番目のタスクには (2) が付与されるべき');
    
    fs.rmSync(tmpBase, { recursive: true, force: true });
  });

  await t.test('start ID 指定 & Auto-suspend', async (t) => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-start-logic-'));
    process.env.GEMINI_TASK_DIR = path.join(tmpBase, '.gemini', 'tasks');
    
    cp.spawnSync('node', [scriptPath, 'init', 'Start Test', tmpBase], { cwd: tmpBase });
    cp.spawnSync('node', [scriptPath, 'add', 'Task 1', tmpBase], { cwd: tmpBase });
    cp.spawnSync('node', [scriptPath, 'add', 'Task 2', tmpBase], { cwd: tmpBase });
    
    // 1. ID 指定で開始 (Task 1)
    cp.spawnSync('node', [scriptPath, 'start', '1', tmpBase], { cwd: tmpBase });
    let result = cp.spawnSync('node', [scriptPath, 'show', tmpBase], { cwd: tmpBase, encoding: 'utf8' });
    let output = result.stdout.replace(/\x1b\[[0-9;]*m/g, ''); // カラーコード除去
    assert.match(output, /- \[\/\] \(1\) Task 1/, 'ID 1 でタスクが開始され、show で ID 付きで表示されるべき');
    
    // 2. Auto-suspend: Task 2 を開始すると Task 1 が [ ] に戻るべき
    cp.spawnSync('node', [scriptPath, 'start', '2', tmpBase], { cwd: tmpBase });
    result = cp.spawnSync('node', [scriptPath, 'show', tmpBase], { cwd: tmpBase, encoding: 'utf8' });
    output = result.stdout.replace(/\x1b\[[0-9;]*m/g, ''); // カラーコード除去
    assert.match(output, /- \[ \] \(1\) Task 1/, '新しいタスク開始時に前のタスクは [ ] に戻るべき');
    assert.match(output, /- \[\/\] \(2\) Task 2/, '新しいタスクが [/] になるべき');
    
    fs.rmSync(tmpBase, { recursive: true, force: true });
  });
});
