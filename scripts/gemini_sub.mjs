import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';

/**
 * Markdown の Frontmatter を抽出し、パースを行います。
 * 
 * 【実装の背景と苦労した点】
 * 標準ライブラリのみで動作させるため、YAML パーサーを自作しました。実装中、以下の「型判定の曖昧さ」が
 * 大きな課題となりました：
 * 
 * 1. 曖昧な空値:
 *    'key:' や 'key: ""' という行が現れた際、それが「空の文字列」を意図しているのか、
 *    それとも「次の行からリストが始まる」のかを、その行単体では判定できません。
 * 
 * 2. 試行錯誤の末の解決策（遅延リスト変換）:
 *    - 最初にキーが現れた際は、一旦空文字列 "" として保持します。
 *    - 次の行が '- ' で始まるリストアイテムだった場合のみ、動的にリスト型 [] へ変換します。
 *    - これにより、'mission: ""'（空でエラーにしたい文字列）と、
 *      'steps:'（次にリストが続く正常な記述）を正確に区別できるようになりました。
 * 
 * 【パース制限】
 * - インデントは無視されます（フラットな構造のみサポート）。
 * - 値の中にコロン ':' を含む場合は、必ずクォート（"..."）で囲んでください。
 * 
 * @param {string} content - パース対象の Markdown コンテンツ（または Frontmatter 文字列）。
 * @returns {Object} パースされたキーと値のペアを含むオブジェクト。
 */
export function parseYamlFrontmatter(content) {
  const parts = content.split('---');
  // NOTE: 引数が Frontmatter のみの文字列（--- を含まない）である場合も考慮できるよう、
  // 柔軟にパース対象を決定します。
  const yamlText = parts.length >= 3 ? parts[1].trim() : content.trim();

  const data = {};
  let currentKey = null;

  for (const line of yamlText.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // リスト要素の処理
    if (trimmedLine.startsWith('- ')) {
      if (currentKey) {
        // 【重要】遅延変換: 最初のリストアイテムが現れた時点で、キーの型をリストに確定させる。
        // これにより、'mission: ""'（文字列）と 'steps:'（リスト）のパース時の曖昧さを排除している。
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = [];
        }
        const val = trimmedLine.slice(2).trim();
        data[currentKey].push(removeQuotes(val));
      } else {
        throw new Error(`YAML syntax error: Unexpected list item '${trimmedLine}'`);
      }
      continue;
    }

    // キー: 値 の処理
    if (!trimmedLine.includes(':')) {
      throw new Error(`YAML syntax error: Invalid line '${trimmedLine}'`);
    }

    const colonIndex = trimmedLine.indexOf(':');
    const key = trimmedLine.slice(0, colonIndex).trim();
    let val = trimmedLine.slice(colonIndex + 1).trim();

    // Flow Sequence ([...]) の処理
    if (val.startsWith('[') && val.endsWith(']')) {
      // 1. 剥離: [ と ] を除去
      const inner = val.slice(1, -1);
      // 2. 分割: カンマで分割し、3. 洗浄 (trim & removeQuotes & trim) & 4. 抽出 (空文字除外)
      data[key] = inner.split(',')
        .map(item => {
          const trimmed = item.trim();
          const unquoted = removeQuotes(trimmed);
          return unquoted.trim();
        })
        .filter(item => item !== '');
    } else {
      // 通常の値の処理 (クォートの除去)
      val = removeQuotes(val);

      // 値の中に裸のコロンが含まれているかチェック (クォート除去後)
      if (val.includes(':')) {
        throw new Error(`YAML syntax error: Invalid value '${val}' (Try quoting it)`);
      }

      if (!val) {
        // 空の値。現時点では文字列かリストか不明。
        // 次の行がリストアイテムならリストになる。
        data[key] = '';
      } else if (val === '[]') {
        data[key] = [];
      } else {
        data[key] = val;
      }
    }
    currentKey = key;
  }

  return data;
}

