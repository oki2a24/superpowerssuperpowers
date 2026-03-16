import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
// まだ存在しない、または関数がエクスポートされていないため失敗することを期待
import { 
  parseYamlFrontmatter, 
  validateFrontmatter,
  generateTaskId,
  createPayload,
  findTaskDirectory,
  spawn,
  report,
  listSessions,
  showFile,
  handleImport,
  createFromTemplate
} from '../scripts/gemini_sub.mjs';

describe('YAML Parser', () => {
  test('should parse simple key-value pairs', () => {
    /**
     * 正常な Frontmatter の基本パースをテストします。
     * - キー: 値 のペアが正しくオブジェクトに変換されること。
     * - クォートの除去が正しく行われること。
     */
    const yamlText = `title: "Hello World"
mission: "Test Mission"`;
    const result = parseYamlFrontmatter(yamlText);
    assert.deepStrictEqual(result, { title: 'Hello World', mission: 'Test Mission' });
  });

  test('should throw error for invalid yaml syntax', () => {
    /**
     * YAML 構文エラーの検知をテストします。
     * - 裸のコロンが2つ以上ある場合、簡易パーサーではクォートを要求するように設計。
     */
    const content = 'invalid: : yaml';
    assert.throws(() => parseYamlFrontmatter(content), {
      message: "YAML syntax error: Invalid value ': yaml' (Try quoting it)"
    });
  });
});

describe('Frontmatterバリデーション', () => {
  const required = ["task_id", "mission", "steps"];

  test('必須キー欠落時にエラーがスローされること', () => {
    /** 必須キーの欠落。ミッション作成時の必須要件を確認。 */
    const content = `---
mission: "Existing"
---`;
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), {
      message: /Missing required key: task_id/
    });
  });

  test('必須キー欠落時にヘルプテキストが含まれること', () => {
    /** 必須キーの欠落時にヘルプテキストも合わせて表示されることを確認 */
    const content = `---
mission: "Existing"
---`;
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), (err) => {
      assert.match(err.message, /Missing required key: task_id/);
      assert.match(err.message, /【正しい Frontmatter の例】/);
      return true;
    });
  });

  test('空値でエラーがスローされること', () => {
    /**
     * 空値の拒否。
     * - エージェントが項目を埋め忘れることを防ぐための重要なチェック。
     */
    const content = `---
task_id: "ID-1"
mission: ""
steps:
  - step1
---`;
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), {
      message: 'Empty value for key: mission'
    });
  });

  test('should throw error for non-empty list for steps', () => {
    /**
     * リスト形式の検証。
     * - 'steps' は必ず 1 つ以上の要素を持つリストでなければならない。
     */
    const content = `---
task_id: "ID-1"
mission: "M"
steps: "not a list"
---`;
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), {
      message: "Key 'steps' must be a non-empty list"
    });
  });
});

