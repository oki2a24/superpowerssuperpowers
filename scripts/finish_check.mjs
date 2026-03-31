#!/usr/bin/env node

/**
 * finish_check.mjs
 * 完了宣言前にプロジェクトの物理的な不整合をチェックするバリデータ。
 */

import { spawnSync } from 'node:child_process';

const baseRef = process.argv[2] || 'origin/main';

function runGit(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`Git command failed: git ${args.join(' ')}`);
    console.error(result.stderr);
    return null;
  }
  return result.stdout.trim();
}

console.log(`--- Finish Check (Baseline: ${baseRef}) ---`);

let hasError = false;

// 1. Dirty Check
const status = runGit(['status', '--porcelain']);
if (status) {
  console.error('❌ FAIL: 未コミットまたは未追跡のファイルがあります。');
  console.error(status);
  hasError = true;
} else {
  console.log('✅ Git Status: Clean');
}

// 2. Delta Analysis & Version Check
const diff = runGit(['diff', '--name-only', `${baseRef}..HEAD`]);
if (diff !== null) {
  const files = diff.split('\n').filter(f => f.length > 0);
  const coreDirectories = ['skills/', 'observations/', 'scripts/', 'agents/'];
  const coreFiles = ['GEMINI.md'];

  const hasCoreChanges = files.some(f => 
    coreDirectories.some(dir => f.startsWith(dir)) || 
    coreFiles.includes(f)
  );
  const hasVersionUpdate = files.some(f => f === 'gemini-extension.json');

  if (hasCoreChanges && !hasVersionUpdate) {
    console.error('❌ FAIL: スキル、知見、またはコアロジックに変更がありますが、gemini-extension.json のバージョンが更新されていません。');
    hasError = true;
  } else if (hasCoreChanges) {
    console.log('✅ Version: Updated');
  }

  // 変更ファイルリストの提示（AI へのヒント）
  if (files.length > 0) {
    console.log('\n--- セッション内の変更ファイル ---');
    files.forEach(f => console.log(`  ${f}`));
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('\n✨ All checks passed. 完了を宣言する準備ができています。');
  process.exit(0);
}
