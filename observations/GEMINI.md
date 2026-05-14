# 知見：GEMINI.md (Extension Shared)

## タスク管理規律：ネイティブ・ファースト & サイレント・フォールバック

トークン効率の最大化と、システムの安定性を両立するため、タスク管理は以下の階層構造で行う。

1. **Native-First (Session Management)**:
    - 実行中のタスク追跡は、Gemini CLI のビルトイン機能（`write_todos` または `tracker_*` ツール）を最優先で使用する。
    - **理由**: ファイルI/OとID確認のオーバーヘッドを削減し、トークン消費を最小限に抑えるため。
    - **UI**: 進捗の視覚的確認が必要な場合は Plan Mode (`/plan`) を活用する。

2. **Silent Fallback (Persistence)**:
    - `scripts/todo.mjs` は、セッションを跨ぐ永続化が必要な場合や、ビルトイン機能が正常に動作しない場合の「救助艇（フォールバック）」としてのみ使用する。
    - **同期タイミング**: 
        - セッション終了時のリスペクティブ (`session-retrospective`) またはハンドオフ (`session-handoff`) 時。
        - ユーザーからの明示的な保存指示があった時。

3. **操作プロトコル**:
    - **Native**: ツール呼び出しを通じて動的にタスクを更新する。
    - **Fallback (IDR)**: `todo.mjs` を操作する際は、必ず `show --json` で最新状態を確認してから操作する（IDRプロトコル）。

