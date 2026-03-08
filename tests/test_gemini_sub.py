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

from scripts.gemini_sub import generate_task_id, create_payload, spawn, report, handle_import, validate_frontmatter

class TestFrontmatterValidation(unittest.TestCase):
    def test_valid_task_md(self):
        """
        正常な task.md の Frontmatter 検証
        - PENDING プレースホルダの受理
        - リスト形式（steps）の正しいパース
        """
        content = """---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: test-tag
work_dir: /abs/path
mission: "My Mission"
steps:
  - Step 1
---
# Body"""
        required = ["task_id", "parent_project_root", "parent_branch", "parent_task_tag", "work_dir", "mission", "steps"]
        pending = ["task_id", "parent_project_root", "parent_branch"]
        data = validate_frontmatter(content, required, pending_keys=pending)
        self.assertEqual(data["task_id"], "PENDING")
        self.assertEqual(data["parent_task_tag"], "test-tag")
        self.assertIsInstance(data["steps"], list)

    def test_invalid_yaml_syntax(self):
        """
        YAML 構文エラーの検知
        - 裸のコロンが2つ以上ある場合、簡易パーサーではクォートを要求するように設計。
        """
        content = """---
invalid: : yaml
---"""
        with self.assertRaisesRegex(ValueError, "YAML syntax error"):
            validate_frontmatter(content, ["invalid"])

    def test_missing_required_key(self):
        """必須キーの欠落。ミッション作成時の必須要件を確認。"""
        content = """---
mission: "Existing"
---"""
        with self.assertRaisesRegex(ValueError, "Missing required key: steps"):
            validate_frontmatter(content, ["mission", "steps"])

    def test_empty_value(self):
        """
        空値の拒否。
        - エージェントが項目を埋め忘れることを防ぐための重要なチェック。
        """
        content = """---
mission: ""
---"""
        with self.assertRaisesRegex(ValueError, "Empty value for key: mission"):
            validate_frontmatter(content, ["mission"])

    def test_invalid_pending_value(self):
        """
        PENDING であるべきキーが PENDING でない場合。
        - 新規作成（spawn）時には、スクリプトによる置換を前提とするため PENDING 必須。
        """
        content = """---
task_id: 20260308-120000-XXXX
---"""
        with self.assertRaisesRegex(ValueError, "Key 'task_id' must be 'PENDING'"):
            validate_frontmatter(content, ["task_id"], pending_keys=["task_id"])

    def test_invalid_list_type(self):
        """
        リスト形式の検証。
        - 'steps' は必ず 1 つ以上の要素を持つリストでなければならない。
        """
        content = """---
steps: "not a list"
---"""
        # 実装計画に基づき、steps は非空リストであることを検証
        with self.assertRaisesRegex(ValueError, "Key 'steps' must be a non-empty list"):
            validate_frontmatter(content, ["steps"])

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
        # スクリプト内の最新のプロンプトと一致させる
        expected = f'cd {work_dir} && gemini "GPAC Protocol: Your mission is defined in a file outside the workspace. Please execute \'cat {task_path}\' to understand your mission."'
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
            # spawn(project_name, task_id, work_dir, tag, home_dir=None)
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
        test_home = pathlib.Path("./test_home_report")
        test_home.mkdir(exist_ok=True)
        try:
            task_id = "20260305-130000-EFGH"
            # find_task_directory で見つからない場合はカレントディレクトリに作られる仕様
            # テスト環境では home_dir を指定
            report_path = report(task_id, home_dir=test_home)
            self.assertTrue(report_path.exists())
            content = report_path.read_text()
            self.assertIn(f"task_id: {task_id}", content)
            self.assertIn("status: success", content)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

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
                # handle_import(task_id, project_name=None, home_dir=None)
                handle_import(task_id, project_name=project_name, home_dir=test_home)
            output = f.getvalue()
            self.assertIn(f"[GPAC IMPORT REPORT: {task_id}]", output)
            self.assertIn("Status: success", output)
            self.assertIn("Summary: 実装が完了しました。", output)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

if __name__ == "__main__":
    unittest.main()
