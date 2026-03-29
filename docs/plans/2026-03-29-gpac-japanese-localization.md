# GPACプロトコルの日本語化 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `scripts/gemini_sub.mjs` が生成するミッション開始メッセージを日本語に統一し、開発者（AI）が任務を直感的に理解できるようにする。

**アーキテクチャ:** `createPayload` 関数内のメッセージ文字列を変更し、それに対応するユニットテストを更新する TDD アプローチを採用。

**技術スタック:** Node.js (v20+), Node.js built-in test runner (node --test)

---

### タスク 1: テストコードの更新（RED）

**ファイル:**
- 変更: `tests/test_gemini_sub.mjs`

**ステップ 1: 失敗するテストを作成（期待値を日本語に変更）**

`tests/test_gemini_sub.mjs` の 222 行目付近を以下のように変更します。

```javascript
// 変更前
const expected = `cd ${workDir} && gemini "GPAC Protocol: Your mission is defined. Please execute 'node scripts/gemini_sub.mjs show-task ${taskId}' to understand your mission."`;

// 変更後
const expected = `cd ${workDir} && gemini "GPACプロトコル：任務を定義しました。任務内容を確認するために 'node scripts/gemini_sub.mjs show-task ${taskId}' を実行してください。"`;
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node tests/test_gemini_sub.mjs`
期待値: `createPayloadは抽象化されたコマンドを生成すること` のテストが AssertionError で失敗することを確認。

**ステップ 3: コミット**

```bash
git add tests/test_gemini_sub.mjs
git commit -m "test: GPACプロトコルの日本語メッセージを期待するようにテストを更新"
```

---

### タスク 2: 実装の更新（GREEN）

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`

**ステップ 1: メッセージを日本語に変更**

`scripts/gemini_sub.mjs` の `createPayload` 関数（240行目付近）を以下のように変更します。

```javascript
// 変更前
const prompt = `GPAC Protocol: Your mission is defined. Please execute 'node scripts/gemini_sub.mjs show-task ${taskId}' to understand your mission.`;

// 変更後
const prompt = `GPACプロトコル：任務を定義しました。任務内容を確認するために 'node scripts/gemini_sub.mjs show-task ${taskId}' を実行してください。`;
```

**ステップ 2: テストがパスすることを確認するために実行**

実行: `node tests/test_gemini_sub.mjs`
期待値: すべてのテストが PASS すること。

**ステップ 3: コミット**

```bash
git add scripts/gemini_sub.mjs
git commit -m "feat: GPACプロトコルのメッセージを日本語化"
```

---

### タスク 3: 最終確認

**ステップ 1: 他の関連テストの実行**

実行: `npm test` (またはプロジェクトで定義されている全テスト実行コマンド)
期待値: 全テストが PASS すること。

**ステップ 2: finish_check の実行**

実行: `node scripts/finish_check.mjs`
期待値: 不整合がないこと。
