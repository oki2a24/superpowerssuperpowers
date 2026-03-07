#!/usr/bin/env python3
import datetime
import pathlib
import os
import subprocess
import random
import string

def generate_task_id():
    """
    YYYYMMDD-HHMMSS-XXXX 形式のタスク ID を生成します。
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{timestamp}-{suffix}"

def create_payload(work_dir, task_path):
    """
    初期プロンプトを含む起動ペイロード（シェルコマンド）を生成します。
    """
    prompt = f"GPAC Protocol: New sub-session. Read task: {task_path}"
    return f'cd {work_dir} && gemini "{prompt}"'

def spawn(project_name, task_id, work_dir, tag, home_dir=None):
    """
    新しいサブセッションのディレクトリを作成し、task.md を生成します。
    """
    if home_dir is None:
        home_dir = pathlib.Path.home()
    
    try:
        current_branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
    except subprocess.CalledProcessError:
        current_branch = "unknown"
    
    parent_project_root = os.getcwd()
    
    session_dir = home_dir / ".gemini" / "sub-sessions" / project_name / task_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    task_file = session_dir / "task.md"
    content = f"""---
task_id: {task_id}
parent_project_root: {parent_project_root}
parent_branch: {current_branch}
parent_task_tag: {tag}
work_dir: {work_dir}
required_skills: []
mission: "..."
steps: []
constraints: []
---
# タスク詳細

## 概要
ここにタスクの概要を記述してください。
"""
    task_file.write_text(content)
    return task_file

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

def report(task_id, target_dir=None):
    """
    YAML Frontmatter を含む report.md テンプレートを生成します。
    """
    if target_dir is None:
        target_dir = pathlib.Path.cwd()
    else:
        target_dir = pathlib.Path(target_dir)
        
    report_file = target_dir / "report.md"
    content = f"""---
status: success
task_id: {task_id}
commits: []
summary: "..."
next_actions: []
parent_feedback: "..."
skill_proposals: "..."
blocker_details: "..."
---
# 実施報告

## 概要
ここに作業の概要を記述してください。
"""
    report_file.write_text(content)
    return report_file

def handle_import(project_name, task_id, home_dir=None):
    """
    指定されたタスクの報告書を読み込み、要約を表示します。
    """
    if home_dir is None:
        home_dir = pathlib.Path.home()
    
    report_file = home_dir / ".gemini" / "sub-sessions" / project_name / task_id / "report.md"
    
    if not report_file.exists():
        # 作業ディレクトリ（ワークツリー）にある可能性も考慮
        report_file = pathlib.Path("./report.md")
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
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip('"')
            
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

if __name__ == "__main__":
    import sys
    launcher = os.environ.get("GEMINI_SUB_LAUNCHER", "manual")
    project = os.path.basename(os.getcwd())
    
    if len(sys.argv) > 1 and sys.argv[1] == "spawn":
        work_dir_arg = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
        work_dir_abs = os.path.abspath(work_dir_arg)
        tag_arg = "unnamed-task"
        if "--tag" in sys.argv:
            tag_idx = sys.argv.index("--tag") + 1
            if tag_idx < len(sys.argv):
                tag_arg = sys.argv[tag_idx]
        tid = generate_task_id()
        tpath = spawn(project, tid, work_dir_abs, tag_arg)
        launch_session(tid, tpath, work_dir_abs, launcher)
    elif len(sys.argv) > 1 and sys.argv[1] == "report":
        if len(sys.argv) < 3:
            print("Usage: python3 scripts/gemini_sub.py report <task_id>")
            sys.exit(1)
        tid = sys.argv[2]
        path = report(tid)
        print(f"Report template generated: {path}")
    elif len(sys.argv) > 1 and sys.argv[1] == "import":
        if len(sys.argv) < 3:
            print("Usage: python3 scripts/gemini_sub.py import <task_id>")
            sys.exit(1)
        tid = sys.argv[2]
        handle_import(project, tid)
    else:
        print("Usage: python3 scripts/gemini_sub.py [spawn | report | import]")
