import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resetSkillFile } from '../scripts/reset_skill.mjs';

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
