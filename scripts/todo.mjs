import cp from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

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

/**
 * 指定されたパターンにマッチする最初の未完了タスクを開始状態 [/] にします。
 * すでに実行中のタスクがある場合はエラー終了します。
 * 
 * @param {string} pattern - 検索するタスクのパターン。
 */
export function start(pattern) {
  const todoPath = getTodoPath();
  if (!fs.existsSync(todoPath)) {
    process.stdout.write(`Error: ${todoPath} not found.\n`);
    process.exit(1);
  }

  const content = fs.readFileSync(todoPath, 'utf8');
  if (content.includes('[/]')) {
    process.stdout.write("ERROR: 他のタスクが実行中です。先に完了させてください。\n");
    process.exit(1);
  }

  const lines = content.split('\n');
  let found = false;
  const regex = new RegExp(pattern);
  const newLines = lines.map(line => {
    if (!found && line.includes('[ ]') && regex.test(line)) {
      found = true;
      return line.replace('[ ]', '[/]');
    }
    return line;
  });

  if (!found) {
    // 一致するタスクが見つからない、または既に開始されている場合
    process.stdout.write(`Error: Task matching '${pattern}' not found or already started.\n`);
    process.exit(1);
  }

  fs.writeFileSync(todoPath, newLines.join('\n'));
  // 成功メッセージを表示
  process.stdout.write(`Started: ${pattern}\n`);
}

/**
 * 進行中のタスク ([/]) を完了状態 ([x]) に変更します。
 */
export function done() {
  const todoPath = getTodoPath();
  if (!fs.existsSync(todoPath)) {
    process.stdout.write(`Error: ${todoPath} not found.\n`);
    process.exit(1);
  }

  const content = fs.readFileSync(todoPath, 'utf8');
  if (!content.includes('[/]')) {
    // 進行中のタスクが見つからない場合
    process.stdout.write("No in-progress task found to mark as DONE.\n");
    process.exit(1);
  }

  const newContent = content.replace(/\[\/\]/, '[x]');
  fs.writeFileSync(todoPath, newContent);
  // 成功メッセージを表示
  process.stdout.write("Task marked as DONE.\n");
}

// メインロジック：直接実行された場合にコマンドを処理します。
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'init':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.mjs init <title>\n");
        process.exit(1);
      }
      init(args[0]);
      break;
    case 'add':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.mjs add <task>\n");
        process.exit(1);
      }
      add(args[0]);
      break;
    case 'show':
      show();
      break;
    case 'start':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.mjs start <pattern>\n");
        process.exit(1);
      }
      start(args[0]);
      break;
    case 'done':
      done();
      break;
    default:
      process.stdout.write("Usage: todo.mjs [init|add|show|start|done] [args...]\n");
      process.exit(1);
  }
}
