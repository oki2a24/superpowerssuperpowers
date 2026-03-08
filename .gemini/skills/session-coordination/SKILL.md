---
name: session-coordination
description: "Gemini Peer-Agent Coordination (GPAC) プロトコルに基づき、サブセッションのライフサイクル（SPAWN/REPORT/IMPORT）を管理します。"
---

# セッション間連携 (GPAC)

## 概要

このスキルは、大規模なタスクを独立したサブセッションに切り出し、コンテキストをクリーンに保ちながら並行作業を進めるための連携プロトコルを提供します。

### 核心原則
1.  **Single Source of Truth (SSOT)**: サブセッションのデータは `~/.gemini/sub-sessions/` に集約されます。
2.  **往復チケットの原則 (Return Ticket)**: SPAWN したら必ず IMPORT して閉じなければなりません。
3.  **ワークスペース境界の認識 (Workspace Boundary)**: セッションディレクトリはワークスペース外（`read_file` 等が使用不可）であるため、**常に `run_shell_command` (cat, cp) を使用**して操作してください。

## プロセス

### 1. SPAWN (サブセッションの起動)

親エージェントは、文脈から `work_dir`（絶対パス）と `tag` を特定し、サブセッションをスポーンさせます。

**手順:**
1. `python3 scripts/gemini_sub.py spawn <work_dir_abs> --tag <tag>` を実行します。
2. スクリプト出力から **TASK_ID**, **BOOT**, **IMPORT** コマンドを抽出します。
3. **指示書の肉付け (Hybrid Pattern)**:
    - ワークスペース内に一時ファイル `tmp_task.md` を作成し、現在の文脈に基づくミッション・手順・制約を記述します。
    - `run_shell_command` で `cp tmp_task.md <TASK_PATH>` を実行し、指示書を完成させます。
4. ユーザーに「往復チケット」を提示し、作業開始を促します。

**【物理的出力テンプレート】**
```markdown
### 🚀 サブセッションの準備が完了しました
- **Task ID**: [TASK_ID]
- **Work Dir**: [ABS_PATH]
- **Mission**: [MISSION_SUMMARY]

**1. 以下のコマンドを実行して子セッションを起動してください (BOOT):**
[SCRIPT_OUTPUT_BOOT_COMMAND]

**2. 作業完了後、このセッション（親）で以下のコマンドを実行してください (IMPORT):**
python3 scripts/gemini_sub.py import [TASK_ID]
```

### 2. REPORT (成果の確定)

子エージェントは、ミッション完遂後に成果を確定させます。

**手順:**
1. `run_shell_command` で `cat task.md` を実行し、`task_id` を抽出します（`read_file` は権限エラーになります）。
2. `python3 scripts/gemini_sub.py report <TASK_ID>` を実行し、テンプレートを生成させます。
3. **報告書の肉付け**:
    - ワークスペース内に `tmp_report.md` を作成し、成果（status, commits, summary, proposals）を記述します。
    - `run_shell_command` で `cp tmp_report.md <REPORT_PATH>` を実行し、報告を完了させます。
4. ユーザーに完了を報告し、親セッションでの IMPORT を促します。

### 3. IMPORT (成果の回収)

親エージェントは、`python3 scripts/gemini_sub.py import <TASK_ID>` を実行し、成果を現在のセッションに統合・要約・永続化します。
不要になったワークツリーの削除も併せて提案してください。
