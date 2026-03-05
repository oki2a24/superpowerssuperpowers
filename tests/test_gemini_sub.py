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
    from scripts.gemini_sub import generate_session_id, spawn
except ImportError:
    generate_session_id = None
    spawn = None

class TestGeminiSub(unittest.TestCase):
    def test_generate_session_id(self):
        if generate_session_id is None:
            self.fail("Could not import generate_session_id from scripts.gemini_sub")
        session_id = generate_session_id()
        self.assertTrue(re.match(r"^\d{8}-\d{6}$", session_id))

    def test_spawn(self):
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
            
            self.assertTrue(expected_dir.exists(), f"Directory not created: {expected_dir}")
            self.assertTrue(expected_file.exists(), f"File not created: {expected_file}")
            
            content = expected_file.read_text()
            self.assertIn(f"project: {project_name}", content)
            self.assertIn(f"session_id: {session_id}", content)

if __name__ == "__main__":
    unittest.main()