/**
 * Frontmatter の正しい記述例を含むヘルプテキストを生成します。
 * 
 * @returns {string} ヘルプテキスト文字列。
 */
function generateHelpText() {
  return `
【正しい Frontmatter の例】
---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: "your-feature-tag"
work_dir: "."
title: "Your Task Title"
mission: "Your mission description."
required_skills: ["using-superpowers", "brainstorming"]
steps:
  - "Step 1"
  - "Step 2"
---
`;
}

/**
 * パース済みの Frontmatter データに対してバリデーションを行います。
 * 
 * @param {Object} data - パース済みの Frontmatter データオブジェクト。
 * @param {string[]} requiredKeys - 存在が必須とされるキーのリスト。
 * @param {string[]} [pendingKeys=[]] - 値が "PENDING" であることが期待されるキーのリスト。
 * @returns {Object} バリデーションに成功したパース済みデータ（data 引数そのもの）。
 * @throws {Error} 必須キーの欠如、PENDING チェック失敗、または空値が許可されないキーに値がない場合にスローされます。
 */
export function validateFrontmatter(data, requiredKeys, pendingKeys = []) {
  for (const key of requiredKeys) {
    if (!(key in data)) {
      throw new Error(`Missing required key: ${key}
${generateHelpText()}`);
    }

    const val = data[key];

    // PENDING チェック
    if (pendingKeys.includes(key) && val !== 'PENDING') {
      throw new Error(`Key '${key}' must be 'PENDING'`);
    }

    // 空値チェック (リスト/文字列両対応)
    // 試行錯誤の結果：steps は「1つ以上の手順」が必須だが、
    // commits や next_actions は「作業内容によっては空」もあり得るため、空リスト [] を許容する。
    if (key === 'steps') {
      if (!Array.isArray(val) || val.length === 0) {
        throw new Error("Key 'steps' must be a non-empty list");
      }
    } else if (key === 'required_skills') {
        // required_skills は空リストを許容する
        if (!Array.isArray(val)) {
            throw new Error("Key 'required_skills' must be a list");
        }
    } else if (!val && !Array.isArray(val)) {
      // 空文字列 "" はエラーだが、空リスト [] は受理
      throw new Error(`Empty value for key: ${key}`);
    }
  }

  return data;
}

/**
 * ユニークなタスク ID を生成します。
 * 形式: YYYYMMDD-HHMMSS-XXXX (XXXX は 4 文字のランダムな英数字)
 * 
 * @returns {string} 生成されたタスク ID。
 */
export function generateTaskId() {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '-' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `${timestamp}-${suffix}`;
}

/**
 * グローバルなセッション保存先から、指定されたタスク ID に対応するディレクトリを検索します。
 * 
 * @param {string} taskId - 検索対象のタスク ID。
 * @param {string|null} [homeDir=null] - 基準となるホームディレクトリのパス。null の場合は os.homedir() が使用されます。
 * @returns {string|null} タスクディレクトリの絶対パス。見つからない場合は null。
 */
export function findTaskDirectory(taskId, homeDir = null) {
  const baseHome = homeDir || os.homedir();
  const baseDir = path.join(baseHome, '.gemini', 'sub-sessions');

  if (!fs.existsSync(baseDir)) {
    return null;
  }

  // 全てのプロジェクトディレクトリを走査して task_id を探す
  try {
    const projects = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const proj of projects) {
      if (proj.isDirectory()) {
        const taskDir = path.join(baseDir, proj.name, taskId);
        if (fs.existsSync(taskDir) && fs.statSync(taskDir).isDirectory()) {
          return taskDir;
        }
      }
    }
  } catch (e) {
    // 権限エラーなどは無視して次へ
  }
  return null;
}

/**
 * 新しいセッションを起動するためのシェルコマンド（ペイロード）を生成します。
 * 
 * @param {string} workDir - セッション起動時のワーキングディレクトリ。
 * @param {string} taskId - 起動対象のタスク ID。
 * @returns {string} 実行されるシェルコマンド。
 */
