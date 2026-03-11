# Node.js 移行設計 (2026-03-11)

## 1. 概要
Gemini CLI の補助スクリプト（Python）を Node.js v25.8.0 へ移行する。目的は、Node.js 環境への依存一本化と、標準ライブラリのみによるポータビリティの向上である。

## 2. アーキテクチャと設計方針

### 2.1. YAML パーサの移植
- **方針**: `scripts/gemini_sub.py` に実装されている自作 YAML パーサ（行ベースのステートマシン）を JavaScript (Node.js) へ忠実に移植する。
- **コメントの継承**: オリジナルの Python 実装に含まれる「試行錯誤の背景（型判定の曖昧さ、遅延リスト変換のロジック）」に関するコメントを、意図を損なうことなく Node.js 版へも記述する。
- **構造制限**: 現状通り「フラットな構造（1段階のキー・バリュー）」のみをサポートする。
- **配置**: 各スクリプトの独立性を維持するため、現時点では共通ライブラリ化せず、各スクリプト内に直接実装する。

### 2.2. 技術スタック
- **Runtime**: Node.js v25.8.0 (ESM 形式)
- **Standard Modules**:
    - `node:fs`, `node:path`: ファイル操作
    - `node:child_process`: Git コマンド等の実行
    - `node:util`: `util.parseArgs` による引数解析
    - `node:test`, `node:assert`: テストフレームワーク

### 2.3. エラーハンドリングとメッセージ
- Python 版の `ValueError` 等を JavaScript の `Error` にマッピングする。
- エラーメッセージ（例: `YAML syntax error: Invalid line...`）は Python 版と 1:1 で一致させ、既存のテスト要件を充足させる。

## 3. テスト戦略

### 3.1. 1:1 移植
- Python の各テストファイル（`tests/*.py`）に対し、1:1 で対応する Node.js テストファイル（`tests/*.mjs`）を作成する。
- `unittest.TestCase` の構造を `node:test` の `describe`/`it` 形式にマッピングする。

### 3.2. 検証フロー
1.  **Unit Test**: YAML パーサのパースロジック、バリデーション、エラーメッセージの整合性を検証。
2.  **Integration Test**: CLI 引数の処理、標準入出力、ファイルシステム操作（`task.md` の更新、Git ブランチ操作等）が Python 版と同一であることを検証。

## 4. 移行対象リスト
- `scripts/gemini_sub.py` -> `scripts/gemini_sub.mjs`
- `scripts/todo.py` -> `scripts/todo.mjs`
- `scripts/reset_skill.py` -> `scripts/reset_skill.mjs`
- `tests/test_*.py` -> `tests/test_*.mjs`
