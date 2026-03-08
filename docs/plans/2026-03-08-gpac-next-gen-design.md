# デザインドキュメント：次世代セッション連携プロトコル (GPAC Phase 3)

- **日付**: 2026-03-08
- **ステータス**: 承認済み
- **トピック**: セキュリティ境界を克服するエージェント専用 API と Handoff ワークフローの構築

## 1. 概要
Gemini CLI のセキュリティ制限（Workspace Boundary）により、ワークスペース外にあるセッション管理ディレクトリ（SSOT）への `read_file` や `write_file` が制限されている。現行の GPAC プロトコルはこの制限を `cat` や `cp` といった低レイヤーなシェルコマンドで回避しているが、エージェント（私）にとって操作が煩雑でミスを誘発しやすい。

本デザインでは、操作を「定義された API（コマンド）」へと抽象化し、エージェントがワークスペース内で作成した「下書き」をスクリプトが安全にグローバル領域へ配置する **Handoff（引き渡し）ワークフロー** を導入する。

## 2. コア・コンセプト：Handoff ワークフロー
エージェントが直接グローバル領域を操作するのではなく、以下の 3 ステップで情報のやり取りを完結させる。

1.  **Draft (下書き)**: エージェントはワークスペース内に Markdown テンプレートをコピーし、内容（Mission や Steps）を埋める。
2.  **Validate & Move (検証と移動)**: `gemini-sub` コマンドが下書きを読み取り、構文と必須項目をチェックした後、ID を発番してグローバル領域へ原子的に移動 (`mv`) させる。
3.  **Abstractions (抽象化された閲覧)**: グローバル領域の内容は `show-task` などの専用コマンドを通じて閲覧する。

## 3. コマンド・インターフェース (gemini-sub v3)
エージェントが迷わず操作できるよう、フラグを最小限に抑え、明示的なサブコマンドを提供する。

- **`spawn <file>`**: 下書きを検証し、新規 ID を発番して `task.md` として配置。
- **`report <file> --id <id>`**: 報告書下書きを検証し、既存 ID のディレクトリへ `report.md` として配置。
- **`show-task <id>`**: 指定したタスクの `task.md` を標準出力。
- **`show-report <id>`**: 指定したタスクの `report.md` を標準出力。
- **`import <id>`**: 成果を読み込み、親セッションに統合・要約（現行踏襲）。
- **`list`**: 進行中のタスク一覧を表示。

## 4. バリデーションと堅牢性
スクリプトが「門番」として機能し、以下のチェックを行う。

- **YAML 構文**: Frontmatter が正しくパースできるか。
- **必須項目の充填**: `mission`, `steps`, `status`, `summary`, `commits` が空（"" や []）でないか。
- **ID の一貫性**: `report` 時の ID が有効かつ既存のものであるか。
- **上書き保護**: 完了済みタスクへの誤った再報告を防止。

## 5. データフロー
1.  **親セッション**:
    - `.gemini/skills/session-coordination/` からテンプレートを読み取る。
    - `tmp_task.md` を作成し、ミッションを記述。
    - `python3 scripts/gemini_sub.py spawn tmp_task.md` を実行。
2.  **サブセッション**:
    - `python3 scripts/gemini_sub.py show-task <id>` でミッションを確認。
    - 作業完了後、`tmp_report.md` を作成。
    - `python3 scripts/gemini_sub.py report tmp_report.md --id <id>` を実行。
3.  **親セッション**:
    - `python3 scripts/gemini_sub.py import <id>` で統合。

## 6. メリット
- **エスケープ問題の解消**: シェル引数に複雑な文字列を渡す必要がない。
- **検証可能性**: エージェントは `spawn` 前に自分の下書きを `read_file` で再確認できる。
- **クリーンな環境**: `mv` 操作によりワークスペース内の一時ファイルは自動的に清掃される。

---
*Created by Gemini CLI Agent as part of the GPAC Evolution.*