export function createPayload(workDir, taskId) {
  const prompt = `GPACプロトコル：任務を定義しました。任務内容を確認するために 'node scripts/gemini_sub.mjs show-task ${taskId}' を実行してください。

【サブセッションの重要制約】
1. あなたは一時的なサブセッションです。任務完了後は速やかに 'report' を行うよう人間に促し、親セッションへの帰還（import）を誘導してください。
2. 作業が長引く場合は、定期的に「この作業はサブセッションで行っている」ことを人間にリマインドし、没入を防いでください。`;
  // プロンプト内のクォートをエスケープ
  const safePrompt = prompt.replace(/"/g, '"');
  return `cd ${workDir} && gemini "${safePrompt}"`;
}

/**
 * ローカルの下書きドキュメントを検証し、PENDING 値を置換してグローバル領域へ転送（Handoff）します。
 * 
 * @param {string} localDraftPath - ワークスペース内にある下書きファイルのパス。
 * @param {string} targetPath - 転送先となるグローバル領域のパス。
 * @param {string[]} requiredKeys - Frontmatter で必須とされるキーのリスト。
 * @param {Object} pendingMap - PENDING 値を実値に置換するためのマップ。
 * @returns {string} 転送後のファイルの絶対パス。
 * @throws {Error} 下書きが見つからない、またはバリデーションに失敗した場合にスローされます。
 */
export function handoffDocument(localDraftPath, targetPath, requiredKeys, pendingMap) {
  if (!fs.existsSync(localDraftPath)) {
    throw new Error(`Draft file not found: ${localDraftPath}`);
  }

  const content = fs.readFileSync(localDraftPath, 'utf8');

  // 1. バリデーション
  const data = parseYamlFrontmatter(content);
  validateFrontmatter(data, requiredKeys, Object.keys(pendingMap));

  // 2. コンテンツの置換 (PENDING -> 実値)
  let updatedContent = content;
  for (const [key, value] of Object.entries(pendingMap)) {
    updatedContent = updatedContent.replace(`${key}: PENDING`, `${key}: ${value}`);
  }

  // 3. グローバル領域への配置とローカル削除
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, updatedContent);
  fs.unlinkSync(localDraftPath);

  return targetPath;
}

/**
 * 新しいサブセッションを「生成 (spawn)」します。
 * ローカルのタスク下書きをグローバル領域へ転送し、新しいタスク ID を割り当てます。
 * 
 * @param {string} localDraftPath - ワークスペース内のタスク下書き (task_draft.md) のパス。
 * @param {Object} [options={}] - オプション引数。
 * @param {string|null} [options.projectName=null] - プロジェクト名。デフォルトはカレントディレクトリ名。
 * @param {string|null} [options.homeDir=null] - ホームディレクトリのパス。
 * @returns {string} 転送後のタスクファイルのパス。
 */
export function spawn(localDraftPath, options = {}) {
  const { projectName = null, homeDir = null } = options;

  // コンテキスト情報の収集
  let currentBranch = 'unknown';
  try {
    const gitResult = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' });
    if (gitResult.status === 0) {
      currentBranch = gitResult.stdout.trim();
    }
  } catch (e) {
    // git が使えない場合は unknown のまま
  }

  const parentProjectRoot = process.cwd();
  const taskId = generateTaskId();
  const resolvedProjectName = projectName || path.basename(parentProjectRoot);
  const baseHome = homeDir || os.homedir();

  const targetPath = path.join(baseHome, '.gemini', 'sub-sessions', resolvedProjectName, taskId, 'task.md');

  // 必須項目と置換マップ
  const required = ["task_id", "parent_project_root", "parent_branch", "parent_task_tag", "work_dir", "mission", "required_skills", "steps"];
  const pendingMap = {
    "task_id": taskId,
    "parent_project_root": parentProjectRoot,
    "parent_branch": currentBranch
  };

  return handoffDocument(localDraftPath, targetPath, required, pendingMap);
}

