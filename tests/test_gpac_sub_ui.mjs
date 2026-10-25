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

  function writeSpawnDraft(tempBase) {
    /**
     * spawn コマンドに渡すタスク下書きを一時ディレクトリに作成します。
     */
    fs.writeFileSync(path.join(tempBase, 'task_draft.md'), `---
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
  }

  function runGpacSpawn(tempBase, launcher) {
    /**
     * HOME を差し替えて gpac_sub.mjs の spawn コマンドを実行します。
     * 実ホーム（SSOT 実ディレクトリ）を汚染しないための共通手順です。
     */
    const savedCli = process.env.GPAC_AGENT_COMMAND;
    try {
      return cp.spawnSync('node', [path.resolve('scripts', 'gpac_sub.mjs'), 'spawn', 'task_draft.md'], {
        cwd: tempBase,
        env: { ...process.env, HOME: tempBase, GPAC_LAUNCHER: launcher, GPAC_AGENT_COMMAND: '' },
        encoding: 'utf8'
      });
    } finally {
      if (savedCli !== undefined) { process.env.GPAC_AGENT_COMMAND = savedCli; }
    }
  }

  await t.test('gpac_sub.mjs CLI - GPAC_LAUNCHER=manual の spawn は GPAC_AGENT_COMMAND 再実行案内を出し、.agents 名前空間に SSOT を作る', () => {
    /**
     * why: main() が env `GPAC_LAUNCHER` を読むこと、および HOME を差し替えた
     * 子プロセス観察で、SSOT が ~/.agents/sub-sessions に作られることを
     * end-to-end で検証するため。
     */
    const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'gpac-main-test-'));
    writeSpawnDraft(tempBase);
    try {
      const result = runGpacSpawn(tempBase, 'manual');
      assert.strictEqual(result.status, 0, `spawn should succeed: ${result.stderr}`);
      assert.ok(result.stdout.includes('GPAC_AGENT_COMMAND'), `再実行案内を出すこと: ${result.stdout}`);
      assert.ok(fs.existsSync(path.join(tempBase, '.agents', 'sub-sessions')), 'SSOT が新名前空間に作られること');
    } finally {
      if (fs.existsSync(tempBase)) fs.rmSync(tempBase, { recursive: true, force: true });
    }
  });

  await t.test('gpac_sub.mjs CLI - GPAC_LAUNCHER=tmux かつ CLI 未設定時、main 配線を経て tmux を試みず manual へフォールバックする', () => {
    /**
     * why: env 名のリネームが main() → launchSession の配線を通じて機能して
     * いることを検証するため。launchSession の直接呼び出しテストだけでは
     * 環境変数名の回帰（例: GEMINI_SUB_LAUNCHER への逆戻り）を検出できない。
     */
    const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'gpac-main-test-'));
    writeSpawnDraft(tempBase);
    try {
      const result = runGpacSpawn(tempBase, 'tmux');
      assert.strictEqual(result.status, 0, `spawn should succeed: ${result.stderr}`);
      assert.ok(
        result.stdout.includes('Falling back to manual mode.'),
        `tmux→manual フォールバック経由の案内を出すこと: ${result.stdout}`
      );
    } finally {
      if (fs.existsSync(tempBase)) fs.rmSync(tempBase, { recursive: true, force: true });
    }
  });
});
