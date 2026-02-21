"""
Gemini CLI用のタスク管理ユーティリティスクリプト。
TODO.mdファイルをブランチごとに管理し、進行状況を追跡します。
"""

import sys, os, re, subprocess
from datetime import datetime

TASK_DIR = ".gemini/tasks"

def get_branch():
    """現在のGitブランチ名を取得し、ファイル名に使用可能な形式に変換します。"""
    try:
        return subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip().replace("/", "-")
    except:
        return "default"

def get_todo_path():
    """現在のブランチに対応するTODOファイルのパスを返します。"""
    return os.path.join(TASK_DIR, f"TODO-{get_branch()}.md")

def init(title):
    """新しいTODOファイルを初期化します。"""
    os.makedirs(TASK_DIR, exist_ok=True)
    path = get_todo_path()
    with open(path, "w") as f:
        f.write(f"# TASK: {title}\n- Branch: {get_branch()}\n- Created: {datetime.now().strftime('%Y-%m-%d')}\n\n")
    print(f"Initialized: {path}")

def add(task):
    """新しいタスクをTODOファイルに追加します。"""
    with open(get_todo_path(), "a") as f:
        f.write(f"- [ ] {task}\n")

def start(pattern):
    """
    指定されたパターンに一致する最初の未完了タスクを開始状態 [/] にします。
    既に実行中のタスクがある場合はエラー終了します。
    """
    path = get_todo_path()
    if not os.path.exists(path):
        print(f"Error: {path} not found. Run 'init' first.")
        sys.exit(1)
    with open(path, "r") as f: lines = f.readlines()
    if any("[/]" in l for l in lines):
        print("ERROR: 他のタスクが実行中です。先に完了させてください。")
        sys.exit(1)
    
    found = False
    with open(path, "w") as f:
        for l in lines:
            if not found and re.search(pattern, l) and "[ ]" in l:
                l = l.replace("[ ]", "[/]")
                found = True
            f.write(l)
    if found:
        print(f"Started: {pattern}")
    else:
        print(f"Error: Task matching '{pattern}' not found or already started.")
        sys.exit(1)

def done():
    """現在実行中のタスク [/] を完了状態 [x] にします。"""
    path = get_todo_path()
    with open(path, "r") as f: lines = f.readlines()
    with open(path, "w") as f:
        for l in lines:
            if "[/]" in l: l = l.replace("[/]", "[x]")
            f.write(l)
    print("Task marked as DONE.")

def show():
    """現在のTODOファイルの内容を表示します。"""
    path = get_todo_path()
    if not os.path.exists(path):
        print("No active TODO for this branch.")
        return
    with open(path, "r") as f:
        print(f"\n--- {os.path.basename(path)} ---\n")
        print(f.read())

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: todo.py [init|add|start|done|show] [args]")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "init": init(sys.argv[2])
    elif cmd == "add": add(sys.argv[2])
    elif cmd == "start": start(sys.argv[2])
    elif cmd == "done": done()
    elif cmd == "show": show()
