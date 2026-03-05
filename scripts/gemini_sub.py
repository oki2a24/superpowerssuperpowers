#!/usr/bin/env python3
import datetime
import pathlib
import os
import subprocess

def generate_session_id():
    """
    YYYYMMDD-HHMMSS 形式のセッション ID を生成します。
    """
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

def spawn(project_name, session_id, home_dir=None):
    """
    新しいサブセッションのディレクトリを作成し、task.md を生成します。
    """
    if home_dir is None:
        home_dir = pathlib.Path.home()
    
    session_dir = home_dir / ".gemini" / "sub-sessions" / project_name / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    task_file = session_dir / "task.md"
    content = f"""---
project: {project_name}
session_id: {session_id}
status: active
created_at: {datetime.datetime.now().isoformat()}
---

# タスク名

## 概要

ここにタスクの概要を記述してください。
"""
    task_file.write_text(content)
    return task_file

def launch_session(session_id, launcher_mode="manual"):
    """
    指定されたランチャーモードでセッションを起動します。
    """
    command = f"gemini --resume {session_id}"
    
    if launcher_mode == "manual":
        print("\n[Manual Launch Required]")
        print(f"次のコマンドを実行してサブセッションを開始してください：\n")
        print(f"  {command}\n")
    elif launcher_mode == "tmux":
        # tmux が利用可能か確認
        try:
            subprocess.run(["tmux", "new-window", "-n", f"gemini-{session_id}", command], check=True)
            print(f"Launched in new tmux window: {session_id}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: tmux is not available or failed. Falling back to manual mode.")
            launch_session(session_id, "manual")
    else:
        print(f"Warning: Unknown launcher mode '{launcher_mode}'. Falling back to manual mode.")
        launch_session(session_id, "manual")

def report(project_name, session_id, target_dir=None):
    """
    YAML Frontmatter を含む report.md テンプレートを生成します。
    """
    if target_dir is None:
        target_dir = pathlib.Path.cwd()
    else:
        target_dir = pathlib.Path(target_dir)
        
    report_file = target_dir / "report.md"
    content = f"""---
project: {project_name}
session_id: {session_id}
status: completed
completed_at: {datetime.datetime.now().isoformat()}
---

# 実施報告

## 概要
ここに作業の概要を記述してください。

## 実施内容
- [x] 内容1
- [x] 内容2

## 親セッションへのフィードバック
- **指示の明確さ**: 
- **不足していたコンテキスト**: 
- **改善案**: 
"""
    report_file.write_text(content)
    return report_file

if __name__ == "__main__":
    import sys
    launcher = os.environ.get("GEMINI_SUB_LAUNCHER", "manual")
    project = os.path.basename(os.getcwd())
    
    if len(sys.argv) > 1 and sys.argv[1] == "spawn":
        sid = generate_session_id()
        path = spawn(project, sid)
        print(f"Spawned: {path}")
        launch_session(sid, launcher)
    elif len(sys.argv) > 1 and sys.argv[1] == "report":
        # セッションIDが引数にあればそれを使用、なければ生成（通常は引数で渡される想定）
        sid = sys.argv[2] if len(sys.argv) > 2 else "unknown-session"
        path = report(project, sid)
        print(f"Report template generated: {path}")
    elif len(sys.argv) > 1:
        print(f"Unknown command: {sys.argv[1]}")
    else:
        print(generate_session_id())
