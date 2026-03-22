import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createFromTemplate } from '../scripts/gemini_sub.mjs';

test('gemini_sub.mjs UI 改善テスト', async (t) => {
  await t.test('createFromTemplate は生成された絶対パスをカラーで出力すること', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-sub-ui-test-'));
    const draftPath = path.join(tempDir, 'task_draft.md');

    let output = '';
    const originalLog = console.log;
    console.log = (msg) => { output += msg + '\n'; };

    try {
      createFromTemplate('task', draftPath);
      
      console.log = originalLog;
      
      // 1. 絶対パスが含まれているか
      const absolutePath = path.resolve(draftPath);
      assert.ok(output.includes(absolutePath), `出力に絶対パスが含まれていること: ${output}`);
      
      // 2. ANSI カラーコードが含まれているか (\x1b[)
      assert.match(output, /\x1b\[\d+m/, '出力に ANSI カラーコードが含まれていること');
      
    } finally {
      console.log = originalLog;
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
