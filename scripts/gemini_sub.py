#!/usr/bin/env python3
import datetime
import pathlib
import os

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

if __name__ == "__main__":
    # 引数処理のベース（後のタスクで拡張）
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "spawn":
        project = os.path.basename(os.getcwd())
        sid = generate_session_id()
        path = spawn(project, sid)
        print(f"Spawned: {path}")
    elif len(sys.argv) > 1:
        print(f"Unknown command: {sys.argv[1]}")
    else:
        print(generate_session_id())
