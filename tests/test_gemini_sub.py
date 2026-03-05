import unittest
import re
import sys
import os
import pathlib
import tempfile
import shutil

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
try:
    from scripts.gemini_sub import generate_session_id, spawn, report
except ImportError:
    generate_session_id = None
    spawn = None
    report = None

class TestGeminiSub(unittest.TestCase):
    def test_generate_session_id(self):
        """
        セッション ID が正しい形式 (YYYYMMDD-HHMMSS) で生成されることを検証します。
        """
        if generate_session_id is None:
            self.fail("Could not import generate_session_id from scripts.gemini_sub")
        session_id = generate_session_id()
        self.assertTrue(re.match(r"^\d{8}-\d{6}$", session_id))

    def test_spawn(self):
        """
        spawn コマンドが適切なディレクトリ構造と task.md ファイルを作成することを検証します。
        """
        if spawn is None:
            self.fail("Could not import spawn from scripts.gemini_sub")
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_home = pathlib.Path(tmp_dir)
            project_name = "test-project"
            session_id = "20260305-120000"
            
            # 実行
            task_path = spawn(project_name, session_id, home_dir=tmp_home)
            
            # 検証
            expected_dir = tmp_home / ".gemini" / "sub-sessions" / project_name / session_id
            expected_file = expected_dir / "task.md"
            
            self.assertTrue(expected_dir.exists(), f"ディレクトリが作成されていません: {expected_dir}")
            self.assertTrue(expected_file.exists(), f"ファイルが作成されていません: {expected_file}")
            
            content = expected_file.read_text()
            self.assertIn(f"project: {project_name}", content)
            self.assertIn(f"session_id: {session_id}", content)

    def test_report(self):
        """
        report コマンドが正しい YAML Frontmatter を持つ report.md テンプレートを生成することを検証します。
        """
        if report is None:
            self.fail("Could not import report from scripts.gemini_sub")
            
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = pathlib.Path(tmp_dir)
            project_name = "test-project"
            session_id = "20260305-120000"
            
            # 実行
            report_file = report(project_name, session_id, target_dir=tmp_path)
            
            # 検証
            self.assertTrue(report_file.exists())
            self.assertEqual(report_file.name, "report.md")
            
            content = report_file.read_text()
            self.assertIn(f"project: {project_name}", content)
            self.assertIn(f"session_id: {session_id}", content)
            self.assertIn("status: completed", content)

if __name__ == "__main__":
    unittest.main()
