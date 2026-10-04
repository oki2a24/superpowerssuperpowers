// 条件ベース待機ユーティリティの完全な実装
// 出典: Lace テスト基盤の改善 (2025-10-03)
// 背景: 任意のタイムアウトを置き換え、不安定なテスト15件を修正

import type { ThreadManager } from '~/threads/thread-manager';
import type { LaceEvent, LaceEventType } from '~/threads/types';

/**
 * スレッドに特定の種類のイベントが現れるまで待つ。
 *
 * @param threadManager - 問い合わせるスレッドマネージャー
 * @param threadId - イベントを確認するスレッド
 * @param eventType - 待機するイベントの種類
 * @param timeoutMs - 最大待機時間（既定値: 5000ms）
 * @returns 最初に一致したイベントで解決する Promise
 *
 * 使用例:
 *   await waitForEvent(threadManager, agentThreadId, 'TOOL_RESULT');
 */
export function waitForEvent(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find((e) => e.type === eventType);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${eventType} event after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * 指定した種類のイベントが必要な件数に達するまで待つ。
 * @param count - 待機するイベント数
 * @param timeoutMs - 最大待機時間（既定値: 5000ms）
 * @returns 指定数に達したとき一致する全イベントで解決する Promise
 *
 * 使用例:
 *   // 初回応答と継続応答の2件を待つ
 *   await waitForEventCount(threadManager, agentThreadId, 'AGENT_MESSAGE', 2);
 */
export function waitForEventCount(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  count: number,
  timeoutMs = 5000
): Promise<LaceEvent[]> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const matchingEvents = events.filter((e) => e.type === eventType);

      if (matchingEvents.length >= count) {
        resolve(matchingEvents);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(
          new Error(
            `Timeout waiting for ${count} ${eventType} events after ${timeoutMs}ms (got ${matchingEvents.length})`
          )
        );
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * 独自の条件に一致するイベントを待つ。
 * イベントの種類だけでなく、イベントデータも確認したい場合に使う。
 *
 * @param threadManager - 問い合わせるスレッドマネージャー
 * @param threadId - イベントを確認するスレッド
 * @param predicate - イベントが条件に一致するとき true を返す関数
 * @param description - エラーメッセージ用の説明
 * @param timeoutMs - 最大待機時間（既定値: 5000ms）
 * @returns 最初に一致したイベントで解決する Promise
 *
 * 使用例:
 *   // 特定IDを持つ TOOL_RESULT を待つ
 *   await waitForEventMatch(
 *     threadManager,
 *     agentThreadId,
 *     (e) => e.type === 'TOOL_RESULT' && e.data.id === 'call_123',
 *     'id=call_123 の TOOL_RESULT'
 *   );
 */
export function waitForEventMatch(
  threadManager: ThreadManager,
  threadId: string,
  predicate: (event: LaceEvent) => boolean,
  description: string,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find(predicate);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

// 実際のデバッグでの使用例:
//
// 不安定な方法:
// const messagePromise = agent.sendMessage('Execute tools');
// await new Promise(r => setTimeout(r, 300)); // 300msでツールが始まることを期待
// agent.abort();
// await messagePromise;
// await new Promise(r => setTimeout(r, 50)); // 50msで結果が届くことを期待
// expect(toolResults.length).toBe(2); // ランダムに失敗
//
// 条件を待つ方法:
// const messagePromise = agent.sendMessage('Execute tools');
// await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 2); // ツール開始を待つ
// agent.abort();
// await messagePromise;
// await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 2); // 結果を待つ
// expect(toolResults.length).toBe(2); // 安定して成功
//
// 結果: 成功率60%から100%、実行時間40%短縮
