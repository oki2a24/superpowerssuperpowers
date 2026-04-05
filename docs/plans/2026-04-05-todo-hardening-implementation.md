# todo.mjs 堅牢化 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** ID ベースの操作、Auto-suspend 機能、AI ガイドを導入し、`todo.mjs` の信頼性を向上させる。

**アーキテクチャ:**
1. `show` 時のインデックスを ID として利用し、`- [ ] (1) Task` 形式で表示。
2. `start <pattern>` で数値が渡された場合に ID 検索を優先。
3. `start` 時の既存タスクを自動停止する Auto-suspend ロジックの実装。
4. エラーメッセージへのヒント追加と `TODO_GUIDE.md` の作成。
5. `--help` の構造化による AI への操作指示の明確化。

**技術スタック:** Node.js, Markdown, TDD (via `node --test` or similar)

---

### タスク 1: AI ガイドの作成
- **Skill**: `roadmap-management`, `writing-skills`

**ステップ 1: AI 向けの最短リファレンスを作成**
- ファイル: `scripts/TODO_GUIDE.md`
- 期待値: AI が `todo.mjs` を使う際の「第一の規律」が言語化されている。

### タスク 2: --help の構造化 (Machine Readable)
- **Skill**: `test-driven-development`, `systematic-debugging`

**ステップ 1: 失敗するテストの作成**
- `tests/test_todo_hardening.mjs`: `--help` を実行した際、特定の AI 向け見出し（例: `### AI-Specific Rules`）が含まれていることを検証するテスト。

**ステップ 2: テストが失敗することを確認するために実行**
- `node tests/test_todo_hardening.mjs`
- 期待値: FAIL

**ステップ 3: 実装 (scripts/todo.mjs)**
- `--help` 表示ロジックを刷新。
- AI 向けに「必ず show で ID を確認せよ」等の制約を明示。

**ステップ 4: テストがパスすることを確認するために実行**
- `node tests/test_todo_hardening.mjs`
- 期待値: PASS

**ステップ 5: 回帰テストの実行**
- `node tests/test_todo_*.mjs` 全てを実行し、全件 PASS を確認。

### タスク 3: ID 表示の実装
- **Skill**: `test-driven-development`

**ステップ 1: 失敗するテストの作成**
- `tests/test_todo_hardening.mjs`: `show` の出力に `(1)` 等の ID が含まれていることを検証。

**ステップ 2: テストが失敗することを確認するために実行**
- 期待値: FAIL

**ステップ 3: 実装 (scripts/todo.mjs)**
- `Task` オブジェクトの `format()` および `show()` の修正。

**ステップ 4: テストがパスすることを確認するために実行**
- 期待値: PASS

**ステップ 5: 回帰テストの実行**
- `node tests/test_todo_*.mjs` 全てを実行し、全件 PASS を確認。

### タスク 4: ID 指定での start と Auto-suspend の実装
- **Skill**: `test-driven-development`, `systematic-debugging`

**ステップ 1: 失敗するテストの作成**
- `tests/test_todo_hardening.mjs`: `start 1` でタスクが開始されること、および別タスク開始時に前のタスクが `[ ]` に戻ることを検証。

**ステップ 2: テストが失敗することを確認するために実行**
- 期待値: FAIL

**ステップ 3: 実装 (scripts/todo.mjs)**
- `start` ロジックの刷新（ID 検索と Auto-suspend）。
- エラーメッセージのヒント追加（`Hint: Use ID from 'show' ...`）。

**ステップ 4: テストがパスすることを確認するために実行**
- 期待値: PASS

**ステップ 5: 回帰テストの実行**
- `node tests/test_todo_*.mjs` 全てを実行し、全件 PASS を確認。

### タスク 5: 最終検証
- **Skill**: `verification-before-completion`

**ステップ 1: プロジェクト全体の全テスト実行**
- `npm run test` または `find tests -name "*.mjs" -exec node {} \;`
- 期待値: プロジェクト内すべてのテストが 100% 合格すること。

**ステップ 2: コミット**
- `git add scripts/ tests/ docs/`
- `git commit -m "feat: enhance todo.mjs with ID-based operation, auto-suspend, and AI-friendly interface"`
