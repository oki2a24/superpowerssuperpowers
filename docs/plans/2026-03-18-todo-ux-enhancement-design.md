# todo.mjs UX 向上 (進捗ダッシュボード) 設計書

> **ステータス**: 承認済み (2026-03-18)
> **目的**: `todo.mjs show` の出力をサマリー重視のダッシュボード形式に進化させ、作業の集中力と透明性を向上させる。

## 1. 概要 (Abstract)
現在の `todo.mjs show` は Markdown ファイルの全内容を出力するのみだが、これを「進捗プログレスバー」「実行中タスクの抽出（Focus）」「未完了タスク（Active）」「完了済みタスク（History）」の 4 セクションに動的に再構成して出力する。ファイルの物理構造は一切変更せず、Markdown としての整合性を維持する。

## 2. ユーザーインターフェース (UI/UX)
`todo.mjs show` 実行時の出力イメージ：

```text
--- TODO: Todo Ux Enhancement ---
[▓▓▓▓▓░░░░░] 50% (3/6 Tasks)

Focus: [ UI Enhancement ] > Add Progress Bar

Active Tasks:
- [/] UI Enhancement
  - [/] Add Progress Bar
  - [ ] Add ANSI Colors
- [ ] Implement History section

--- Completed Tasks ---
[x] Create Worktree
[x] Initial Research
```

## 3. コンポーネント設計 (Architecture)

### 3.1. 進捗計算ロジック
- 全タスク数 = `[ ]` + `[/]` + `[x]`
- 完了タスク数 = `[x]`
- 進捗率 = (完了数 / 全タスク数) * 100

### 3.2. セクション抽出 (Filtering)
- **Focus**: `status === '/'` のタスクを抽出。親タスクがある場合は `[ Parent ] > Child` の形式で連結。
- **Active**: `status === ' '` または `'/'` のタスクを、元のインデントを維持して表示。
- **History**: `status === 'x'` のタスクのみを抽出し、フラットなリストとして表示。

### 3.3. 視覚効果 (Visuals)
- **ANSI シーケンス**:
  - `[/]`: 黄色・太字
  - `[x]`: 緑色
  - プログレスバー: 背景色付きの空白文字、または Unicode 文字（▓）を使用。

## 4. データフロー (Data Flow)
1.  `parseTodoFile(todoPath)` で Task オブジェクトの配列を取得（既存機能）。
2.  `show()` 関数内で、取得した Task 配列を 3 つのリスト（Focus, Active, History）に振り分ける。
3.  ANSI シーケンスを付加して標準出力に書き出す。
4.  **重要**: ファイルへの保存（`serializeTodo`）ロジックは一切変更しない。

## 5. テスト戦略
- **単体テスト**:
  - `show` 関数が正しくセクションを分割し、文字列を生成することを確認（標準出力のモック）。
  - 進捗率の計算が 0%, 50%, 100% の各ケースで正確であることを確認。
- **結合テスト**:
  - CLI から `node scripts/todo.mjs show` を実行し、期待通りのレイアウトが出力されることを目視およびパターンマッチングで確認。
