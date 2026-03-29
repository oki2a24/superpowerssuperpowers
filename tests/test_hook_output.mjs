import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('hooks/session-start.mjs - 正常系: 正しいJSON構造とスキル内容を出力すること', () => {
  try {
    // フックを実行し、出力をパースする
    const output = execSync('node hooks/session-start.mjs').toString();
    const json = JSON.parse(output);
    
    // 期待される構造とコンテンツが含まれているか検証
    assert.strictEqual(json.hookSpecificOutput.hookEventName, "SessionStart");
    assert.ok(json.hookSpecificOutput.additionalContext.includes('<EXTREMELY_IMPORTANT>'));
  } catch (e) {
    if (e.code === 'ENOENT' || e.message.includes('Cannot find module')) {
      throw new Error('実装ファイル hooks/session-start.mjs が見つかりません');
    }
    throw e;
  }
});
