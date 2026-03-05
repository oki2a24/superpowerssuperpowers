import unittest
import re
import sys
import os

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
try:
    from scripts.gemini_sub import generate_session_id
except ImportError:
    generate_session_id = None

class TestGeminiSub(unittest.TestCase):
    def test_generate_session_id(self):
        if generate_session_id is None:
            self.fail("Could not import generate_session_id from scripts.gemini_sub")
        session_id = generate_session_id()
        self.assertTrue(re.match(r"^\d{8}-\d{6}$", session_id))

if __name__ == "__main__":
    unittest.main()
