import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getReturnReminderAA } from '../scripts/gemini_sub.mjs';

describe('GPAC 帰還リマインダー AA', () => {
  test('getReturnReminderAA はカラーコードと重要キーワードを含むこと', () => {
    /**
     * AA 生成ロジックが以下の要素を含むか検証します。
     * - シアンの枠線コード (\x1b[36m)
     * - イエローの強調コード (\x1b[33m)
     * - 帰還先としての「親セッション」という言葉
     * - ウサギの AA パーツ (\__/)
     */
    const aa = getReturnReminderAA();
    
    // カラーコードの検証
    assert.ok(aa.includes('\x1b[36m'), 'シアンのカラーコードが含まれていること');
    assert.ok(aa.includes('\x1b[33m'), 'イエローのカラーコードが含まれていること');
    
    // キーワードの検証
    assert.ok(aa.includes('【親セッション】'), '「【親セッション】」が含まれていること');
    assert.ok(aa.includes('行ってらっしゃい'), '「行ってらっしゃい」が含まれていること');
    
    // AA パーツの検証
    assert.ok(aa.includes('(\\__/)') || aa.includes('(\\\\__/)'), 'ウサギの耳が含まれていること');
  });
});
