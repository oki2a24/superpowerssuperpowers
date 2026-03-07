import unittest
import re
import os
import sys

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.gemini_sub import generate_task_id, create_payload

class TestGeminiSub(unittest.TestCase):
    def test_generate_task_id_format(self):
        """
        Task ID が YYYYMMDD-HHMMSS-XXXX 形式（ランダム大文字英数字4桁）であることを検証。
        """
        task_id = generate_task_id()
        # 形式: 20260305-123456-A1B2
        self.assertTrue(re.match(r"^\d{8}-\d{6}-[A-Z0-9]{4}$", task_id))

    def test_create_payload(self):
        """
        create_payload が正しいシェルコマンド文字列を生成することを検証。
        """
        work_dir = "/path/to/workdir"
        task_path = "/path/to/task.md"
        payload = create_payload(work_dir, task_path)
        expected = f'cd {work_dir} && gemini "GPAC Protocol: New sub-session. Read task: {task_path}"'
        self.assertEqual(payload, expected)

if __name__ == "__main__":
    unittest.main()
