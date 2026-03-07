---
name: session-coordination
description: "Gemini Peer-Agent Coordination (GPAC) プロトコルに基づき、サブセッションのライフサイクル（SPAWN/REPORT/IMPORT）を管理します。"
---

# セッション間連携 (GPAC)

## 概要

このスキルは、大規模なタスクを独立したサブセッションに切り出し、コンテキストをクリーンに保ちながら並行作業を進めるための連携プロトコルを提供します。

## プロセス

### 1. SPAWN (サブセッションの起動)

親エージェントは、現在の会話文脈から以下の情報を自動的に特定し、サブセッションを「スポーン」させます。
- **work_dir**: 作業を行うディレクトリ（Gitワークツリー推奨）の絶対パス。
- **tag**: タスクを一意に識別する名前（例: `fix-auth-bug`）。

**手順:**
1. `python3 scripts/gemini_sub.py spawn <work_dir_abs> --tag <tag>` を実行します。
    - **注意**: 現在のスクリプト仕様により、`<work_dir_abs>` は必ず `spawn` の直後に記述してください。
2. スクリプトの標準出力から **BOOT** (起動用コマンド) と **IMPORT** (回収用コマンド) を抽出します。
3. 生成された `task.md` (パスはスクリプト出力に含まれる) を `read_file` で読み込みます。
4. YAML Frontmatter の `mission`, `steps`, `constraints` セクションに、現在の会話履歴に基づく具体的な内容を `write_file` または `replace` で追記（肉付け）します。
5. ユーザーに対し、以下の「往復チケット」を分かりやすく提示します。
    - **BOOT コマンド**: 子セッションを開始するためのコマンド。スクリプトが出力した内容をそのまま提示します。
    - **IMPORT コマンド**: 作業完了後に親セッションで実行すべき回収コマンド（例: `python3 scripts/gemini_sub.py import <TASK_ID>`）。

### 2. REPORT (成果の確定)

子エージェントは、タスク完了時にワークディレクトリで `python3 scripts/gemini_sub.py report <TASK_ID>` を実行し、成果（コミット、変更内容、フィードバック）を報告書 (`report.md`) にまとめます。

### 3. IMPORT (成果の回収)

親エージェントは、子セッションの完了報告を受けて `python3 scripts/gemini_sub.py import <TASK_ID>` を実行し、成果を現在のセッションに統合します。

---
## ローカル・アダプテーション (Gemini固有)
<!-- 後のタスクで詳細化するため、一旦スケルトンとして保持 -->
