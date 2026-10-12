import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const briefScript = path.resolve('skills/subagent-driven-development/scripts/task-brief');
const startScript = path.resolve('skills/executing-plans/scripts/task-start');

for (const [first, next] of [['タスク', 'Task'], ['Task', 'タスク'], ['タスク', 'タスク'], ['Task', 'Task']]) {
  test(`${first} の本文を抽出し、次の ${next} 見出しで停止する`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-brief-'));
    try {
      const plan = path.join(dir, 'plan.md');
      const out = path.join(dir, 'brief.md');
      const expected = `### ${first} 1: 対象\n本文\n#### 手順\n詳細\n\x60\x60\x60text\n### ${next} 2: コード内\n\x60\x60\x60\n`;
      fs.writeFileSync(plan, `# 計画\n### ${next} 10: 別番号\n対象外\n${expected}## ${next} 2: 次\n次の本文\n`);
      const result = spawnSync('bash', [briefScript, plan, '1', out], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(fs.readFileSync(out, 'utf8'), expected);
      const missing = spawnSync('bash', [briefScript, plan, '9', out], { encoding: 'utf8' });
      assert.equal(missing.status, 3);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

test('task-start が日本語計画から本文と現在のコミットを返す', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-start-'));
  try {
    const git = (...args) => {
      const result = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
    git('init', '-q');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'fixture');
    fs.writeFileSync(path.join(dir, 'plan.md'), '### タスク 1: 対象\n本文\n');
    const result = spawnSync('bash', [startScript, 'plan.md', '1'], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const brief = path.join(fs.realpathSync(dir), '.superpowers/sdd/plan/task-1-brief.md');
    assert.equal(result.stdout, `brief: ${brief}\nbase: ${git('rev-parse', 'HEAD')}\n`);
    assert.equal(fs.readFileSync(brief, 'utf8'), '### タスク 1: 対象\n本文\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
