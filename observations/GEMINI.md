# 知見：GEMINI.md (Extension Shared)

## ツール操作規律：IDR プロトコル
AIは、タスク管理ツール `todo.mjs` を操作する際、エラーを 0 にするために以下の3ステップを「アトミックな1つの儀式」として厳格に遵守しなければならない。

1. **Inspect (現状確認)**: 操作の直前に必ず `node scripts/todo.mjs show --json` を実行し、最新の物理的な ID とステータスを取得する。
2. **Do (正確な実行)**: 特定した ID（数値）を使い、`node scripts/todo.mjs <cmd> <ID>` を実行する。パターンマッチングは禁止。
3. **Read-back (状態検証)**: 実行直後に再び `show --json` を実行し、ステータスが期待通りに更新されたことを物理的に確認する。
