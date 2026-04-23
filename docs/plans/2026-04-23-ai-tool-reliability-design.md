# デザイン：AI-Safe Task Management (todo.mjs v2)

## 1. 背景と目的
AIエージェント（Gemini CLI等）が `scripts/todo.mjs` を操作する際、コマンド引数の誤解、状態（ID）の動的変化による取り違え、および出力結果のパースミスが頻発していた。
本デザインは、ツール自体の「機械可読性」と「堅牢性」を高め、AI専用の「操作プロトコル」を定義することで、タスク管理の信頼性を 100% に近づけることを目的とする。

## 2. ツール側の機能拡張 (Mechanisms)

### 2.1. 機械可読な出力 (`show --json`)
- **仕様**: `node scripts/todo.mjs show --json` を実行した際、現在のタスク一覧を標準出力（stdout）に JSON 形式で返す。
- **データ構造**:
  ```json
  {
    "title": "Project Title",
    "percent": 45,
    "tasks": [
      { "id": 1, "text": "Task A", "status": "x", "indent": 0, "parentId": null },
      { "id": 2, "text": "Subtask B", "status": "/", "indent": 2, "parentId": 1 }
    ]
  }
  ```
- **目的**: AIが正規表現（regex）でダッシュボードをパースする不安定さを排除し、確実に ID とステータスを特定できるようにする。

### 2.2. 堅牢な引数パース (Robust Parsing)
- **仕様**: フラグ（`--child`, `--json`）と位置引数（タスク名、ID）の順序に依存しないパースロジックを実装する。
- **改善点**:
    - `add "Task" --child` と `add --child "Task"` を同一に扱う。
    - クォートなしで複数の単語を渡しても、一つのテキストとして結合する。
- **目的**: AIがコマンドを組み立てる際の「推測」によるミスを物理的に防ぐ。

### 2.3. エラー出力の厳格化 (`stderr`)
- **仕様**: 
    - すべてのエラーメッセージ（タスク未検出、引数不足等）を `process.stderr.write` に出力する。
    - 正常な結果（JSONやダッシュボード）のみを `process.stdout.write` に出力する。
- **目的**: AIが「成功した実行の出力」と「エラーメッセージ」を混同するリスクを排除する。

## 3. 操作プロトコル：IDR (Inspect-Do-Readback)

AIエージェントは、`todo.mjs` を操作する際、以下の3ステップを「アトミックな1つの儀式」として遵守しなければならない。

1. **Inspect (現状確認)**: 
   - `node scripts/todo.mjs show --json` を実行し、最新の物理的な状態を JSON で取得する。
   - コンテキスト（過去の履歴）に記録された ID は「古い可能性が高い」と見なし、常に最新の ID を特定する。
2. **Do (正確な実行)**:
   - 特定した ID を使い、`node scripts/todo.mjs <cmd> <ID>` を実行する。
   - 文字列マッチング（パターン）ではなく、数値 ID による指定を最優先する。
3. **Readback (状態検証)**:
   - 実行直後に `node scripts/todo.mjs show --json` を再度実行し、期待される状態（例：status が `/` や `x` に変化したか）を検証する。
   - 期待通りでない場合は、即座にエラーと見なし、原因を調査（Phase 1 へ戻る）する。

## 4. テストと検証 (Definition of Done)

### 4.1. 自動テスト
- `tests/test_todo_ai_friendly.mjs` を作成し、以下の項目を検証する。
    - `show --json` が正しい構造の JSON を返すこと。
    - フラグの順序が異なっても `add` が正しく動作すること。
    - エラーが `stderr` に出力され、終了コード 1 を返すこと。

### 4.2. 実証テスト (Dogfooding)
- 本セッションの残りのタスク管理において、実際に拡張された `todo.mjs` と IDR プロトコルを使用し、一度もエラーを起こさずにセッションを完遂できるかを証明する。

## 5. 移行計画
1. `scripts/todo.mjs` を修正し、機能を実装する。
2. `tests/test_todo_ai_friendly.mjs` で動作を確認する。
3. `observations/todo-mjs.md` (新設) または `GEMINI.md` に IDR プロトコルを規律として記録する。
4. `scripts/TODO_GUIDE.md` を更新し、新機能と規律を反映する。
