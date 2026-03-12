import cp from 'node:child_process';
import path from 'node:path';

/**
 * Git から現在のブランチ名を取得し、ファイル名に使用可能な形式に変換します。
 * / は - に置換されます。取得に失敗した場合は "default" を返します。
 * @returns {string}
 */
export function getBranchName() {
  try {
    const result = cp.spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    if (result.status !== 0 || !result.stdout) {
      return 'default';
    }
    return result.stdout.trim().replace(/\//g, '-');
  } catch {
    return 'default';
  }
}

/**
 * 現在のブランチに対応する TODO ファイルのパスを返します。
 * @returns {string}
 */
export function getTodoPath() {
  const branchName = getBranchName();
  return path.join('.gemini/tasks', `TODO-${branchName}.md`);
}
