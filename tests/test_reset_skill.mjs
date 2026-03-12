import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resetSkillFile } from '../scripts/reset_skill.mjs';

test('resetSkillFile should remove the local adaptation section', async (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill.md');
  const content = `
# Sample Skill
## Instructions
Do something.

## ローカル・アダプテーション (Gemini固有)
Extra info.
`;
  // 日本語のセクションを含むサンプルコンテンツを作成
  fs.writeFileSync(tempFile, content.trim() + '\n');

  try {
    const result = resetSkillFile(tempFile);
    assert.strictEqual(result, true, 'セクションが削除された場合は true を返すべきです');
    
    const updatedContent = fs.readFileSync(tempFile, 'utf8');
    const expected = `# Sample Skill\n## Instructions\nDo something.\n`;
    assert.strictEqual(updatedContent, expected, 'コンテンツが正しくリセットされるべきです');
  } finally {
    // テスト後に一時ファイルを削除
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
});
