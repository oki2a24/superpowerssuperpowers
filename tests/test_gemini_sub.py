import unittest
import re
import os
import sys
import pathlib
import shutil
import io
from contextlib import redirect_stdout

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.gemini_sub import generate_task_id, create_payload, spawn, report, handle_import

class TestGeminiSub(unittest.TestCase):
    def test_generate_task_id_format(self):
        """Task ID の形式検証"""
        task_id = generate_task_id()
        self.assertTrue(re.match(r"^\d{8}-\d{6}-[A-Z0-9]{4}$", task_id))

    def test_create_payload(self):
        """起動ペイロードの形式検証"""
        work_dir = "/path/to/workdir"
        task_path = "/path/to/task.md"
        payload = create_payload(work_dir, task_path)
        expected = f'cd {work_dir} && gemini "GPAC Protocol: New sub-session. Read task: {task_path}"'
        self.assertEqual(payload, expected)

    def test_spawn_creates_correct_task_md(self):
        """spawn が正しい内容の task.md を生成することを検証"""
        test_home = pathlib.Path("./test_home_spawn")
        test_home.mkdir(exist_ok=True)
        try:
            work_dir = "/dummy/worktree"
            tag = "test-feature"
            project_name = "test-project"
            task_id = "20260305-120000-ABCD"
            task_path = spawn(project_name, task_id, work_dir, tag, home_dir=test_home)
            self.assertTrue(task_path.exists())
            content = task_path.read_text()
            self.assertIn(f"task_id: {task_id}", content)
            self.assertIn(f"parent_task_tag: {tag}", content)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

    def test_report_creates_correct_template(self):
        """report が正しいフォーマットの report.md を生成することを検証"""
        test_dir = pathlib.Path("./test_report_dir")
        test_dir.mkdir(exist_ok=True)
        try:
            task_id = "20260305-130000-EFGH"
            report_path = report(task_id, target_dir=test_dir)
            self.assertTrue(report_path.exists())
            content = report_path.read_text()
            self.assertIn(f"task_id: {task_id}", content)
            self.assertIn("status: success", content)
        finally:
            if test_dir.exists():
                shutil.rmtree(test_dir)

    def test_import_outputs_correct_layout(self):
        """import が指定されたレイアウトで報告書を表示することを検証"""
        test_home = pathlib.Path("./test_home_import")
        test_home.mkdir(exist_ok=True)
        try:
            project_name = "test-proj"
            task_id = "20260305-999999-WXYZ"
            report_dir = test_home / ".gemini" / "sub-sessions" / project_name / task_id
            report_dir.mkdir(parents=True)
            report_path = report_dir / "report.md"
            report_content = f"""---
status: success
task_id: {task_id}
commits:
  - "abc1234: test commit"
summary: "実装が完了しました。"
next_actions:
  - "マージしてください。"
parent_feedback: "指示が明確でした。"
skill_proposals: "GEMINI.md を更新しましょう。"
blocker_details: "特になし。"
---
# 実施報告
"""
            report_path.write_text(report_content)
            f = io.StringIO()
            with redirect_stdout(f):
                handle_import(project_name, task_id, home_dir=test_home)
            output = f.getvalue()
            self.assertIn(f"[GPAC IMPORT REPORT: {task_id}]", output)
            self.assertIn("Status: success", output)
            self.assertIn("Summary: 実装が完了しました。", output)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

if __name__ == "__main__":
    unittest.main()
