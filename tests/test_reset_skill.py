import unittest
import os
import tempfile
import sys

# Add the project root to the path to allow importing the script
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now we can import the module (it will fail initially, which is expected)
from scripts import reset_skill

class TestResetSkill(unittest.TestCase):

    def setUp(self):
        # Create a temporary file for each test
        self.temp_fd, self.temp_path = tempfile.mkstemp(suffix=".md")

    def tearDown(self):
        # Close and remove the temporary file
        os.close(self.temp_fd)
        os.remove(self.temp_path)

    def test_removes_adaptation_section(self):
        """
        ## ローカル・アダプテーション (Gemini固有) セクションとそれ以降が削除されることをテストする。
        """
        original_content = """\
# Original Skill Content
This is the original part of the skill.

## ローカル・アダプテーション (Gemini固有)
<!-- IMPROVED_ON: 2026-02-27 | REASON: Test reason -->
This is the local adaptation.
"""
        expected_content = """\
# Original Skill Content
This is the original part of the skill.
"""
        with open(self.temp_path, 'w', encoding='utf-8') as f:
            f.write(original_content)

        reset_skill.reset_skill_file(self.temp_path)

        with open(self.temp_path, 'r', encoding='utf-8') as f:
            result_content = f.read()
        
        self.assertEqual(result_content.strip(), expected_content.strip())

    def test_no_adaptation_section(self):
        """
        アダプテーションセクションが存在しない場合にファイルが変更されないことをテストする。
        """
        original_content = """\
# Original Skill Content
This is a skill without an adaptation section.
"""
        with open(self.temp_path, 'w', encoding='utf-8') as f:
            f.write(original_content)

        reset_skill.reset_skill_file(self.temp_path)

        with open(self.temp_path, 'r', encoding='utf-8') as f:
            result_content = f.read()

        self.assertEqual(result_content.strip(), original_content.strip())
    
    def test_empty_file(self):
        """
        空のファイルをエラーなく処理できることをテストする。
        """
        # File is already empty
        result = reset_skill.reset_skill_file(self.temp_path)
        self.assertFalse(result) # Should return False as no section was found

if __name__ == '__main__':
    unittest.main()
