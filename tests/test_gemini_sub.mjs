import { test, describe } from 'node:test';
import assert from 'node:assert';
// まだ存在しない、または関数がエクスポートされていないため失敗することを期待
import { parseYamlFrontmatter } from '../scripts/gemini_sub.mjs';

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
});
