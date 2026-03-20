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
 * 個別のタスクを表すクラス。階層構造（親子関係）とステータスを管理します。
 */
class Task {
  /**
   * Task クラスのコンストラクタ。
   * 
   * @param {number} indent - インデントのスペース数。
   * @param {string} status - タスクのステータス。' '（未着手）, 'x'（完了）, '/'（実行中）。
   * @param {string} text - タスクの内容（テキスト）。
   * @param {number|null} [lineIndex=null] - 元のファイルでの 0 から始まる行番号。
   */
  constructor(indent, status, text, lineIndex = null) {
    this.indent = indent; // スペースの数
    this.status = status; // " ", "x", "/"
    this.text = text;
    this.lineIndex = lineIndex; // 元のファイルでの行番号
    this.children = [];
    this.parent = null;
  }

  /**
   * ステータスを角括弧で囲んだ形式（例: [x]）を取得します。
   * 
   * @returns {string} 角括弧付きのステータス文字列。
   */
  get fullStatus() {
    return `[${this.status}]`;
  }

  /**
   * タスクを Markdown 形式の 1 行（例: "- [ ] Task content"）にフォーマットします。
   * インデントも反映されます。
   * 
   * @returns {string} フォーマット済みのタスク文字列。
   */
  format() {
    const spaces = ' '.repeat(this.indent);
    return `${spaces}- [${this.status}] ${this.text}`;
  }
}

/**
 * TODO ファイルをパースして、ヘッダー行のリストと Task オブジェクトのリストを返します。
 * 親子関係もこのフェーズで構築されます。
 * 
 * @param {string} todoPath - パース対象の TODO ファイルのパス。
 * @returns {Object} { header: string[], tasks: Task[] } 形式のオブジェクト。
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
 * ヘッダーとタスクのリストを受け取り、単一の Markdown 文字列にシリアライズします。
 * 
 * @param {string[]} header - ファイルのヘッダー行（# TASK: 等）の配列。
 * @param {Task[]} tasks - Task オブジェクトの配列。
 * @returns {string} シリアライズされた Markdown コンテンツ。
 */
function serializeTodo(header, tasks) {
  let content = header.join('\n') + '\n';
  tasks.forEach(task => {
    content += task.format() + '\n';
  });
  return content;
}

/**
 * 新しい TODO ファイルを現在のブランチ（または指定された cwd）に対応するパスに初期化します。
 * タイトルが指定されない場合、ブランチ名から自動生成します。
 * 
 * @param {string|null} [title=null] - タスクのタイトル。
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行する基準ディレクトリ。
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
 * TODO ファイルに新しいタスクを追加します。
 * isChild が true の場合、現在実行中（[/]）のタスクの子タスクとして適切なインデントで挿入されます。
 * 
 * @param {string} taskText - 追加するタスクのテキスト。
 * @param {boolean} [isChild=false] - 子タスクとして追加するかどうか。
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行する基準ディレクトリ。
 */
export function add(taskText, isChild = false, cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  const { header, tasks } = parseTodoFile(todoPath);

  if (isChild) {
    const activeTasks = tasks.filter(t => t.status === '/');
    if (activeTasks.length === 0) {
      process.stdout.write("ERROR: 子タスクを追加するには、親タスクが実行中 [/] である必要があります。");
      process.exit(1);
    }
    // 最も深い（インデントが最大の）実行中タスクを親とする
    const activeParent = activeTasks.reduce((prev, curr) => (curr.indent > prev.indent ? curr : prev));
    
    // 親の直後、または親の最後の子孫の後に挿入
    const newTask = new Task(activeParent.indent + 2, ' ', taskText);
    
    let lastDescendantIndex = tasks.indexOf(activeParent);
    for (let i = lastDescendantIndex + 1; i < tasks.length; i++) {
      if (tasks[i].indent > activeParent.indent) {
        lastDescendantIndex = i;
      } else {
        break;
      }
    }
    const insertAt = lastDescendantIndex + 1;
    tasks.splice(insertAt, 0, newTask);
  } else {
    tasks.push(new Task(0, ' ', taskText));
  }

  fs.writeFileSync(todoPath, serializeTodo(header, tasks));
}

/**
 * 指定されたパターン（正規表現）に一致する最初の未着手タスクを「開始 (/)」状態にします。
 * 既に別の独立した系統のタスクが実行中の場合は、エラーを出力して終了します。
 * 
 * @param {string} pattern - 開始するタスクを特定するための検索パターン。
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行する基準ディレクトリ。
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
 * 現在実行中（[/]）のタスクのうち、最も階層の深い（インデントの大きい）ものを「完了 (x)」にします。
 * 
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行する基準ディレクトリ。
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
 * 現在のブランチのタスク状況をダッシュボード形式で標準出力に表示します。
 * プログレスバー、現在注目中のタスク、アクティブなタスク一覧、完了履歴が含まれます。
 * 
 * @param {string} [cwd=process.cwd()] - Git コマンドを実行する基準ディレクトリ。
 */
