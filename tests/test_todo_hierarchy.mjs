import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mock } from 'node:test';
import { 
  getTodoPath,
  init, 
  add, 
  start, 
  done 
} from '../scripts/todo.mjs';

function setupTmpDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-hierarchy-test-'));
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

test('todo.mjs 階層タスク管理 (P1-P9)', async (t) => {

  /**
   * シナリオ P1: 多階層 (3レベル以上)
   * 
   * [イメージ]
   * - [/] A
   *   - [/] B
   *     - [/] C (<- 最深部)
   * 
   * C -> B -> A の順で正しく完了できることを確認します。
   */
  await t.test('P1: 3レベル以上のネスト管理', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P1 Test', tmpDir);
    add('A', false, tmpDir);
    start('A', tmpDir);
    add('B', true, tmpDir);
    start('B', tmpDir);
    add('C', true, tmpDir);
    start('C', tmpDir);
    
    // C 完了
    done(tmpDir);
    assert.match(fs.readFileSync(getTodoPath(tmpDir), 'utf8'), /- \[\/\] A\n  - \[\/\] B\n    - \[x\] C/);
    // B 完了
    done(tmpDir);
    assert.match(fs.readFileSync(getTodoPath(tmpDir), 'utf8'), /- \[\/\] A\n  - \[x\] B\n    - \[x\] C/);
    // A 完了
    done(tmpDir);
    assert.match(fs.readFileSync(getTodoPath(tmpDir), 'utf8'), /- \[x\] A\n  - \[x\] B\n    - \[x\] C/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P2: 複数の子タスク
   * 
   * [イメージ]
   * - [/] Parent
   *   - [ ] Child 1
   *   - [ ] Child 2
   */
  await t.test('P2: 同一親に対する複数の子タスク', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P2 Test', tmpDir);
    add('Parent', false, tmpDir);
    start('Parent', tmpDir);
    add('C1', true, tmpDir);
    add('C2', true, tmpDir);
    
    const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[\/\] Parent\n  - \[ \] C1\n  - \[ \] C2/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P3/P7: 系統のブロック
   * 
   * [イメージ]
   * - [/] A (系統1)
   * - [ ] B (系統2: ブロックされる)
   */
  await t.test('P3/P7: 独立系統の同時実行における Auto-suspend', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P3/P7 Test', tmpDir);
    add('A', false, tmpDir);
    add('B', false, tmpDir);
    
    // A を開始
    start('A', tmpDir);
    let content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[\/\] A/);

    // B を開始。エラーにならずに A が [ ] に戻り、B が [/] になるべき
    start('B', tmpDir);
    content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[ \] A/, '前のタスク A は自動的に中断されるべき');
    assert.match(content, /- \[\/\] B/, '新しいタスク B が開始されるべき');

    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P4: 親なしでの子タスク追加
   */
  await t.test('P4: 実行中タスクがない状態での add --child エラー', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P4 Test', tmpDir);
    add('A', false, tmpDir);
    
    const mockExit = mock.fn((code) => { if (code !== 0) throw new Error('Exit ' + code); });
    const originalExit = process.exit;
    process.exit = mockExit;
    try {
      assert.throws(() => add('Child', true, tmpDir), /Exit 1/);
    } finally {
      process.exit = originalExit;
    }
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P5: 複数実行中の追加先 (最深部優先)
   * 
   * [イメージ]
   * - [/] A
   *   - [/] B (<- ここが最深)
   *     - [ ] C (<- ここに追加)
   */
  await t.test('P5: 複数実行中のタスクがある場合の最深部への追加', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P5 Test', tmpDir);
    add('A', false, tmpDir);
    start('A', tmpDir);
    add('B', true, tmpDir);
    start('B', tmpDir);
    add('C', true, tmpDir); // B の下に追加されるべき
    
    const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[\/\] A\n  - \[\/\] B\n    - \[ \] C/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P6: 系統内での兄弟タスク追加
   * 
   * [イメージ]
   * - [/] Parent
   *   - [ ] Child (未実行)
   *   - [ ] NewSibling (<- Parent の子として追加)
   */
  await t.test('P6: 未実行タスクがある状態での add --child (親の直下に追加)', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P6 Test', tmpDir);
    add('Parent', false, tmpDir);
    start('Parent', tmpDir);
    add('Child', true, tmpDir);
    add('NewSibling', true, tmpDir);
    
    const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[\/\] Parent\n  - \[ \] Child\n  - \[ \] NewSibling/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P6-2: 孫タスクの作成
   * 
   * [イメージ]
   * - [/] Parent
   *   - [/] Child
   *     - [ ] Grandchild (<- Child の子として追加)
   */
  await t.test('P6-2: 実行中タスクの下への孫タスク追加', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P6-2 Test', tmpDir);
    add('Parent', false, tmpDir);
    start('Parent', tmpDir);
    add('Child', true, tmpDir);
    start('Child', tmpDir);
    add('Grandchild', true, tmpDir);
    
    const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[\/\] Parent\n  - \[\/\] Child\n    - \[ \] Grandchild/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P8: 部分的完了の伝播
   */
  await t.test('P8: 子タスク完了後の親タスク完了', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P8 Test', tmpDir);
    add('P', false, tmpDir);
    start('P', tmpDir);
    add('C', true, tmpDir);
    start('C', tmpDir);
    done(tmpDir); // C 完了
    done(tmpDir); // P 完了
    
    const content = fs.readFileSync(getTodoPath(tmpDir), 'utf8');
    assert.match(content, /- \[x\] P\n  - \[x\] C/);
    teardownTmpDir(tmpDir);
  });

  /**
   * シナリオ P9: 完了済みタスクの再開禁止
   */
  await t.test('P9: [x] 状態のタスクを start しようとするとエラー', async (t) => {
    const tmpDir = setupTmpDir();
    setupRepo(tmpDir);
    init('P9 Test', tmpDir);
    add('A', false, tmpDir);
    start('A', tmpDir);
    done(tmpDir);
    
    const mockExit = mock.fn((code) => { if (code !== 0) throw new Error('Exit ' + code); });
    const originalExit = process.exit;
    process.exit = mockExit;
    try {
      assert.throws(() => start('A', tmpDir), /Exit 1/);
    } finally {
      process.exit = originalExit;
    }
    teardownTmpDir(tmpDir);
  });
});