/**
 * 完了したサブセッションの報告書を「提出 (report)」します。
 * ワークスペース内の報告書下書きを検証し、対象タスクのディレクトリへ転送します。
 * 
 * @param {string} localDraftPath - ワークスペース内の報告書下書き (report_draft.md) のパス。
 * @param {string} taskId - 報告対象のタスク ID。
 * @param {Object} [options={}] - オプション引数。
 * @param {string|null} [options.homeDir=null] - ホームディレクトリのパス。
 * @returns {string} 転送後の報告書ファイルのパス。
 * @throws {Error} タスクディレクトリが見つからない、または既に成功（success）として報告済みのタスクへの再提出が試みられた場合にスローされます。
 */
export function report(localDraftPath, taskId, options = {}) {
  const { homeDir = null } = options;
  const taskDir = findTaskDirectory(taskId, homeDir);
  if (!taskDir) {
    throw new Error(`Task directory for ${taskId} not found.`);
  }

  const targetPath = path.join(taskDir, 'report.md');

  // 1. 上書き防止チェック
  if (fs.existsSync(targetPath)) {
    const existingContent = fs.readFileSync(targetPath, 'utf8');
    if (existingContent.includes('status: success')) {
      throw new Error(`Task ${taskId} is already reported as success. (Handoff blocked)`);
    }
  }

  // 2. Handoff 実行
  const required = ["task_id", "status", "summary", "commits", "next_actions"];
  const pendingMap = { "task_id": taskId };

  return handoffDocument(localDraftPath, targetPath, required, pendingMap);
}

