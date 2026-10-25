import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import cp from 'node:child_process';
import { createFromTemplate } from '../scripts/gpac_sub.mjs';

test('gpac_sub.mjs UI 改善テスト', async (t) => {
  await t.test('createFromTemplate は生成された絶対パスをカラーで出力すること', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-sub-ui-test-'));
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

  test('gpac_sub.mjs CLI - GPAC_LAUNCHER=manual の spawn は GPAC_AGENT_COMMAND 再実行案内を出し、.agents 名前空間に SSOT を作る', () => {
    /**
     * why: main() が旧環境変数 GEMINI_SUB_LAUNCHER ではなく GPAC_LAUNCHER を
     * 読むこと、および HOME を差し替えた子プロセス観察で、SSOT が
     * ~/.agents/sub-sessions に作られることを end-to-end で検証するため。
     */
    const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'gpac-main-test-'));
    const draft = path.join(tempBase, 'task_draft.md');
    fs.writeFileSync(draft, `---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: "test"
work_dir: "."
mission: "テストミッション"
required_skills: ["using-superpowers"]
steps:
  - "ステップ 1"
---
# Mission
`);
    const savedCli = process.env.GPAC_AGENT_COMMAND;
    try {
      const result = cp.spawnSync('node', [path.resolve('scripts', 'gpac_sub.mjs'), 'spawn', 'task_draft.md'], {
        cwd: tempBase,
        env: { ...process.env, HOME: tempBase, GPAC_LAUNCHER: 'manual', GPAC_AGENT_COMMAND: '' },
        encoding: 'utf8'
      });
      assert.strictEqual(result.status, 0, `spawn should succeed: ${result.stderr}`);
      assert.ok(result.stdout.includes('GPAC_AGENT_COMMAND'), `再実行案内を出すこと: ${result.stdout}`);
      assert.ok(fs.existsSync(path.join(tempBase, '.agents', 'sub-sessions')), 'SSOT が新名前空間に作られること');
    } finally {
      if (savedCli !== undefined) { process.env.GPAC_AGENT_COMMAND = savedCli; }
      if (fs.existsSync(tempBase)) fs.rmSync(tempBase, { recursive: true, force: true });
    }
  });
});
