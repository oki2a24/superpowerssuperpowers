
"""
Gemini CLI用のタスク管理ユーティリティスクリプト。
GitブランチごとにMarkdown形式のTODOファイルを管理し、タスクの追加、表示、開始、完了をサポートします。
"""
import sys
import re
import os
import subprocess
from datetime import datetime

TASK_DIR = ".gemini/tasks"

def get_branch_name():
    """現在のGitブランチ名を取得し、ファイル名に使用可能な形式に変換します。"""
    try:
        return subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip().replace("/", "-")
    except:
        return "default"

def get_todo_path():
    """現在のブランチに対応するTODOファイルのパスを返します。"""
    return os.path.join(TASK_DIR, f"TODO-{get_branch_name()}.md")

def add(task):
    """新しいタスクをTODOファイルに追加します。"""
    with open(get_todo_path(), "a") as f:
        f.write(f"- [ ] {task}\n")

def init(title):
    """新しいTODOファイルを初期化します。"""
    os.makedirs(TASK_DIR, exist_ok=True)
    branch_name = get_branch_name()
    path = get_todo_path()
    
    with open(path, "w") as f:
        f.write(f"""# TASK: {title}
- Branch: {branch_name}
- Created: {datetime.now().strftime('%Y-%m-%d')}
""")

def show():
    """現在のTODOファイルの内容を表示します。"""
    path = get_todo_path()
    if not os.path.exists(path):
        print("No active TODO for this branch.", end='')
        return
    with open(path, "r") as f:
        print(f"\n--- {os.path.basename(path)} ---", end='')
        print(f.read().rstrip('\n'), end='')


def start(pattern):
    """
    指定されたパターンに一致する最初の未完了タスクを開始状態 [/] にします。
    既に実行中のタスクがある場合はエラー終了します。
    """
    path = get_todo_path()
    if not os.path.exists(path):
        print(f"Error: {path} not found.", end='')
        sys.exit(1)
        return
    with open(path, "r") as f: lines = f.readlines()
    if any("[/]" in l for l in lines):
        print("ERROR: 他のタスクが実行中です。先に完了させてください。", end='')
        sys.exit(1)
    
    found = False
    new_lines = []
    for l in lines:
        if not found and "[ ]" in l and re.search(pattern, l):
            l = l.replace("[ ]", "[/]")
            found = True
        new_lines.append(l)
            
    if found:
        with open(path, "w") as f:
            f.writelines(new_lines)
        print(f"Started: {pattern}", end='')
    else:
        print(f"Error: Task matching '{pattern}' not found or already started.", end='')
        sys.exit(1)

def done():
    """現在実行中のタスク [/] を完了状態 [x] にします。"""
    path = get_todo_path()
    with open(path, "r") as f: lines = f.readlines()
    new_lines = []
    found = False
    for l in lines:
        if "[/]" in l:
            l = l.replace("[/]", "[x]")
            found = True
        new_lines.append(l)
    
    if found:
        with open(path, "w") as f:
            f.writelines(new_lines)
        print("Task marked as DONE.", end='')
    else:
        print("No in-progress task found to mark as DONE.", end='')

def main():
    if len(sys.argv) < 2:
        print("Usage: todo.py [init|add|start|done|show] [args]", end='')
        sys.exit(1)
        return
    
    cmd = sys.argv[1]
    
    if cmd == "init":
        if len(sys.argv) < 3:
            print("Usage: todo.py init <title>", end='')
            sys.exit(1)
            return
        init(sys.argv[2])
    elif cmd == "add":
        if len(sys.argv) < 3:
            print("Usage: todo.py add <task>", end='')
            sys.exit(1)
            return
        add(sys.argv[2])
    elif cmd == "start":
        if len(sys.argv) < 3:
            print("Usage: todo.py start <pattern>", end='')
            sys.exit(1)
            return
        start(sys.argv[2])
    elif cmd == "done":
        done()
    elif cmd == "show":
        show()
    else:
        print("Usage: todo.py [init|add|start|done|show] [args]", end='')
        sys.exit(1)
        return

if __name__ == "__main__":
    main()