export function getReturnReminderAA() {
  const cyan = '\x1b[36m';
  const yellow = '\x1b[33m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  return `
${cyan}  ┌──────────────────────────────────────────┐${reset}
${cyan}  │${reset}  サブセッションへ 行ってらっしゃい！     ${cyan}│${reset}
${cyan}  │${reset}  終わったら${yellow}${bold}【親セッション】${reset}へ戻るのを    ${cyan}│${reset}
${cyan}  │${reset}  忘れないでね！待ってるよ！              ${cyan}│${reset}
${cyan}  └─┬───────────────────────────────────────┘${reset}
${cyan}    │${reset}
${cyan}    │${reset}   (\\__/)
${cyan}    │${reset}   ( •ω•)  ＜ ${cyan}迷子にならないでね！${reset}
${cyan}    │${reset}   /    \\
`;
}

/**
 * 指定されたランチャーモード（manual/tmux）を使用して、サブセッションを起動します。
 * 
 * @param {string} sessionId - 起動するタスク ID（セッション ID）。
 * @param {string} taskPath - グローバル領域にあるタスクファイルのパス。
 * @param {string} workDir - セッション起動時のワーキングディレクトリ。
 * @param {string} [launcherMode='manual'] - 起動モード。'manual'（手動コピー）または 'tmux'（新規 tmux ウィンドウ）。
 */
export function launchSession(sessionId, taskPath, workDir, launcherMode = 'manual') {
  const payload = createPayload(workDir, sessionId);

  if (launcherMode === 'manual') {
    console.log(getReturnReminderAA());
    console.log('\n[GPAC Launcher: Manual Mode]');
    console.log('新しいタブを開き、以下のコマンドをコピー＆ペーストして実行してください：\n');
    console.log(`  ${payload}\n`);
    console.log(`作業完了後の統合コマンド:\n  node scripts/gemini_sub.mjs import ${sessionId}\n`);
  } else if (launcherMode === 'tmux') {
    try {
      // tmux new-window -n sub-ID "bash -c 'payload; exec bash'"
      const tmuxCmd = ['new-window', '-n', `sub-${sessionId}`, `bash -c '${payload}; exec bash'`];
      const result = spawnSync('tmux', tmuxCmd);
      if (result.status === 0) {
        console.log(`Launched in new tmux window: sub-${sessionId}`);
        console.log(`作業完了後の統合コマンド:\n  node scripts/gemini_sub.mjs import ${sessionId}\n`);
      } else {
        throw new Error('tmux failed');
      }
    } catch (e) {
      console.log('Error: tmux is not available. Falling back to manual mode.');
      launchSession(sessionId, taskPath, workDir, 'manual');
    }
  } else {
    launchSession(sessionId, taskPath, workDir, 'manual');
  }
}

/**
 * グローバル領域に保存されているすべてのサブセッション（タスク）を一覧表示します。
 * プロジェクト名、タスク ID、およびタスクのタグ（parent_task_tag）を表示します。
 * 
 * @param {string|null} [homeDir=null] - ホームディレクトリのパス。
 */
export function listSessions(homeDir = null) {
  const baseHome = homeDir || os.homedir();
  const baseDir = path.join(baseHome, '.gemini', 'sub-sessions');

  if (!fs.existsSync(baseDir)) {
    console.log('No sub-sessions found.');
    return;
  }

  console.log('\n[GPAC SUB-SESSIONS LIST]');
  console.log('-'.repeat(60));
  console.log(`${'PROJECT'.padEnd(15)} ${'TASK_ID'.padEnd(25)} ${'TAG'}`);
  console.log('-'.repeat(60));

  let found = false;
  try {
    const projects = fs.readdirSync(baseDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const proj of projects) {
      if (!proj.isDirectory()) continue;

      const projDir = path.join(baseDir, proj.name);
      const tasks = fs.readdirSync(projDir, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name));
      for (const task of tasks) {
        if (!task.isDirectory()) continue;

        const taskFile = path.join(projDir, task.name, 'task.md');
        if (!fs.existsSync(taskFile)) continue;

        // 簡易パースでタグを抽出
        const content = fs.readFileSync(taskFile, 'utf8');
        let tag = 'unknown';
        for (const line of content.split('\n')) {
          if (line.startsWith('parent_task_tag:')) {
            tag = line.split(':')[1].trim().replace(/['"]/g, '');
            break;
          }
        }

        console.log(`${proj.name.padEnd(15)} ${task.name.padEnd(25)} ${tag}`);
        found = true;
      }
    }
  } catch (e) {
    // 権限エラーなどは無視
  }

  if (!found) {
    console.log('(No sessions found)');
  }
  console.log('-'.repeat(60) + '\n');
}

/**
 * 指定されたタスク ID に関連する特定のファイル（例: task.md, report.md）の内容を表示します。
 * 
 * @param {string} taskId - 情報を表示するタスク ID。
 * @param {string} filename - 表示対象のファイル名。
 * @param {string|null} [homeDir=null] - ホームディレクトリのパス。
 * @throws {Error} タスクディレクトリまたはファイルが見つからない場合にスローされます。
 */
export function showFile(taskId, filename, homeDir = null) {
  const taskDir = findTaskDirectory(taskId, homeDir);
  if (!taskDir) {
    throw new Error(`Task directory for ${taskId} not found.`);
  }

  const filePath = path.join(taskDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filename} not found for task ${taskId}.`);
  }

  console.log(fs.readFileSync(filePath, 'utf8'));
}

/**
 * 指定されたタスクの報告書（report.md）を読み込み、ステータス、要約、次のアクションなどの情報を表示します。
 * インポート（情報の取り込み）プロセスのための要約確認に使用されます。
 * 
 * @param {string} taskId - インポート対象のタスク ID。
 * @param {Object} [options={}] - オプション引数。
 * @param {string|null} [options.projectName=null] - プロジェクト名。
 * @param {string|null} [options.homeDir=null] - ホームディレクトリのパス。
 */
