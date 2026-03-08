import unittest
import os
import pathlib
import shutil
import subprocess

class TestGeminiSubGlobalPath(unittest.TestCase):
    def setUp(self):
        # テスト用のホームディレクトリを一時的に作成
        self.test_home = pathlib.Path("./tmp_home").absolute()
        self.sub_sessions_dir = self.test_home / ".gemini" / "sub-sessions"
        self.project_name = "test-proj"
        self.task_id = "TEST-TASK-001"
        self.task_dir = self.sub_sessions_dir / self.project_name / self.task_id
        
        # ディレクトリを事前に準備
        self.task_dir.mkdir(parents=True, exist_ok=True)
        (self.task_dir / "task.md").write_text("dummy task")
        
        # 環境変数 HOME を一時的に差し替えるための準備
        self.env = os.environ.copy()
        self.env["HOME"] = str(self.test_home)

    def tearDown(self):
        # テスト用ディレクトリの削除
        if self.test_home.exists():
            shutil.rmtree(self.test_home)
        # カレントディレクトリに誤って作成された report.md の削除
        if os.path.exists("report.md"):
            os.remove("report.md")

    def test_report_generates_file_in_global_task_dir(self):
        """
        report コマンドが、カレントディレクトリではなく、
        グローバルなタスクディレクトリに report.md を作成することを検証する。
        """
        # report コマンドを実行
        cmd = ["python3", "scripts/gemini_sub.py", "report", self.task_id]
        subprocess.run(cmd, env=self.env, check=True)
        
        # 期待されるパスに report.md が存在するか確認
        expected_report_path = self.task_dir / "report.md"
        self.assertTrue(expected_report_path.exists(), f"report.md should be created at {expected_report_path}")

if __name__ == "__main__":
    unittest.main()
