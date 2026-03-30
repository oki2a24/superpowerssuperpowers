# GPAC サブセッション帰還リマインダー 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** GPAC サブセッションからの帰還忘れを防止するため、視覚的（AA/カラー）および論理的（プロンプト注入）なリマインダーを実装する。

**アーキテクチャ:** 
1. `createPayload` に帰還義務のプロンプトを注入する。
2. `getReturnReminderAA()` 関数を新設し、カラー付き AA 文字列を生成する（テスト可能にする）。
3. `launchSession` で上記を統合して出力する。

**技術スタック:** Node.js, ANSI Color Codes, TDD (test-driven-development)

---

### タスク 1: 作業環境の準備

**使用スキル:** なし

**ステップ 1: ブランチの作成**
実行: `git checkout -b feat/gpac-return-reminder`

**ステップ 2: 空コミット**
実行: `git commit --allow-empty -m "feat: TDDによるGPAC帰還リマインダーの実装を開始する"`

---

### タスク 2: AI 向けプロンプト注入の実装 (TDD)

**使用スキル:** `test-driven-development`

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`
- テスト: `tests/test_gemini_sub.mjs`

**ステップ 1: 失敗するテストを作成 (RED)**
`tests/test_gemini_sub.mjs` に、`createPayload` の戻り値に「【サブセッションの重要制約】」が含まれていることを検証するテストを追加します。

**ステップ 2: テストの実行と失敗の確認**
実行: `node tests/test_gemini_sub.mjs`
期待値: 失敗

**ステップ 3: 最小限の実装 (GREEN)**
`scripts/gemini_sub.mjs` の `createPayload` を修正します。

```javascript
export function createPayload(workDir, taskId) {
  const prompt = `GPACプロトコル：任務を定義しました。任務内容を確認するために 'node scripts/gemini_sub.mjs show-task \${taskId}' を実行してください。

【サブセッションの重要制約】
1. あなたは一時的なサブセッションです。任務完了後は速やかに 'report' を行うよう人間に促し、親セッションへの帰還（import）を誘導してください。
2. 作業が長引く場合は、定期的に「この作業はサブセッションで行っている」ことを人間にリマインドし、没入を防いでください。`;
  const safePrompt = prompt.replace(/"/g, '"');
  return \`cd \${workDir} && gemini "\${safePrompt}"\`;
}
```

**ステップ 4: テストのパス確認**
実行: `node tests/test_gemini_sub.mjs`
期待値: PASS

**ステップ 5: コミット**
実行: `git commit -am "feat: サブセッションのペイロードに帰還リマインドのプロンプトを注入する"`

---

### タスク 3: 視覚的リマインダー (AA) の実装 (TDD)

**使用スキル:** `test-driven-development`

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`
- テスト: `tests/test_reminder_visuals.mjs` (新規作成)

**ステップ 1: 失敗するテストを作成 (RED)**
`tests/test_reminder_visuals.mjs` を作成し、`getReturnReminderAA()` が期待する文字列（シアンの枠線 `\x1b[36m` など）を返すことを検証します。

**ステップ 2: テストの実行と失敗の確認**
実行: `node tests/test_reminder_visuals.mjs`
期待値: 失敗（関数未定義）

**ステップ 3: AA 生成ロジックの実装 (GREEN)**
`scripts/gemini_sub.mjs` に `getReturnReminderAA()` を追加し、エクスポートします。

```javascript
export function getReturnReminderAA() {
  const cyan = '\x1b[36m';
  const yellow = '\x1b[33m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  return \`
\${cyan}  ┌──────────────────────────────────────────┐\${reset}
\${cyan}  │\${reset}  サブセッションへ 行ってらっしゃい！     \${cyan}│\${reset}
\${cyan}  │\${reset}  終わったら\${yellow}\${bold}【親セッション】\${reset}へ戻るのを    \${cyan}│\${reset}
\${cyan}  │\${reset}  忘れないでね！待ってるよ！              \${cyan}│\${reset}
\${cyan}  └─┬───────────────────────────────────────┘\${reset}
\${cyan}    │\${reset}
\${cyan}    │\${reset}   (\\\\__/)\${cyan}
\${cyan}    │\${reset}   ( •ω•)  ＜ \${cyan}迷子にならないでね！\${reset}
\${cyan}    │\${reset}   /    \\\\
\`;
}
```

**ステップ 4: テストのパス確認**
実行: `node tests/test_reminder_visuals.mjs`
期待値: PASS

**ステップ 5: `launchSession` への統合**
`launchSession` 内で `console.log(getReturnReminderAA())` を実行するように修正します。

**ステップ 6: コミット**
実行: `git commit -am "feat: TDDで検証されたロジックによる視覚的AAリマインダーを追加する"`

---

### タスク 4: 最終検証と完了プロトコル

**使用スキル:** `verification-before-completion`, `session-retrospective`

**ステップ 1: 物理的な表示確認**
実行: `node scripts/gemini_sub.mjs spawn task_draft.md` （ダミーファイルを使用）

**ステップ 2: 完了前チェック**
実行: `node scripts/finish_check.mjs`

**ステップ 3: セッション・レトロスペクティブ**
`activate_skill(name="session-retrospective")` を実行し、知見を記録。

**ステップ 4: 最終コミット**
実行: `git commit -m "docs: GPAC帰還リマインダーの実装記録を完了する"`
