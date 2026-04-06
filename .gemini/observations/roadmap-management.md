# 知見： roadmap-management (todo.mjs 運用規律)

## 概要
プロジェクトの進捗管理に使用する `scripts/todo.mjs` の正確な仕様と、AI が陥りやすい「知識の劣化」を防ぐためのガードレール。

## 知見 (Observations)

### 1. 正確なコマンド体系 (CLI Syntax)
AI は以下のコマンドを、ソースコードを確認することなく正確に実行せよ。
- **初期化**: `node scripts/todo.mjs init <タイトル>`
- **追加 (Root)**: `node scripts/todo.mjs add "<内容>"`
- **追加 (Child)**: `node scripts/todo.mjs add "<内容>" --child`
    - **注意**: `--parent <ID>` や `--child <ID>` という引数は**存在しない**。`--child` は「直前に追加した、または現在アクティブなタスクの子」として追加される。
- **開始**: `node scripts/todo.mjs start <ID|パターン>`
- **完了**: `node scripts/todo.mjs done`
    - **注意**: `done` は「現在のアクティブ（`/` ステータス）なタスク」を完了にする。`start` していないタスクを直接完了させることはできない。
- **表示**: `node scripts/todo.mjs show`
    - **注意**: `list` ではなく `show` を使用せよ。

### 2. 物理的な操作順序 (Execution Flow)
- **ID の確認**: アクションの前に必ず `show` を実行して最新の ID を物理的に確認せよ。
- **状態遷移の厳守**: タスクを完了させる際は、必ず `start <ID>` -> `done` の順序を守れ。
- **Auto-suspend の活用**: 別のタスクを `start` すると、前のタスクは自動的に中断 (` `) に戻る仕様を理解せよ。

### 3. AI への警告 (Red Flags)
- ツールを叩いてエラーが出た際、安易に「引数を推測」してリトライしてはならない。即座に `node scripts/todo.mjs --help` を叩くか、本知見を参照せよ。
- 階層構造（親子関係）を作る際は、`add` の直後に `--child` を付与する規律を徹底せよ。
