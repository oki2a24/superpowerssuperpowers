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
  findTaskDirectory
} from '../scripts/gemini_sub.mjs';

describe('YAML Parser', () => {
  test('should parse simple key-value pairs', () => {
    /**
     * 正常な Frontmatter の基本パースをテストします。
     * - キー: 値 のペアが正しくオブジェクトに変換されること。
     * - クォートの除去が正しく行われること。
     */
    const yamlText = 'title: "Hello World"\nmission: "Test Mission"';
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

describe('Frontmatter Validation', () => {
  const required = ["task_id", "mission", "steps"];

  test('should throw error for missing required key', () => {
    /** 必須キーの欠落。ミッション作成時の必須要件を確認。 */
    const content = '---\nmission: "Existing"\n---';
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), {
      message: 'Missing required key: task_id'
    });
  });

  test('should throw error for empty value', () => {
    /**
     * 空値の拒否。
     * - エージェントが項目を埋め忘れることを防ぐための重要なチェック。
     */
    const content = '---\ntask_id: "ID-1"\nmission: ""\nsteps:\n  - step1\n---';
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
    const content = '---\ntask_id: "ID-1"\nmission: "M"\nsteps: "not a list"\n---';
    const data = parseYamlFrontmatter(content);
    assert.throws(() => validateFrontmatter(data, required), {
      message: "Key 'steps' must be a non-empty list"
    });
  });
});

describe('Helper Functions', () => {
  test('generateTaskId should return correct format', () => {
    /** Task ID の形式検証 (YYYYMMDD-HHMMSS-XXXX) */
    const taskId = generateTaskId();
    assert.match(taskId, /^\d{8}-\d{6}-[A-Z0-9]{4}$/);
  });

  test('createPayload should return correct shell command', () => {
    /** 起動ペイロードの形式検証 */
    const workDir = '/path/to/workdir';
    const taskPath = '/path/to/task.md';
    const payload = createPayload(workDir, taskPath);
    const expected = `cd ${workDir} && gemini "GPAC Protocol: Your mission is defined in a file outside the workspace. Please execute 'cat ${taskPath}' to understand your mission."`;
    assert.strictEqual(payload, expected);
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