export function handleImport(taskId, options = {}) {
  const { projectName = null, homeDir = null } = options;
  let reportFile = null;

  const taskDir = findTaskDirectory(taskId, homeDir);
  if (taskDir) {
    reportFile = path.join(taskDir, 'report.md');
  } else if (projectName && homeDir) {
    // プロジェクト名がある場合は旧パスも探す（後方互換性）
    reportFile = path.join(homeDir, '.gemini', 'sub-sessions', projectName, taskId, 'report.md');
  } else {
    reportFile = path.join(process.cwd(), 'report.md');
  }

  if (!fs.existsSync(reportFile)) {
    console.log(`Error: Report file not found for task ${taskId}`);
    return;
  }

  const content = fs.readFileSync(reportFile, 'utf8');
  const data = parseYamlFrontmatter(content);

  console.log(`
[GPAC IMPORT REPORT: ${taskId}]`);
  console.log('-'.repeat(40));
  console.log(`Status: ${data.status || 'unknown'}`);
  console.log(`Summary: ${data.summary || 'No summary provided.'}`);
  console.log('Next Actions:');
  renderList(data.next_actions);
  console.log('-'.repeat(40));
  console.log('Skill Proposals:');
  renderList(data.skill_proposals);
  console.log('Lessons Learned:');
  renderList(data.lessons_learned);
  console.log('-'.repeat(40));
  console.log(`Commits: ${JSON.stringify(data.commits || [])}`);
  console.log('-'.repeat(40) + '\n');
}

/**
 * リスト形式のデータを標準出力に整形して表示します。
 * 配列、単一文字列、または null/undefined を受け取り、適切にインデントして表示します。
 * 
 * @param {Array|string|null|undefined} list - 表示するリストデータ。
 */
function renderList(list) {
  if (Array.isArray(list)) {
    if (list.length === 0) {
      console.log('  (none)');
    } else {
      for (const item of list) {
        console.log(`  - ${item}`);
      }
    }
  } else if (list) {
    console.log(`  - ${list}`);
  } else {
    console.log('  (none)');
  }
}

/**
 * テンプレート（task_template.md または report_template.md）から新しい下書きファイルを生成します。
 * グローバルなテンプレートが存在しない場合は、内蔵のデフォルトコンテンツが使用されます。
 * 
 * @param {'task'|'report'} type - 生成するドキュメントの種類。
 * @param {string|null} [filename=null] - 生成される下書きファイルのパス。指定がない場合は defaultFilename が使用されます。
 * @param {string|null} [homeDir=null] - ホームディレクトリのパス。
 * @returns {string} 生成された下書きファイルの絶対パス。
 * @throws {Error} 生成先のパスに既にファイルが存在する場合にスローされます。
 */
export function createFromTemplate(type, filename = null, homeDir = null) {
  const baseHome = homeDir || os.homedir();
  const templateName = type === 'task' ? 'task_template.md' : 'report_template.md';
  const defaultFilename = type === 'task' ? 'task_draft.md' : 'report_draft.md';
  const targetPath = filename || defaultFilename;

  const templatePath = path.join(baseHome, '.gemini', 'sub-sessions', templateName);
  
  let content = '';
  if (fs.existsSync(templatePath)) {
    content = fs.readFileSync(templatePath, 'utf8');
  } else {
    // デフォルトテンプレート (YAML Frontmatter 形式)
    if (type === 'task') {
      content = `---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: "new-feature"
work_dir: "."
title: "New Task"
title_jp: "タスクの日本語タイトル"
intent: "このタスクの目的と意図を簡潔に記述してください。"
mission: "ここにミッション（達成すべき最終目標）を記述してください。"
required_skills: ["using-superpowers"]
steps:
  - "ステップ 1"
---
## [イメージ] (構造や状態遷移の図解)
\`\`\`text
(ここに AA や図解を記述)
\`\`\`

# Mission Details
Add details here.
`;
    } else {
      content = `---
task_id: PENDING
status: success
summary: "作業完了の要約を日本語で記述"
commits: ["feat: コミットメッセージ"]
next_actions: ["次のアクション"]
skill_proposals: []
lessons_learned: []
---
## [イメージ] (完了後の構造や状態遷移の図解)
\`\`\`text
(ここに AA や図解を記述)
\`\`\`

# 作業詳細
ここに詳細な作業内容を記述してください。
`;
    }
  }

  if (fs.existsSync(targetPath)) {
    throw new Error(`File ${targetPath} already exists. (Generation aborted)`);
  }

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetPath, content);
  const absolutePath = path.resolve(targetPath);
  console.log(`\x1b[32mCreated new ${type} draft:\x1b[0m \x1b[1m${absolutePath}\x1b[0m`);
  return targetPath;
}

