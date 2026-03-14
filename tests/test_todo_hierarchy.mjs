import test from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { main, getBranchName } from '../scripts/todo.mjs';

test('CLI 仕様再定義 (階層タスク管理)', async (t) => {
  const scriptPath = path.resolve('scripts/todo.mjs');
  let tmpDir;

  const setupRepo = (dir) => {
    cp.spawnSync('git', ['init'], { cwd: dir });
    cp.spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
    cp.spawnSync('git', ['config', 'user.name', 'Test User'], { cwd: dir });
    cp.spawnSync('git', ['commit', '--allow-empty', '-m', 'initial'], { cwd: dir });
    cp.spawnSync('git', ['checkout', '-b', 'feat/test-branch'], { cwd: dir });
  };

  t.beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-todo-hierarchy-'));
    process.env.GEMINI_TASK_DIR = tmpDir;
    setupRepo(tmpDir);
  });

  t.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.GEMINI_TASK_DIR;
  });

  await t.test('init コマンドが引数なしでブランチ名からタイトルを生成すること', () => {
    main(['node', 'todo.mjs', 'init'], tmpDir);
    const todoPath = path.join(tmpDir, 'TODO-feat-test-branch.md');
    const content = fs.readFileSync(todoPath, 'utf8');
    assert.match(content, /# TASK: Test Branch/);
    assert.match(content, /- Branch: feat-test-branch/);
  });

  await t.test('add --child が現在実行中のタスクの子としてインデント付きで追加すること', () => {
    main(['node', 'todo.mjs', 'init', 'Test'], tmpDir);
    main(['node', 'todo.mjs', 'add', '親タスク'], tmpDir);
    main(['node', 'todo.mjs', 'start', '親タスク'], tmpDir);
    main(['node', 'todo.mjs', 'add', '--child', '子タスク'], tmpDir);

    const todoPath = path.join(tmpDir, 'TODO-feat-test-branch.md');
    const content = fs.readFileSync(todoPath, 'utf8');
    assert.match(content, new RegExp('- \\[/\\] 親タスク\\n  - \\[ \\] 子タスク'));
  });

  await t.test('start が親子関係にあるタスクの同時実行を許可すること', () => {
    main(['node', 'todo.mjs', 'init', 'Test'], tmpDir);
    main(['node', 'todo.mjs', 'add', '親'], tmpDir);
    main(['node', 'todo.mjs', 'start', '親'], tmpDir);
    main(['node', 'todo.mjs', 'add', '--child', '子'], tmpDir);
    main(['node', 'todo.mjs', 'start', '子'], tmpDir);

    const todoPath = path.join(tmpDir, 'TODO-feat-test-branch.md');
    const content = fs.readFileSync(todoPath, 'utf8');
    assert.match(content, new RegExp('- \\[/\\] 親'));
    assert.match(content, new RegExp('  - \\[/\\] 子'));
  });

  await t.test('done が最も深い階層の実行中タスクから完了させること', () => {
    main(['node', 'todo.mjs', 'init', 'Test'], tmpDir);
    main(['node', 'todo.mjs', 'add', '親'], tmpDir);
    main(['node', 'todo.mjs', 'start', '親'], tmpDir);
    main(['node', 'todo.mjs', 'add', '--child', '子'], tmpDir);
    main(['node', 'todo.mjs', 'start', '子'], tmpDir);

    main(['node', 'todo.mjs', 'done'], tmpDir);
    const todoPath = path.join(tmpDir, 'TODO-feat-test-branch.md');
    let content = fs.readFileSync(todoPath, 'utf8');
    assert.match(content, new RegExp('- \\[/\\] 親'));
    assert.match(content, new RegExp('  - \\[x\\] 子'));

    main(['node', 'todo.mjs', 'done'], tmpDir);
    content = fs.readFileSync(todoPath, 'utf8');
    assert.match(content, new RegExp('- \\[x\\] 親'));
  });
});
