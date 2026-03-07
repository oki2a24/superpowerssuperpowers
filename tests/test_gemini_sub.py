import unittest
import re
import os
import sys
import pathlib
import shutil

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.gemini_sub import generate_task_id, create_payload, spawn

class TestGeminiSub(unittest.TestCase):
    def test_generate_task_id_format(self):
        """
        Task ID が YYYYMMDD-HHMMSS-XXXX 形式（ランダム大文字英数字4桁）であることを検証。
        """
        task_id = generate_task_id()
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

    def test_spawn_creates_correct_task_md(self):
        """
        spawn が正しい内容の task.md を生成することを検証。
        """
        test_home = pathlib.Path("./test_home")
        test_home.mkdir(exist_ok=True)
        try:
            work_dir = "/dummy/worktree"
            tag = "test-feature"
            project_name = "test-project"
            task_id = "20260305-120000-ABCD"
            
            task_path = spawn(project_name, task_id, work_dir, tag, home_dir=test_home)
            
            self.assertTrue(task_path.exists())
            content = task_path.read_text()
            
            # YAML フィールドの検証
            self.assertIn(f"task_id: {task_id}", content)
            self.assertIn(f"parent_task_tag: {tag}", content)
            self.assertIn(f"work_dir: {work_dir}", content)
            self.assertIn("mission: \"...\"", content)
            self.assertIn("required_skills: []", content)
            self.assertIn("# タスク詳細", content)
            
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

if __name__ == "__main__":
    unittest.main()