export function show(cwd = process.cwd()) {
  const todoPath = getTodoPath(cwd);
  if (!fs.existsSync(todoPath)) {
    process.stdout.write("No active TODO for this branch.\n");
    return;
  }
  const { header, tasks } = parseTodoFile(todoPath);
  const summary = calculateSummary(tasks);
  // タイトルをヘッダーから抽出（既存の init タイトルを想定）
  summary.title = header.find(l => l.startsWith('# TASK:'))?.replace('# TASK:', '').trim() || 'Task List';
  
  const output = formatDashboard(summary);
  process.stdout.write(output);
}

/**
 * ANSI カラーコード
 */
export const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  CYAN: '\x1b[36m'
};

/**
 * 進捗状況を表す ASCII プログレスバー（例: [▓▓▓░░░░░░░]）を生成します。
 * 
 * @param {number} done - 完了済みタスク数。
 * @param {number} total - 全タスク数。
 * @param {number} [width=10] - バーの全体の文字数（括弧内）。
 * @returns {string} フォーマット済みのプログレスバー文字列。
 */
export function getProgressBar(done, total, width = 10) {
  if (total === 0) return '[' + '░'.repeat(width) + ']';
  const filled = Math.round((done / total) * width);
  return '[' + '▓'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

/**
 * タスクのリストから進捗統計を計算します。
 * 
 * @param {Task[]} tasks - 統計計算の対象となる Task 配列。
 * @returns {Object} 以下のプロパティを持つ統計オブジェクト。
 *   - total: 全タスク数。
 *   - done: 完了済みタスク数。
 *   - focus: 現在実行中（[/]）の Task 配列。
 *   - active: 未完了（[ ] または [/]）の Task 配列。
 *   - history: 完了済み（[x]）の Task 配列。
 *   - percent: 進捗率（0-100 の整数）。
 */
export function calculateSummary(tasks) {
  const summary = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'x').length,
    focus: tasks.filter(t => t.status === '/'),
    active: tasks.filter(t => t.status !== 'x'),
    history: tasks.filter(t => t.status === 'x')
  };
  summary.percent = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  return summary;
}

/**
 * 計算されたサマリー統計を元に、ダッシュボード表示用の文字列（カラーコード含む）を生成します。
 * 
 * @param {Object} summary - calculateSummary で計算されたサマリーオブジェクト。
 * @param {string} summary.title - ダッシュボードのタイトル。
 * @returns {string} 標準出力に表示可能なフォーマット済み文字列。
 */
export function formatDashboard(summary) {
  let output = `\n--- TODO: ${summary.title} ---\n`;
  output += `${getProgressBar(summary.done, summary.total)} ${summary.percent}% (${summary.done}/${summary.total} Tasks)\n\n`;

  if (summary.focus.length > 0) {
    const focusItems = summary.focus.map(t => {
      const parentText = t.parent ? `[ ${t.parent.text} ] > ` : '';
      return `${parentText}${COLORS.YELLOW}${COLORS.BOLD}${t.text}${COLORS.RESET}`;
    });
    output += `Focus: ${focusItems.join(', ')}\n\n`;
  }

  output += `${COLORS.CYAN}Active Tasks:${COLORS.RESET}\n`;
  summary.active.forEach(t => {
    let line = t.format();
    if (t.status === '/') {
      line = line.replace(/\[\/\]/, `[${COLORS.YELLOW}${COLORS.BOLD}/${COLORS.RESET}]`);
    }
    output += `${line}\n`;
  });

  if (summary.history.length > 0) {
    output += `\n--- Completed Tasks ---\n`;
    summary.history.forEach(t => {
      output += `${COLORS.GREEN}[x] ${t.text}${COLORS.RESET}\n`;
    });
  }

  return output;
}

/**
 * todo.mjs CLI のメインエントリーポイントです。
 * コマンド（init, add, start, done, show）をパースし、対応する関数を呼び出します。
 * 
 * @param {string[]} [argv=process.argv] - 実行時の引数配列。
 * @param {string} [cwd=process.cwd()] - 基準となるカレントディレクトリ。
 */
export function main(argv = process.argv, cwd = process.cwd()) {
  const command = argv[2];
  const args = argv.slice(3);

  if (!command) {
    process.stdout.write("Usage: todo.mjs [init|add|start|done|show] [args]");
    process.exit(1);
  }

  switch (command) {
    case 'init':
      init(args[0], cwd);
      break;
    case 'add':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.mjs add <task>");
        process.exit(1);
      }
      const isChild = args.includes('--child');
      const text = args.filter(a => a !== '--child').join(' ');
      add(text, isChild, cwd);
      break;
    case 'start':
      if (args.length < 1) {
        process.stdout.write("Usage: todo.mjs start <pattern>");
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
      process.stdout.write("Usage: todo.mjs [init|add|start|done|show] [args]");
      process.exit(1);
  }
}

import { resolve } from 'node:path';
if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
