# Node.js 移行 Phase 2 (品質強化) 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`subagent-driven-development`スキルを使用してください。

**目標:** Node.js 版スクリプト（todo.mjs, gemini_sub.mjs）の信頼性、安全性、およびユーザー体験を向上させる。

**アーキテクチャ:** 
環境変数による I/O の完全隔離を導入し、テスト時の副作用を排除する。ESM 固有の実行判定を標準化し、エラーハンドリングを強化することで、AI エージェントと人間の両方にとって使いやすい抽象化インターフェースを提供する。

**技術スタック:** Node.js v25.8.0 (ESM), `node:test`, `node:fs`, `node:path`, `node:url`

---

### タスク 1: todo.mjs の環境変数化とテストの隔離 (TDD)

**ファイル:**
- 変更: `scripts/todo.mjs`
- 変更: `tests/test_todo.mjs`

**ステップ 1: 失敗するテストを作成**

`tests/test_todo.mjs` に、環境変数 `GEMINI_TASK_DIR` を使用して、指定した一時ディレクトリに TODO ファイルが作成されることを検証するテストを追加します。

```javascript
test('should use environment variable GEMINI_TASK_DIR for task directory', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-todo-test-'));
  process.env.GEMINI_TASK_DIR = tmpDir;
  try {
    init('Test Env Var');
    const branchName = getBranchName();
    const expectedPath = path.join(tmpDir, `TODO-${branchName}.md`);
    assert.ok(fs.existsSync(expectedPath), `File should exist at ${expectedPath}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.GEMINI_TASK_DIR;
  }
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_todo.mjs`
期待値: FAIL (デフォルトの `.gemini/tasks` に作成されるため)

**ステップ 3: 最小限の実装を作成**

`scripts/todo.mjs` の `TASK_DIR` を関数化し、環境変数を参照するように修正します。

```javascript
export function getTaskDir() {
  return process.env.GEMINI_TASK_DIR || ".gemini/tasks";
}
// getTodoPath 等で TASK_DIR の代わりに getTaskDir() を使用する
```

**ステップ 4: テストがパスすることを確認するために実行**

実行: `node --test tests/test_todo.mjs`
期待値: PASS

**ステップ 5: コミット**

```bash
git add scripts/todo.mjs tests/test_todo.mjs
git commit -m "feat: todo.mjs に環境変数 GEMINI_TASK_DIR による隔離を導入する (TDD)"
```

---

### タスク 2: ESM 直接実行判定の標準化

**ファイル:**
- 変更: `scripts/todo.mjs`
- 変更: `scripts/gemini_sub.mjs`
- 変更: `scripts/reset_skill.mjs`

**ステップ 1: 修正前の動作確認**

現状、シンボリックリンク経由などの起動で判定が不安定になる可能性があることをコードレビューで確認します。

**ステップ 2: 標準的な判定ロジックの実装**

各スクリプトの末尾にある `if` 文を以下に統一します。

```javascript
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
```

**ステップ 3: 全テストの実行**

実行: `node --test tests/test_*.mjs`
期待値: PASS (既存の挙動を壊していないこと)

**ステップ 4: コミット**

```bash
git add scripts/*.mjs
git commit -m "refactor: ESM 直接実行判定ロジックを path.resolve を用いて標準化する"
```

---

### タスク 3: gemini_sub.mjs のエラーハンドリングとバリデーション強化

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`
- 変更: `tests/test_gemini_sub.mjs`

**ステップ 1: 失敗するテストを作成 (ヘルプ表示)**

バリデーションエラー（キー欠落）時に、期待される Frontmatter のテンプレートが表示されることを検証します。

**ステップ 2: 最小限の実装を作成**

`main` 関数の `try...catch` でエラーを捕捉し、エラーメッセージと共に「正しい形式」を表示するように修正します。

**ステップ 3: コミット**

```bash
git add scripts/gemini_sub.mjs tests/test_gemini_sub.mjs
git commit -m "feat: gemini_sub にバリデーションエラー時のヘルプ表示を追加する"
```

---

### タスク 4: task.md の構造拡張 (required_skills) とプロンプトの抽象化

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`

**ステップ 1: required_skills のバリデーション追加**

`spawn` 時の必須キーに `required_skills` を追加します（空リストを許容）。

**ステップ 2: launchSession プロンプトの修正**

`cat <path>` の代わりに `node scripts/gemini_sub.mjs show-task <id>` を実行するよう、生成されるプロンプトメッセージを修正します。

**ステップ 3: テストの更新と実行**

実行: `node --test tests/test_gemini_sub.mjs`

**ステップ 4: コミット**

```bash
git add scripts/gemini_sub.mjs
git commit -m "feat: required_skills キーの追加とプロンプトの抽象化 (show-task 推奨)"
```

---

### タスク 5: todo.mjs の CLI 仕様再定義

**ステップ 1: 仕様の検討**

現在の `init <title>` を、引数なしでも動作（ブランチ名からタイトルを推測）するように改善するか検討します。

**ステップ 2: 実装とテスト**

検討した仕様に基づき、`todo.mjs` とそのテストを修正します。

**ステップ 3: コミット**

```bash
git add scripts/todo.mjs tests/test_todo.mjs
git commit -m "feat: todo.mjs の CLI 仕様を AI と人間にとって最適化する"
```
