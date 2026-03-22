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
});
