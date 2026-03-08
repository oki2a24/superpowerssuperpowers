#!/usr/bin/env python3
import datetime
import pathlib
import os
import subprocess
import random
import string
import argparse
import sys

import shutil # タスク3以降で使用予定

def validate_frontmatter(content, required_keys, pending_keys=None):
    """
    Markdown の Frontmatter を抽出し、バリデーションを行います。
    
    【実装の背景と苦労した点】
    標準ライブラリのみで動作させるため、YAML パーサーを自作しました。実装中、以下の「型判定の曖昧さ」が
    大きな課題となりました：
    
    1. 曖昧な空値:
       'key:' や 'key: ""' という行が現れた際、それが「空の文字列」を意図しているのか、
       それとも「次の行からリストが始まる」のかを、その行単体では判定できません。
    
    2. 試行錯誤の末の解決策（遅延リスト変換）:
       - 最初にキーが現れた際は、一旦空文字列 "" として保持します。
       - 次の行が '- ' で始まるリストアイテムだった場合のみ、動的にリスト型 [] へ変換します。
       - これにより、'mission: ""'（空でエラーにしたい文字列）と、
         'steps:'（次にリストが続く正常な記述）を正確に区別できるようになりました。
    
    【パース制限】
    - インデントは無視されます（フラットな構造のみサポート）。
    - 値の中にコロン ':' を含む場合は、必ずクォート（"..."）で囲んでください。
    """
    if pending_keys is None:
        pending_keys = []

    # Frontmatter の抽出
    parts = content.split("---")
    if len(parts) < 3:
        raise ValueError("Invalid format: Missing YAML frontmatter (---)")
    
    yaml_text = parts[1].strip()
    data = {}
    current_key = None
    
    for line in yaml_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        
        # リスト要素の処理
        if line.startswith("- "):
            if current_key:
                # 【重要】遅延変換: 最初のリストアイテムが現れた時点で、キーの型をリストに確定させる。
                # これにより、'mission: ""'（文字列）と 'steps:'（リスト）のパース時の曖昧さを排除している。
                if not isinstance(data.get(current_key), list):
                    data[current_key] = [] 
                data[current_key].append(line[2:].strip().strip('"').strip("'"))
            else:
                # リストの前にキーがない場合は文法エラー
                raise ValueError(f"YAML syntax error: Unexpected list item '{line}'")
            continue

        # キー: 値 の処理
        if ":" not in line:
            raise ValueError(f"YAML syntax error: Invalid line '{line}'")
        
        # 最初のコロンで分割
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip()

        # クォートの除去
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1].strip()
        
        # 値の中に裸のコロンが含まれているかチェック (クォート除去後)
        if ":" in val:
             raise ValueError(f"YAML syntax error: Invalid value '{val}' (Try quoting it)")

        if not val:
            # 空の値。現時点では文字列かリストか不明。
            # 次の行がリストアイテムならリストになる。
            data[key] = ""
        elif val == "[]":
            data[key] = []
        else:
            data[key] = val
        current_key = key

    # バリデーション
    for key in required_keys:
        if key not in data:
            raise ValueError(f"Missing required key: {key}")
        
        val = data[key]
        
        # PENDING チェック
        if key in pending_keys and val != "PENDING":
            raise ValueError(f"Key '{key}' must be 'PENDING'")
        
        # 空値チェック (リスト/文字列両対応)
        # 試行錯誤の結果：steps は「1つ以上の手順」が必須だが、
        # commits や next_actions は「作業内容によっては空」もあり得るため、空リスト [] を許容する。
        if key == "steps":
            if not isinstance(val, list) or len(val) == 0:
                 raise ValueError(f"Key 'steps' must be a non-empty list")
        elif not val and val != []: # 空文字列 "" はエラーだが、空リスト [] は受理
            raise ValueError(f"Empty value for key: {key}")

    return data

