import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const SCRIPT_PATH = path.resolve('scripts/finish_check.mjs');

// 一時リポジトリを作成するヘルパー
function createTempRepo() {
  const repoPath = fs.mkdtempSync(path.join(os.tmpdir(), 'finish-check-test-'));
  spawnSync('git', ['init'], { cwd: repoPath });
  // 初期コミット
  fs.writeFileSync(path.join(repoPath, 'initial.txt'), 'init');
  spawnSync('git', ['add', '.'], { cwd: repoPath });
  spawnSync('git', ['commit', '-m', 'initial commit'], { cwd: repoPath });
  return repoPath;
}

test('finish_check.mjs - 異常系: 未コミットファイルがある場合に非ゼロで終了すること', (t) => {
  const repoPath = createTempRepo();
  try {
    // 未追跡ファイルを作成
    fs.writeFileSync(path.join(repoPath, 'untracked.txt'), 'dirty');
    
    const result = spawnSync('node', [SCRIPT_PATH, 'HEAD'], { 
      cwd: repoPath,
      encoding: 'utf8' 
    });
    
    assert.notStrictEqual(result.status, 0, '未コミットファイルがある場合は非ゼロで終了すべき');
    assert.match(result.stderr, /未コミットまたは未追跡のファイルがあります/, '適切なエラーメッセージが出力されること');
  } finally {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
});

test('finish_check.mjs - 異常系: バージョン更新漏れを検知して非ゼロで終了すること', (t) => {
  const repoPath = createTempRepo();
  try {
    // 1. スキルファイルを追加してコミット（ベースラインより先行させる）
    const skillDir = path.join(repoPath, 'skills');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'test-skill.md'), 'content');
    
    // バージョンファイルは作成するが、コミットには含めない（または変更しない）
    fs.writeFileSync(path.join(repoPath, 'gemini-extension.json'), JSON.stringify({ version: "1.0.0" }));
    
    spawnSync('git', ['add', 'skills/test-skill.md'], { cwd: repoPath });
    spawnSync('git', ['commit', '-m', 'add skill without version update'], { cwd: repoPath });

    // HEAD~1 をベースラインとして比較
    const result = spawnSync('node', [SCRIPT_PATH, 'HEAD~1'], { 
      cwd: repoPath,
      encoding: 'utf8' 
    });
    
    assert.notStrictEqual(result.status, 0, 'バージョン更新漏れがある場合は非ゼロで終了すべき');
    assert.match(result.stderr, /gemini-extension\.json のバージョンが更新されていません/, 'バージョンエラーメッセージが出力されること');
  } finally {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
});

test('finish_check.mjs - 正常系: すべての条件を満たす場合に 0 で終了すること', (t) => {
  const repoPath = createTempRepo();
  try {
    // スキルとバージョンを同時に更新してコミット
    const skillDir = path.join(repoPath, 'skills');
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, 'test-skill.md'), 'content');
    fs.writeFileSync(path.join(repoPath, 'gemini-extension.json'), JSON.stringify({ version: "1.1.0" }));
    
    spawnSync('git', ['add', '.'], { cwd: repoPath });
    spawnSync('git', ['commit', '-m', 'feat: update skill and version'], { cwd: repoPath });

    const result = spawnSync('node', [SCRIPT_PATH, 'HEAD~1'], { 
      cwd: repoPath,
      encoding: 'utf8' 
    });
    
    assert.strictEqual(result.status, 0, '正常な状態では 0 で終了すべき');
    assert.match(result.stdout, /All checks passed/, '成功メッセージが出力されること');
  } finally {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
});
