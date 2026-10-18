import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const FINISH_CHECK = path.join(ROOT, 'scripts/finish_check.mjs');
const PRE_PUSH_HOOK = path.join(ROOT, '.githooks/pre-push');

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

test('pre-push hook blocks a commit with mismatched distribution versions', (t) => {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-push-version-check-'));
  t.after(() => fs.rmSync(workDir, { recursive: true, force: true }));

  const repoDir = path.join(workDir, 'repo');
  const remoteDir = path.join(workDir, 'remote.git');
  fs.mkdirSync(repoDir);
  git(workDir, ['init', '--bare', '--initial-branch=main', remoteDir]);
  git(repoDir, ['init', '--initial-branch=main']);
  git(repoDir, ['config', 'user.name', 'Version Gate Test']);
  git(repoDir, ['config', 'user.email', 'version-gate@example.invalid']);

  fs.mkdirSync(path.join(repoDir, 'scripts'));
  fs.mkdirSync(path.join(repoDir, '.codex-plugin'));
  fs.mkdirSync(path.join(repoDir, '.githooks'));
  fs.copyFileSync(FINISH_CHECK, path.join(repoDir, 'scripts/finish_check.mjs'));
  if (fs.existsSync(PRE_PUSH_HOOK)) {
    const hook = path.join(repoDir, '.githooks/pre-push');
    fs.copyFileSync(PRE_PUSH_HOOK, hook);
    fs.chmodSync(hook, 0o755);
  }

  fs.writeFileSync(path.join(repoDir, 'package.json'), JSON.stringify({ version: '1.11.6' }));
  fs.writeFileSync(path.join(repoDir, 'antigravity-extension.json'), JSON.stringify({ version: '1.11.6' }));
  fs.writeFileSync(path.join(repoDir, '.codex-plugin/plugin.json'), JSON.stringify({ version: '1.11.6' }));
  fs.writeFileSync(path.join(repoDir, 'initial.txt'), 'initial');
  git(repoDir, ['add', '.']);
  git(repoDir, ['commit', '-m', 'initial version manifests']);
  const baseCommit = git(repoDir, ['rev-parse', 'HEAD']);
  git(repoDir, ['remote', 'add', 'origin', remoteDir]);
  git(repoDir, ['push', '--set-upstream', 'origin', 'main']);

  fs.writeFileSync(path.join(repoDir, 'package.json'), JSON.stringify({ version: '1.12.0' }));
  git(repoDir, ['add', 'package.json']);
  git(repoDir, ['commit', '-m', 'introduce a version mismatch']);
  git(repoDir, ['config', 'core.hooksPath', '.githooks']);

  const push = spawnSync('git', ['push', 'origin', 'main'], { cwd: repoDir, encoding: 'utf8' });
  assert.notEqual(push.status, 0, 'a version-mismatched commit must not be pushed');
  assert.match(`${push.stdout}\n${push.stderr}`, /バージョンが一致しません/);
  assert.equal(git(remoteDir, ['rev-parse', 'refs/heads/main']), baseCommit);
});
