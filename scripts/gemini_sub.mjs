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

    // クォートの除去
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
    currentKey = key;
  }

  return data;
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
      throw new Error(`Missing required key: ${key}`);
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
export function createPayload(workDir, taskPath) {
  const prompt = `GPAC Protocol: Your mission is defined in a file outside the workspace. Please execute 'cat ${taskPath}' to understand your mission.`;
  // プロンプト内のクォートをエスケープ
  const safePrompt = prompt.replace(/"/g, '\\"');
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
  const required = ["task_id", "parent_project_root", "parent_branch", "parent_task_tag", "work_dir", "mission", "steps"];
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

function removeQuotes(val) {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1).trim();
  }
  return val;
}
