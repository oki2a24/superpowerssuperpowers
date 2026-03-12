import cp from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const TASK_DIR = ".gemini/tasks";

/**
 * Git から現在のブランチ名を取得し、ファイル名に使用可能な形式に変換します。
 * / は - に置換されます。取得に失敗した場合は "default" を返します。
 * 
 * @returns {string} 変換後のブランチ名。
 */
export function getBranchName() {
  try {
    const result = cp.spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    if (result.status !== 0 || !result.stdout) {
      return 'default';
    }
    return result.stdout.trim().replace(/\//g, '-');
  } catch (e) {
    return 'default';
  }
}

/**
 * 現在のブランチに対応する TODO ファイルのパスを返します。
 * 
 * @returns {string} TODO ファイルへのパス。
 */
export function getTodoPath() {
  const branchName = getBranchName();
  return path.join(TASK_DIR, `TODO-${branchName}.md`);
}

/**
 * 新しい TODO ファイルを初期化します。
 * 
 * @param {string} title - タスクリストのタイトル。
 */
export function init(title) {
  const todoPath = getTodoPath();
  const dir = path.dirname(todoPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const date = new Date().toISOString().split('T')[0];
  const branchName = getBranchName();
  const content = `# TASK: ${title}\n- Branch: ${branchName}\n- Created: ${date}\n`;
  fs.writeFileSync(todoPath, content);
}

/**
 * タスクを TODO ファイルに追記します。
 * 
 * @param {string} task - 追加するタスクの内容。
 */
export function add(task) {
  const todoPath = getTodoPath();
  fs.appendFileSync(todoPath, `- [ ] ${task}\n`);
}

/**
 * TODO ファイルの内容を表示します。
 */
export function show() {
  const todoPath = getTodoPath();
  if (!fs.existsSync(todoPath)) {
    process.stdout.write("No active TODO for this branch.");
    return;
  }
  const content = fs.readFileSync(todoPath, 'utf8').trimEnd();
  const fileName = path.basename(todoPath);
  process.stdout.write(`\n--- ${fileName} ---\n${content}`);
}