def generate_task_id():
    """
    YYYYMMDD-HHMMSS-XXXX 形式のタスク ID を生成します。
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{timestamp}-{suffix}"

def find_task_directory(task_id, home_dir=None):
    """
    ~/.gemini/sub-sessions/ 下から task_id ディレクトリを探し出します。
    """
    if home_dir is None:
        home_dir = pathlib.Path.home()
    
    base_dir = home_dir / ".gemini" / "sub-sessions"
    if not base_dir.exists():
        return None
    
    # 全てのプロジェクトディレクトリを走査して task_id を探す
    for proj_dir in base_dir.iterdir():
        if proj_dir.is_dir():
            task_dir = proj_dir / task_id
            if task_dir.exists() and task_dir.is_dir():
                return task_dir
    return None

def create_payload(work_dir, task_path):
    """
    初期プロンプトを含む起動ペイロード（シェルコマンド）を生成します。
    """
    prompt = f"GPAC Protocol: Your mission is defined in a file outside the workspace. Please execute 'cat {task_path}' to understand your mission."
    # プロンプト内のクォートをエスケープ
    safe_prompt = prompt.replace('"', '\\"')
    return f'cd {work_dir} && gemini "{safe_prompt}"'

def spawn(local_draft_path, project_name=None, home_dir=None):
    """
    ワークスペース内の下書きファイルを読み込み、検証した上でグローバル領域へ配置（Handoff）します。
    
    【Handoff ワークフロー】
    1. エージェントがワークスペース内に 'task_id: PENDING' を含む下書きを作成。
    2. 本関数がバリデーションを行い、PENDING 箇所を実際の値（ID, Root, Branch）で置換。
    3. 置換後の内容をグローバル領域 (~/.gemini/sub-sessions/...) へ書き出し。
    4. ワークスペース内の下書きファイルを削除（これにより環境をクリーンに保つ）。
    """
    draft_file = pathlib.Path(local_draft_path)
    if not draft_file.exists():
        raise FileNotFoundError(f"Draft file not found: {local_draft_path}")
    
    content = draft_file.read_text()
    
    # 必須項目の定義
    # parent_project_root, parent_branch は親セッションの文脈を子に引き継ぐために必須。
    required = ["task_id", "parent_project_root", "parent_branch", "parent_task_tag", "work_dir", "mission", "steps"]
    pending = ["task_id", "parent_project_root", "parent_branch"]
    
    # 1. バリデーション
    validate_frontmatter(content, required, pending_keys=pending)
    
    # 2. 実値の取得 (コンテキスト情報の収集)
    if home_dir is None:
        home_dir = pathlib.Path.home()
    
    try:
        current_branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
    except subprocess.CalledProcessError:
        current_branch = "unknown"
    
    parent_project_root = os.getcwd()
    task_id = generate_task_id()
    
    if project_name is None:
        project_name = os.path.basename(parent_project_root)
        
    # 3. コンテンツの置換 (PENDING -> 実値)
    # 文字列置換により、テンプレートの構造を維持したままメタデータを注入する。
    updated_content = content.replace("task_id: PENDING", f"task_id: {task_id}")
    updated_content = updated_content.replace("parent_project_root: PENDING", f"parent_project_root: {parent_project_root}")
    updated_content = updated_content.replace("parent_branch: PENDING", f"parent_branch: {current_branch}")
    
    # 4. グローバル領域のディレクトリ作成
    session_dir = home_dir / ".gemini" / "sub-sessions" / project_name / task_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    target_path = session_dir / "task.md"
    
    # 5. 移動 (書き込み完了後に元のファイルを削除することで、原子的な Handoff を実現)
    target_path.write_text(updated_content)
    draft_file.unlink()
    
    return target_path

def launch_session(session_id, task_path, work_dir, launcher_mode="manual"):
    """
    指定されたランチャーモードでセッションを起動します。
    """
    payload = create_payload(work_dir, task_path)
    
    if launcher_mode == "manual":
        print("\n[GPAC Launcher: Manual Mode]")
        print("新しいタブを開き、以下のコマンドをコピー＆ペーストして実行してください：\n")
        print(f"  {payload}\n")
        print(f"作業完了後の統合コマンド:\n  python3 scripts/gemini_sub.py import {session_id}\n")
    elif launcher_mode == "tmux":
        try:
            subprocess.run(["tmux", "new-window", "-n", f"sub-{session_id}", f"bash -c '{payload}; exec bash'"], check=True)
            print(f"Launched in new tmux window: sub-{session_id}")
            print(f"作業完了後の統合コマンド:\n  python3 scripts/gemini_sub.py import {session_id}\n")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: tmux is not available. Falling back to manual mode.")
            launch_session(session_id, task_path, work_dir, "manual")
    else:
        launch_session(session_id, task_path, work_dir, "manual")

def report(local_draft_path, task_id, home_dir=None):
    """
    ワークスペース内の報告書下書きを検証し、グローバル領域へ配置（Handoff）します。
    既に 'status: success' で報告済みの場合は上書きを防止します。
    
    【バリデーション】
    - 必須キー（status, summary, commits, next_actions）の存在と型を確認します。
    - commits や next_actions は空リスト [] でも受理されます。
    """
    draft_file = pathlib.Path(local_draft_path)
    if not draft_file.exists():
        raise FileNotFoundError(f"Draft file not found: {local_draft_path}")
    
    task_dir = find_task_directory(task_id, home_dir=home_dir)
    if not task_dir:
        raise FileNotFoundError(f"Task directory for {task_id} not found.")
        
    report_file = task_dir / "report.md"
    
    # 1. 上書き防止チェック
    if report_file.exists():
        try:
            existing_content = report_file.read_text()
            # 簡易パースで status を確認
            if "status: success" in existing_content:
                raise ValueError(f"Task {task_id} is already reported as success. (Handoff blocked)")
        except Exception as e:
            if isinstance(e, ValueError): raise e
            # パース失敗等は無視して続行
            pass

    content = draft_file.read_text()
    
    # 必須項目の定義
    required = ["task_id", "status", "summary", "commits", "next_actions"]
    
    # 2. バリデーション
    validate_frontmatter(content, required, pending_keys=["task_id"])
    
    # 3. コンテンツの置換 (PENDING -> task_id)
    updated_content = content.replace("task_id: PENDING", f"task_id: {task_id}")
    
    # 4. 配置と削除
    report_file.write_text(updated_content)
    draft_file.unlink()
    
    return report_file

def handle_import(task_id, project_name=None, home_dir=None):
    """
    指定されたタスクの報告書を読み込み、要約を表示します。
    """
    task_dir = find_task_directory(task_id, home_dir=home_dir)
    if not task_dir:
        # プロジェクト名がある場合は旧パスも探す（後方互換性）
        if project_name and home_dir:
             report_file = home_dir / ".gemini" / "sub-sessions" / project_name / task_id / "report.md"
        else:
             report_file = pathlib.Path("./report.md")
    else:
        report_file = task_dir / "report.md"
    
    if not report_file.exists():
        print(f"Error: Report file not found for task {task_id}")
        return

    content = report_file.read_text()
    
    # 簡易 YAML パース (--- で分割)
    parts = content.split("---")
    if len(parts) < 3:
        print("Error: Invalid report format (missing YAML frontmatter)")
        return
    
    yaml_lines = parts[1].strip().split("\n")
    data = {}
    current_key = None
    
    for line in yaml_lines:
        line = line.strip()
        if not line: continue
        
        if line.startswith("- "): # リスト要素
            if current_key and isinstance(data.get(current_key), list):
                data[current_key].append(line[2:].strip().strip('"'))
            continue
            
        if ":" in line:
            parts_line = line.split(":", 1)
            key = parts_line[0].strip()
            val = parts_line[1].strip().strip('"')
            
            if val == "[]" or not val:
                data[key] = []
            else:
                data[key] = val
            current_key = key

    # 指定されたレイアウトで出力
    print(f"\n[GPAC IMPORT REPORT: {task_id}]")
    print("-" * 40)
    print(f"Status: {data.get('status', 'unknown')}")
    print(f"Summary: {data.get('summary', 'No summary provided.')}")
    print("Next Actions:")
    actions = data.get('next_actions', [])
    if isinstance(actions, list):
        for action in actions:
            print(f"  - {action}")
    else:
        print(f"  - {actions}")
    print("-" * 40)
    print(f"Feedback: {data.get('parent_feedback', 'None')}")
    print(f"Proposals: {data.get('skill_proposals', 'None')}")
    print("-" * 40)
    print(f"Commits: {data.get('commits', [])}")
    print("-" * 40 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Gemini Peer-Agent Coordination (GPAC) Controller")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # spawn コマンド
    spawn_parser = subparsers.add_parser("spawn", help="Spawn a new sub-session using a draft file")
    spawn_parser.add_argument("draft", help="Path to the task draft file (tmp_task.md)")
    spawn_parser.add_argument("-p", "--project", help="Project name (default: basename of CWD)")

    # report コマンド
    report_parser = subparsers.add_parser("report", help="Submit a report using a draft file")
    report_parser.add_argument("draft", help="Path to the report draft file (tmp_report.md)")
    report_parser.add_argument("--id", required=True, help="Task ID to report for")

    # import コマンド
    import_parser = subparsers.add_parser("import", help="Import results from a sub-session")
    import_parser.add_argument("task_id", help="Task ID")
    import_parser.add_argument("-p", "--project", help="Project name")

    args = parser.parse_args()

    launcher = os.environ.get("GEMINI_SUB_LAUNCHER", "manual")
    project = args.project if hasattr(args, 'project') and args.project else os.path.basename(os.getcwd())

    if args.command == "spawn":
        tpath = spawn(args.draft, project_name=project)
        # ID とパスを取得するために再パース (タスク7でリファクタ対象)
        tid = tpath.parent.name
        # 起動ペイロード。work_dir は一旦カレントディレクトリを使用 (簡易対応)
        launch_session(tid, tpath, os.getcwd(), launcher)
    elif args.command == "report":
        path = report(args.draft, args.id)
        print(f"Report submitted successfully: {path}")
    elif args.command == "import":
        handle_import(args.task_id, project_name=args.project)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
