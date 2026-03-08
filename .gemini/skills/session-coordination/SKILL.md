---
name: session-coordination
description: "Gemini Peer-Agent Coordination (GPAC) プロトコルに基づき、サブセッションのライフサイクル（SPAWN/REPORT/IMPORT）を管理します。"
---

# セッション間連携 (GPAC)

## 概要
大規模なタスクを独立したサブセッションに切り出し、コンテキストをクリーンに保ちながら並行作業を進めるための連携プロトコルです。

### 核心原則
1.  **Single Source of Truth (SSOT)**: サブセッションのデータは `~/.gemini/sub-sessions/` に集約されます。
2.  **Handoff (引き渡し) プロトコル**: エージェントはワークスペース内で「下書き」を仕上げ、`gemini-sub` コマンドがそれを検証してグローバル領域へ原子的に移動（配置）させます。
3.  **抽象化された閲覧**: グローバル領域の内容は `show-task` / `show-report` コマンドを介して安全に確認します。

## クイックリファレンス

| コマンド | 用途 |
| :--- | :--- |
| `python3 scripts/gemini_sub.py spawn <draft>` | 下書きを検証・配置し、セッションを起動 |
| `python3 scripts/gemini_sub.py show-task <id>` | 指定したタスクのミッションを表示 |
| `python3 scripts/gemini_sub.py report <draft> --id <id>` | 報告書を提出（Handoff） |
| `python3 scripts/gemini_sub.py list` | 進行中のセッションを一覧表示 |
| `python3 scripts/gemini_sub.py import <id>` | 成果を親セッションに統合 |

## プロセス

### 1. SPAWN (サブセッションの起動)

1.  **下書きの作成**: `.gemini/skills/session-coordination/task_template.md` を読み込み、ワークスペース内に `tmp_task.md` として書き出します。
    - **鉄則**: `mission`, `steps` などの必須項目を具体的に記述してください。
    - **鉄則**: `task_id`, `parent_project_root`, `parent_branch` は**必ず `PENDING` のまま**にしてください（システムが自動置換します）。
2.  **引き渡し**: `python3 scripts/gemini_sub.py spawn tmp_task.md` を実行します。バリデーションエラーが出た場合は内容を修正して再試行してください。
3.  **チケットの提示**: 成功時に出力される **BOOT** コマンドと **IMPORT** コマンドをユーザーに提示し、作業開始を促します。

### 2. REPORT (成果の確定)

1.  **ミッションの再確認**: `python3 scripts/gemini_sub.py show-task <id>` で当初の目的を確認します。
2.  **報告書下書きの作成**: `report_template.md` を読み込み、`tmp_report.md` を作成します。
    - **鉄則**: `status` (success/failure/partial), `summary` などを埋めてください。
    - **鉄則**: `task_id` は必ず `PENDING` のままにしてください。
3.  **提出**: `python3 scripts/gemini_sub.py report tmp_report.md --id <id>` を実行します。成功するとローカルの下書きは自動削除されます。

### 3. IMPORT (成果の回収)

親エージェントは `python3 scripts/gemini_sub.py import <id>` を実行し、成果を現在のセッションに要約・永続化します。不要になったワークツリーの削除も併せて提案してください。
