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
 * @param {Object} data パース済みデータ
 * @param {string[]} requiredKeys 必須キーのリスト
 * @param {string[]} [pendingKeys=[]] PENDING であるべきキーのリスト
 * @returns {Object} バリデーション済みのデータ
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
 * YYYYMMDD-HHMMSS-XXXX 形式のタスク ID を生成します。
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
 * ~/.gemini/sub-sessions/ 下から task_id ディレクトリを探し出します。
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
 * 初期プロンプトを含む起動ペイロード（シェルコマンド）を生成します。
 */
export function createPayload(workDir, taskId) {
  const prompt = `GPAC Protocol: Your mission is defined. Please execute 'node scripts/gemini_sub.mjs show-task ${taskId}' to understand your mission.`;
  // プロンプト内のクォートをエスケープ
  const safePrompt = prompt.replace(/"/g, '"');
  return `cd ${workDir} && gemini "${safePrompt}"`;
}

/**
 * ローカルの下書きを検証・置換し、グローバル領域へ配置する共通ロジック。
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
 * ワークスペース内の下書きファイルを読み込み、検証した上でグローバル領域へ配置（Handoff）します。
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
 * ワークスペース内の報告書下書きを検証し、グローバル領域へ配置（Handoff）します。
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

/**
 * 指定されたランチャーモードでセッションを起動します。
 */
export function launchSession(sessionId, taskPath, workDir, launcherMode = 'manual') {
  const payload = createPayload(workDir, sessionId);

  if (launcherMode === 'manual') {
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
 * グローバル領域にあるサブセッションを一覧表示します。
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
 * 指定されたタスクのファイル（task.md または report.md）を表示します。
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
 * 指定されたタスクの報告書を読み込み、要約を表示します。
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
 * テンプレートから新しいタスク下書きまたは報告書下書きを生成します。
 * 指定されたパスにファイルが既に存在する場合はエラーをスローします。
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
  console.log(`Created new ${type} draft: ${targetPath}`);
  return targetPath;
}

/**
 * メインエントリーポイント
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

function removeQuotes(val) {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1).trim();
  }
  return val;
}
