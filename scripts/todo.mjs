import cp from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * TODO ファイルを保存するディレクトリのパスを取得します。
 * 環境変数 GEMINI_TASK_DIR が設定されている場合はそれを優先し、
 * 設定されていない場合はデフォルトの ".gemini/tasks" を使用します。
 */
export function getTaskDir() {
  return process.env.GEMINI_TASK_DIR || ".gemini/tasks";
}

/**
 * Git から現在のブランチ名を取得し、ファイル名に使用可能な形式に変換します。
 * / は - に置換されます。取得に失敗した場合は "default" を返します。
 * 
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行するディレクトリ。
 */
export function getBranchName(cwd = process.cwd()) {
  try {
    const result = cp.spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { 
      encoding: 'utf8',
      cwd: cwd
    });
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
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行するディレクトリ。
 */
export function getTodoPath(cwd = process.cwd()) {
  const branchName = getBranchName(cwd);
  return path.join(getTaskDir(), `TODO-${branchName}.md`);
}

/**
 * タスクの状態（[ ], [x], [/]）を定義する正規表現。
 */
const TASK_REGEX = /^(\s*)-\s*\[( |x|\/)\]\s*(.*)$/;

/**
 * タスクを表すクラス。階層構造を扱います。
 */
class Task {
  constructor(indent, status, text, lineIndex) {
    this.indent = indent; // スペースの数
    this.status = status; // " ", "x", "/"
    this.text = text;
    this.lineIndex = lineIndex; // 元のファイルでの行番号
    this.children = [];
    this.parent = null;
  }

  get fullStatus() {
    return `[${this.status}]`;
  }

  format() {
    const spaces = ' '.repeat(this.indent);
    return `${spaces}- [${this.status}] ${this.text}`;
  }
}

/**
 * TODO ファイルをパースして Task オブジェクトの木構造を返します。
 */
function parseTodoFile(todoPath) {
  if (!fs.existsSync(todoPath)) return { header: [], tasks: [] };

  const content = fs.readFileSync(todoPath, 'utf8');
  const lines = content.split('\n');
  const header = [];
  const tasks = [];
  const stack = [];

  lines.forEach((line, index) => {
    const match = line.match(TASK_REGEX);
    if (match) {
      const indent = match[1].length;
      const status = match[2];
      const text = match[3];
      const task = new Task(indent, status, text, index);

      // 親子関係の構築
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      if (stack.length > 0) {
        task.parent = stack[stack.length - 1];
        task.parent.children.push(task);
      }
      stack.push(task);
      tasks.push(task);
    } else if (tasks.length === 0 && line.trim() !== '') {
      header.push(line);
    }
  });

  return { header, tasks };
}

/**
 * Task オブジェクトのリストを Markdown 形式に変換します。
 */
function serializeTodo(header, tasks) {
  let content = header.join('\n') + '\n';
  tasks.forEach(task => {
    content += task.format() + '\n';
  });
  return content;
}

/**
 * 新しい TODO ファイルを初期化します。
 */
export function init(title = null, cwd = process.cwd()) {
  const branchName = getBranchName(cwd);
  if (!title) {
    // ブランチ名からタイトルを生成 (feat/abc -> Test Branch 等)
    // ここでは単純にプレフィックス除去とハイフンの置換を行う
    title = branchName
      .replace(/^(feat-|fix-|docs-|refactor-)/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const todoPath = getTodoPath(cwd);
  const dir = path.dirname(todoPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const date = new Date().toISOString().split('T')[0];
  const content = `# TASK: ${title}\n- Branch: ${branchName}\n- Created: ${date}\n`;
  fs.writeFileSync(todoPath, content);
}

/**
 * タスクを追加します。
 */
export function add(taskText, isChild = false, cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  const { header, tasks } = parseTodoFile(todoPath);

  if (isChild) {
    const activeParent = tasks.find(t => t.status === '/');
    if (!activeParent) {
      process.stdout.write("ERROR: 子タスクを追加するには、親タスクが実行中 [/] である必要があります。");
      process.exit(1);
    }
    // 親の直後、または親の最後の子の後に挿入
    const newTask = new Task(activeParent.indent + 2, ' ', taskText);
    const lastChildIndex = tasks.findLastIndex(t => {
      let p = t.parent;
      while (p) {
        if (p === activeParent) return true;
        p = p.parent;
      }
      return false;
    });
    const insertAt = lastChildIndex !== -1 ? lastChildIndex + 1 : tasks.indexOf(activeParent) + 1;
    tasks.splice(insertAt, 0, newTask);
  } else {
    tasks.push(new Task(0, ' ', taskText));
  }

  fs.writeFileSync(todoPath, serializeTodo(header, tasks));
}

/**
 * タスクを開始します。
 */
export function start(pattern, cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  const { header, tasks } = parseTodoFile(todoPath);
  const regex = new RegExp(pattern);

  const targetTask = tasks.find(t => t.status === ' ' && regex.test(t.text));
  if (!targetTask) {
    process.stdout.write(`Error: Task matching '${pattern}' not found or already started.`);
    process.exit(1);
  }

  // 同時実行チェック
  const activeTasks = tasks.filter(t => t.status === '/');
  if (activeTasks.length > 0) {
    // ターゲットが現在実行中のタスクのいずれかの子孫であるかチェック
    const isDescendant = activeTasks.some(active => {
      let p = targetTask.parent;
      while (p) {
        if (p === active) return true;
        p = p.parent;
      }
      return false;
    });

    if (!isDescendant) {
      process.stdout.write("ERROR: 別の系統のタスクが実行中です。先に完了させてください。");
      process.exit(1);
    }
  }

  targetTask.status = '/';
  fs.writeFileSync(todoPath, serializeTodo(header, tasks));
  process.stdout.write(`Started: ${pattern}`);
}

/**
 * タスクを完了します。
 */
export function done(cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  const { header, tasks } = parseTodoFile(todoPath);

  // 最も深い（インデントが大きい）実行中タスクを探す
  const activeTasks = tasks.filter(t => t.status === '/');
  if (activeTasks.length === 0) {
    process.stdout.write("No in-progress task found to mark as DONE.");
    return;
  }

  const deepestTask = activeTasks.reduce((prev, curr) => (curr.indent > prev.indent ? curr : prev));
  deepestTask.status = 'x';

  fs.writeFileSync(todoPath, serializeTodo(header, tasks));
  process.stdout.write("Task marked as DONE.");
}

/**
 * 表示します。
 */
export function show(cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  if (!fs.existsSync(todoPath)) {
    process.stdout.write("No active TODO for this branch.");
    return;
  }
  const content = fs.readFileSync(todoPath, 'utf8').trimEnd();
  const fileName = path.basename(todoPath);
  process.stdout.write(`\n--- ${fileName} ---\n${content}\n`);
}

/**
 * CLI エントリポイント
 */
export function main(argv = process.argv, cwd = process.cwd()) {
  const command = argv[2];
  const args = argv.slice(3);

  if (!command) {
    process.stdout.write("Usage: todo.py [init|add|start|done|show] [args]");
    process.exit(1);
  }

  switch (command) {
    case 'init':
      init(args[0], cwd);
      break;
    case 'add':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.py add <task>");
        process.exit(1);
      }
      const isChild = args.includes('--child');
      const text = args.filter(a => a !== '--child')[0];
      add(text, isChild, cwd);
      break;
    case 'start':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.py start <pattern>");
        process.exit(1);
      }
      start(args[0], cwd);
      break;
    case 'done':
      done(cwd);
      break;
    case 'show':
      show(cwd);
      break;
    default:
      process.stdout.write("Usage: todo.py [init|add|start|done|show] [args]");
      process.exit(1);
  }
}

import { resolve } from 'node:path';
if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
