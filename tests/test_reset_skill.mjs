import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resetSkillFile } from '../scripts/reset_skill.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '../scripts/reset_skill.mjs');

test('## ローカル・アダプテーション (Gemini固有) セクションとそれ以降が削除されることをテストする。', (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill_basic.md');
  const content = `
# Sample Skill
## Instructions
Do something.

## ローカル・アダプテーション (Gemini固有)
Extra info.
`;
  fs.writeFileSync(tempFile, content.trim() + '\n');
  t.after(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); });

  const result = resetSkillFile(tempFile);
  assert.strictEqual(result, true, 'セクションが削除された場合は true を返すべきです');
  
  const updatedContent = fs.readFileSync(tempFile, 'utf8');
  const expected = `# Sample Skill\n## Instructions\nDo something.\n`;
  assert.strictEqual(updatedContent, expected, 'コンテンツが正しくリセットされるべきです');
});

test('アダプテーションセクションが存在しない場合にファイルが変更されないことをテストする。', (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill_no_section.md');
  const content = `
# Original Skill Content
This is a skill without an adaptation section.
`;
  fs.writeFileSync(tempFile, content.trim() + '\n');
  t.after(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); });

  const result = resetSkillFile(tempFile);
  assert.strictEqual(result, false, 'セクションが見つからない場合は false を返すべきです');
  
  const updatedContent = fs.readFileSync(tempFile, 'utf8');
  assert.strictEqual(updatedContent, content.trim() + '\n', 'ファイルの内容が変更されるべきではありません');
});

test('空のファイルをエラーなく処理できることをテストする。', (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill_empty.md');
  fs.writeFileSync(tempFile, '');
  t.after(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); });

  const result = resetSkillFile(tempFile);
  assert.strictEqual(result, false, '空のファイルの場合は false を返すべきです');
  
  const updatedContent = fs.readFileSync(tempFile, 'utf8');
  assert.strictEqual(updatedContent, '', '空のファイルの内容は空のままであるべきです');
});

test('ファイルが存在しない場合に false を返すこと。', () => {
  const nonExistentFile = path.join(process.cwd(), 'tests/non_existent_skill.md');
  const result = resetSkillFile(nonExistentFile);
  assert.strictEqual(result, false, 'ファイルが存在しない場合は false を返すべきです');
});

test('ヘッダーの前に複数の空行がある場合に、適切に 1 つの改行に集約されること。', (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill_extra_newlines.md');
  const content = `# Header
Content


## ローカル・アダプテーション (Gemini固有)
Extra info.
`;
  fs.writeFileSync(tempFile, content);
  t.after(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); });

  const result = resetSkillFile(tempFile);
  assert.strictEqual(result, true, 'セクションが削除された場合は true を返すべきです');
  
  const updatedContent = fs.readFileSync(tempFile, 'utf8');
  const expected = `# Header\nContent\n`;
  assert.strictEqual(updatedContent, expected, '複数の改行が1つに集約されるべきです');
});

test('CLI: 引数なしで実行された場合に終了コード 1 と使用法を表示することをテストする。', () => {
  const result = spawnSync('node', [SCRIPT_PATH], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1, '引数なしの場合は終了コード 1 を返すべきです');
  assert.match(result.stdout + result.stderr, /使用法:/, '標準出力または標準エラーに使用法が表示されるべきです');
});

test('CLI: 有効なファイルパス（ターゲットセクションあり）で実行した場合、終了コード 0 でリセットされることをテストする。', (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_cli_success.md');
  const content = `# Title\nContent\n\n## ローカル・アダプテーション (Gemini固有)\nAdapting...\n`;
  fs.writeFileSync(tempFile, content);
  t.after(() => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); });

  const result = spawnSync('node', [SCRIPT_PATH, tempFile], { encoding: 'utf8' });
  
  assert.strictEqual(result.status, 0, '正常終了時は終了コード 0 を返すべきです');
  assert.match(result.stdout, /リセット成功:/, '成功メッセージが表示されるべきです');
  
  const updatedContent = fs.readFileSync(tempFile, 'utf8');
  assert.strictEqual(updatedContent, `# Title\nContent\n`, 'ファイルが正しくリセットされているべきです');
});

test('CLI: 存在しないファイルパスで実行した場合、終了コード 1 とエラーメッセージを表示することをテストする。', () => {
  const nonExistentFile = path.join(process.cwd(), 'tests/non_existent_cli.md');
  const result = spawnSync('node', [SCRIPT_PATH, nonExistentFile], { encoding: 'utf8' });
  
  assert.strictEqual(result.status, 1, 'エラー時は終了コード 1 を返すべきです');
  assert.match(result.stderr, /リセット失敗/, 'エラーメッセージが表示されるべきです');
});
