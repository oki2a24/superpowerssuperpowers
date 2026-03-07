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

def generate_session_id():
    """
    旧仕様との互換性のために残していますが、将来的に削除予定です。
    """
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

# ... (既存のメソッドは後続のタスクで修正・置換します)
