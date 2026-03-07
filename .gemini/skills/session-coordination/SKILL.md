---
name: session-coordination
description: "Gemini Peer-Agent Coordination (GPAC) プロトコルに基づき、サブセッションのライフサイクル（SPAWN/REPORT/IMPORT）を管理します。"
---

# セッション間連携 (GPAC)

## 概要

このスキルは、大規模なタスクを独立したサブセッションに切り出し、コンテキストをクリーンに保ちながら並行作業を進めるための連携プロトコルを提供します。

### 核心原則
1.  **Single Source of Truth (SSOT)**: サブセッションの開始・終了に関するすべてのデータは `task.md` および `report.md` に集約されます。エージェントはこれらを「聖典」として尊重し、推測ではなく事実に基づいて行動してください。
2.  **往復チケットの原則 (Return Ticket)**: 外部セッションを「開く (SPAWN)」行為には、必ずそれを「閉じる (IMPORT)」責任が伴います。親エージェントは、子が成果を報告できるまで、そのタスクを「未完了」として管理してください。
3.  **役割分担 (Hybrid Pattern)**: スクリプトは「物理的なファイルと ID の管理」を担い、AI は「文脈の肉付けと成果の解釈」を担います。

## プロセス

### 1. SPAWN (サブセッションの起動)

親エージェントは、現在の会話文脈から以下の情報を自動的に特定し、サブセッションを「スポーン」させます。
- **work_dir**: 作業を行うディレクトリ（Gitワークツリー推奨）の絶対パス。
- **tag**: タスクを一意に識別する名前（例: `fix-auth-bug`）。

**手順:**
1. `python3 scripts/gemini_sub.py spawn <work_dir_abs> --tag <tag>` を実行します。
    - **注意**: 現在のスクリプト仕様により、`<work_dir_abs>` は必ず `spawn` の直後に記述してください。
2. スクリプトの標準出力から **TASK_ID**, **BOOT** (起動用コマンド), **IMPORT** (回収用コマンド) を抽出します。
3. 生成された `task.md` (パスはスクリプト出力に含まれる) を `read_file` で読み込みます。
4. YAML Frontmatter の `mission`, `steps`, `constraints` セクションに、現在の会話履歴に基づく具体的な内容を `write_file` または `replace` で追記（肉付け）します（Hybrid Pattern）。
5. ユーザーに対し、以下の「往復チケット」を分かりやすく提示し、作業の開始を促します。

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

子エージェントは、ミッション完遂後、以下の手順で成果を確定させます。

**手順:**
1. ワークディレクトリ直下の **`task.md` (聖典)** を `read_file` で読み込みます。
2. YAML Frontmatter から **`task_id`** を正確に抽出します。
3. `python3 scripts/gemini_sub.py report <TASK_ID>` を実行し、`report.md` テンプレートを生成します。
4. `report.md` の YAML Frontmatter および本文に、以下の内容を肉付けして `write_file` または `replace` で保存します。
    - **status**: `success` または `failure`。
    - **commits**: 作成したコミットのハッシュ。
    - **summary**: 実装内容の要約。
    - **skill_proposals**: 作業中に得られた、既存スキルの改善案や新スキルの提案。
5. ユーザーに「作業が完了し、成果を確定させました。親セッションで IMPORT コマンドを実行してください」と報告します。

### 3. IMPORT (成果の回収)

親エージェントは、子セッションの完了報告を受けて成果を現在のセッションに統合します。

**手順:**
1. 事前に提示した `python3 scripts/gemini_sub.py import <TASK_ID>` を実行します。
2. スクリプトの出力を読み込み、成果（ステータス、要約、次回のタスク）をユーザーに提示します。
3. 子セッションで行われた変更（ファイル、コミット）を確認し、メインブランチへのマージやクリーンアップを代行します。
4. **クリーンアップ**: 作業が正常に完了したことを確認したら、使用したワークツリーを削除することをユーザーに提案します（例: `git worktree remove <work_dir>`）。
5. **知見の永続化**: `skill_proposals` がある場合、それらを `GEMINI.md` や関連する `SKILL.md` に反映（または `writing-skills` を起動）します。
