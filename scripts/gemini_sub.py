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
    XXXX はランダムな大文字英数字 4 桁。
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
    
    # メタデータの取得
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
    初期プロンプトを用いてクリーンなセッションを開始します。
    """
    payload = create_payload(work_dir, task_path)
    
    if launcher_mode == "manual":
        print("\n[GPAC Launcher: Manual Mode]")
        print("新しいタブを開き、以下のコマンドをコピー＆ペーストして実行してください：\n")
        print(f"  {payload}\n")
        print(f"作業完了後の統合コマンド:\n  python3 scripts/gemini_sub.py import {session_id}\n")
    elif launcher_mode == "tmux":
        try:
            # tmux new-window で cd と gemini を実行
            subprocess.run(["tmux", "new-window", "-n", f"sub-{session_id}", f"bash -c '{payload}; exec bash'"], check=True)
            print(f"Launched in new tmux window: sub-{session_id}")
            print(f"作業完了後の統合コマンド:\n  python3 scripts/gemini_sub.py import {session_id}\n")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: tmux is not available. Falling back to manual mode.")
            launch_session(session_id, task_path, work_dir, "manual")
    else:
        launch_session(session_id, task_path, work_dir, "manual")

if __name__ == "__main__":
    import sys
    launcher = os.environ.get("GEMINI_SUB_LAUNCHER", "manual")
    
    if len(sys.argv) > 1 and sys.argv[1] == "spawn":
        work_dir_arg = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
        work_dir_abs = os.path.abspath(work_dir_arg)
        
        # --tag 引数の処理
        tag_arg = "unnamed-task"
        if "--tag" in sys.argv:
            tag_idx = sys.argv.index("--tag") + 1
            if tag_idx < len(sys.argv):
                tag_arg = sys.argv[tag_idx]
        
        project = os.path.basename(os.getcwd())
        tid = generate_task_id()
        tpath = spawn(project, tid, work_dir_abs, tag_arg)
        launch_session(tid, tpath, work_dir_abs, launcher)
    else:
        # 他のコマンドは後続タスクで実装
        pass