/**
 * gemini_sub CLI のメインエントリーポイントです。
 * コマンドライン引数をパースし、対応する関数（spawn, report, list 等）を呼び出します。
 */
export function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const launcher = process.env.GEMINI_SUB_LAUNCHER || 'manual';
  const defaultProject = path.basename(process.cwd());

  try {
    if (command === 'spawn') {
      const { values, positionals } = parseArgs({
        args: args.slice(1),
        options: {
          project: { type: 'string', short: 'p' }
        },
        allowPositionals: true
      });
      const draft = positionals[0];
      const project = values.project || defaultProject;
      if (!draft) throw new Error('Usage: spawn <draft_file> [-p project]');
      
      const tpath = spawn(draft, { projectName: project });
      const tid = path.basename(path.dirname(tpath));
      launchSession(tid, tpath, process.cwd(), launcher);
    } else if (command === 'report') {
      const { values, positionals } = parseArgs({
        args: args.slice(1),
        options: {
          id: { type: 'string' }
        },
        allowPositionals: true
      });
      const draft = positionals[0];
      const taskId = values.id;
      if (!draft || !taskId) throw new Error('Usage: report <draft_file> --id <task_id>');
      
      const rpath = report(draft, taskId);
      console.log(`Report submitted successfully: ${rpath}`);
    } else if (command === 'list') {
      listSessions();
    } else if (command === 'show-task') {
      const { positionals } = parseArgs({ args: args.slice(1), allowPositionals: true });
      const taskId = positionals[0];
      if (!taskId) throw new Error('Usage: show-task <task_id>');
      showFile(taskId, 'task.md');
    } else if (command === 'show-report') {
      const { positionals } = parseArgs({ args: args.slice(1), allowPositionals: true });
      const taskId = positionals[0];
      if (!taskId) throw new Error('Usage: show-report <task_id>');
      showFile(taskId, 'report.md');
    } else if (command === 'import') {
      const { values, positionals } = parseArgs({
        args: args.slice(1),
        options: {
          project: { type: 'string', short: 'p' }
        },
        allowPositionals: true
      });
      const taskId = positionals[0];
      const project = values.project;
      if (!taskId) throw new Error('Usage: import <task_id> [-p project]');
      handleImport(taskId, { projectName: project });
    } else if (command === 'new-task') {
      const { positionals } = parseArgs({ args: args.slice(1), allowPositionals: true });
      createFromTemplate('task', positionals[0]);
    } else if (command === 'new-report') {
      const { positionals } = parseArgs({ args: args.slice(1), allowPositionals: true });
      createFromTemplate('report', positionals[0]);
    } else {
      console.log('Gemini Peer-Agent Coordination (GPAC) Controller');
      console.log('\nCommands:');
      console.log('  spawn <draft> [-p project]   Spawn a new sub-session');
      console.log('  report <draft> --id <id>     Submit a report');
      console.log('  list                         List all sub-sessions');
      console.log('  show-task <id>               Show mission (task.md)');
      console.log('  show-report <id>             Show report (report.md)');
      console.log('  import <id> [-p project]     Import results');
      console.log('  new-task [filename]          Create new task draft from template');
      console.log('  new-report [filename]        Create new report draft from template');
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

// 直接実行された場合
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}

/**
 * 文字列の前後にあるダブルクォート (") またはシングルクォート (') を除去し、トリミングします。
 * 
 * @param {string} val - 処理対象の文字列。
 * @returns {string} クォートが除去された文字列。
 */
function removeQuotes(val) {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1).trim();
  }
  return val;
}