describe('Spawn Handoff', () => {
  test('handoffSuccess should create file in global and delete local', () => {
    /**
     * 正常な Handoff 方式の spawn 検証
     * - 下書きファイルの読み取りと検証
     * - PENDING の実値置換
     * - グローバル配置とローカル削除
     */
    const tempHome = path.join(os.tmpdir(), `gemini-spawn-test-${Date.now()}`);
    const draftPath = path.join(os.tmpdir(), `tmp_task_draft_${Date.now()}.md`);
    const projectName = 'handoff-project';

    try {
      // 1. 下書きの準備
      const draftContent = `---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: test-handoff
work_dir: /abs/path
mission: "Implement Handoff"
required_skills: []
steps:
  - Step A
  - Step B
---
# Draft Content`;
      fs.writeFileSync(draftPath, draftContent);

      // 2. spawn の呼び出し
      const resultPath = spawn(draftPath, { projectName, homeDir: tempHome });

      // 3. 検証: ローカル下書きが削除されていること (Handoff の完了)
      assert.strictEqual(fs.existsSync(draftPath), false);

      // 4. 検証: グローバル領域に配置されていること (SSOT への登録)
      assert.strictEqual(fs.existsSync(resultPath), true);
      assert.ok(resultPath.includes(projectName));

      // 5. 検証: 内容が置換されていること (コンテキストの注入)
      const content = fs.readFileSync(resultPath, 'utf8');
      assert.ok(!content.includes('task_id: PENDING'));
      assert.ok(!content.includes('parent_project_root: PENDING'));
      assert.ok(!content.includes('parent_branch: PENDING'));
      assert.ok(content.includes('parent_task_tag: test-handoff'));
    } finally {
      if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath);
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test('required_skills キーが含まれている場合に spawn が成功すること', () => {
    /** required_skills が必須項目であることを前提とした検証 */
    const tempHome = path.join(os.tmpdir(), `gemini-spawn-test-${Date.now()}`);
    const draftPath = path.join(os.tmpdir(), `tmp_task_draft_${Date.now()}.md`);
    const projectName = 'handoff-project-with-skills';

    try {
      const draftContent = `---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: test-handoff
work_dir: /abs/path
mission: "Implement Handoff"
required_skills:
  - test-skill
steps:
  - Step A
---`;
      fs.writeFileSync(draftPath, draftContent);

      assert.doesNotThrow(() => spawn(draftPath, { projectName, homeDir: tempHome }));
    } finally {
      if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath);
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

describe('Helper Functions', () => {
  test('generateTaskId should return correct format', () => {
    /** Task ID の形式検証 (YYYYMMDD-HHMMSS-XXXX) */
    const taskId = generateTaskId();
    assert.match(taskId, /^\d{8}-\d{6}-[A-Z0-9]{4}$/);
  });

  test('createPayloadは抽象化されたコマンドを生成すること (show-task 推奨)', () => {
    /** 起動ペイロードが cat <path> ではなく show-task <id> を推奨する形式になっているか検証 */
    const workDir = '/path/to/workdir';
    const taskId = '20260314-TEST-ABCD';
    const payload = createPayload(workDir, taskId);
    const expected = `cd ${workDir} && gemini "GPAC Protocol: Your mission is defined. Please execute 'node scripts/gemini_sub.mjs show-task ${taskId}' to understand your mission."`;
    assert.strictEqual(payload, expected);
  });

  test('createPayload should return correct shell command', () => {
    /** 起動ペイロードの形式検証 (後方互換性のための古いテストも維持) */
    const workDir = '/path/to/workdir';
    const taskId = '20260314-TEST-ABCD';
    const payload = createPayload(workDir, taskId);
    assert.ok(payload.includes('node scripts/gemini_sub.mjs show-task'));
  });

  test('findTaskDirectory should find existing task directory', () => {
    /** 指定した ID のディレクトリを見つけられるか検証 */
    const tempHome = path.join(os.tmpdir(), `gemini-test-${Date.now()}`);
    const taskId = '20260311-TEST-XXXX';
    const projName = 'test-proj';
    const taskDir = path.join(tempHome, '.gemini', 'sub-sessions', projName, taskId);
    
    try {
      fs.mkdirSync(taskDir, { recursive: true });
      const found = findTaskDirectory(taskId, tempHome);
      assert.strictEqual(found, taskDir);
    } finally {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

describe('Report Handoff', () => {
  test('reportSuccess should create report and delete local draft', () => {
    const tempHome = path.join(os.tmpdir(), `gemini-report-test-${Date.now()}`);
    const draftPath = path.join(os.tmpdir(), `tmp_report_draft_${Date.now()}.md`);
    const taskId = "20260311-REPORT-WXYZ";
    const projectName = "report-proj";

    try {
      // 1. 下書き準備
      const draftContent = `---
status: success
task_id: PENDING
commits:
  - "feat: my change"
summary: "Finished"
next_actions: []
---`;
      fs.writeFileSync(draftPath, draftContent);

      // 2. ダミーのタスクディレクトリ準備
      const taskDir = path.join(tempHome, '.gemini', 'sub-sessions', projectName, taskId);
      fs.mkdirSync(taskDir, { recursive: true });

      // 3. report 呼び出し
      const resultPath = report(draftPath, taskId, { homeDir: tempHome });

      // 4. 検証: ローカル削除 e グローバル配置
      assert.strictEqual(fs.existsSync(draftPath), false);
      assert.strictEqual(fs.existsSync(resultPath), true);
      assert.ok(resultPath.endsWith('report.md'));

      // 5. 検証: ID 置換
      const content = fs.readFileSync(resultPath, 'utf8');
      assert.ok(content.includes(`task_id: ${taskId}`));
      assert.ok(!content.includes('task_id: PENDING'));
    } finally {
      if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath);
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test('reportOverwriteProtection should block update if status is success', () => {
    const tempHome = path.join(os.tmpdir(), `gemini-overwrite-test-${Date.now()}`);
    const draftPath = path.join(os.tmpdir(), `tmp_report_overwrite_${Date.now()}.md`);
    const taskId = "20260311-Completed-Task";
    const projectName = "overwrite-proj";

    try {
      const taskDir = path.join(tempHome, '.gemini', 'sub-sessions', projectName, taskId);
      fs.mkdirSync(taskDir, { recursive: true });

      // 1. すでに success の報告書を置いておく
      const existingReport = path.join(taskDir, "report.md");
      fs.writeFileSync(existingReport, `-----
status: success
---`);

      // 2. 新しい報告を出そうとする
      const draftContent = `---
status: failure
task_id: PENDING
summary: 'retry'
commits: []
next_actions: []
---`;
      fs.writeFileSync(draftPath, draftContent);

      // 3. 呼び出し。Error（メッセージ: already reported as success）を期待
      assert.throws(() => report(draftPath, taskId, { homeDir: tempHome }), {
        message: /already reported as success/
      });
    } finally {
      if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath);
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

describe('リストと表示コマンド', () => {
  test('listSessionsはセッション情報を出力すること', () => {
    const tempHome = path.join(os.tmpdir(), `gemini-list-test-${Date.now()}`);
    try {
      const projName = 'list-proj';
      const taskId = '20260311-LIST-AAAA';
      const taskDir = path.join(tempHome, '.gemini', 'sub-sessions', projName, taskId);
      fs.mkdirSync(taskDir, { recursive: true });
      fs.writeFileSync(path.join(taskDir, 'task.md'), `---
parent_task_tag: test-tag
---`);

      let output = '';
      const originalLog = console.log;
      console.log = (msg) => { output += msg + '\n'; };
      
      listSessions(tempHome);
      
      console.log = originalLog;
      assert.ok(output.includes(projName));
      assert.ok(output.includes(taskId));
      assert.ok(output.includes('test-tag'));
    } finally {
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test('showFileはファイル内容を出力すること', () => {
    const tempHome = path.join(os.tmpdir(), `gemini-show-test-${Date.now()}`);
    try {
      const taskId = '20260311-SHOW-TASK';
      const taskDir = path.join(tempHome, '.gemini', 'sub-sessions', 'test-proj', taskId);
      fs.mkdirSync(taskDir, { recursive: true });
      const content = '# Task content';
      fs.writeFileSync(path.join(taskDir, 'task.md'), content);

      let output = '';
      const originalLog = console.log;
      console.log = (msg) => { output += msg + '\n'; };
      
      showFile(taskId, 'task.md', tempHome);
      
      console.log = originalLog;
      assert.strictEqual(output.trim(), content);
    } finally {
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

describe('レポートのインポート', () => {
  test('handleImportはレポート情報を整形して出力すること', () => {
    const tempHome = path.join(os.tmpdir(), `gemini-import-test-${Date.now()}`);
    try {
      const taskId = '20260311-IMPORT-WXYZ';
      const projName = 'test-proj';
      const reportDir = path.join(tempHome, '.gemini', 'sub-sessions', projName, taskId);
      fs.mkdirSync(reportDir, { recursive: true });
      const reportContent = `---
status: success
task_id: ${taskId}
summary: "Import Test"
commits:
  - "commit-1"
next_actions:
  - "action-1"
---`;
      fs.writeFileSync(path.join(reportDir, 'report.md'), reportContent);

      let output = '';
      const originalLog = console.log;
      console.log = (msg) => { output += msg + '\n'; };
      
      handleImport(taskId, { projectName: projName, homeDir: tempHome });
      
      console.log = originalLog;
      assert.ok(output.includes(`[GPAC IMPORT REPORT: ${taskId}]`));
      assert.ok(output.includes('Status: success'));
      assert.ok(output.includes('Summary: Import Test'));
    } finally {
      if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });
});

describe('テンプレート生成機能', () => {
  test('createFromTemplate はデフォルトテンプレートからタスク下書きを作成すること', () => {
    /** デフォルトテンプレートからのタスク下書き生成をテストします。 */
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-sub-template-test-'));
    const draftPath = path.join(tempDir, 'task_draft.md');

    try {
      const resultPath = createFromTemplate('task', draftPath);
      assert.strictEqual(resultPath, draftPath);
      assert.strictEqual(fs.existsSync(draftPath), true);
      const content = fs.readFileSync(draftPath, 'utf8');
      assert.match(content, /task_id: PENDING/);
      assert.match(content, /parent_project_root: PENDING/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('ファイルが既に存在する場合、createFromTemplate はエラーをスローすること', () => {
    /** 同名ファイルが存在する場合の上書き防止をテストします。 */
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-sub-error-test-'));
    const draftPath = path.join(tempDir, 'report_draft.md');

    try {
      fs.writeFileSync(draftPath, 'existing');
      assert.throws(() => createFromTemplate('report', draftPath), {
        message: /already exists/
      });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
