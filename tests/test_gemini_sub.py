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
        - 内部実装で空の文字列 "" と空のリスト [] が混同されないことを検証する
          （実装時の試行錯誤ポイント："" はエラー、[] は受理したい項目がある）。
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
        - 実装時の難所：キー直後に値がない場合に、それが空文字なのかリストの開始なのかを
          パーサーが正確に遅延判定できているかを確認する。
        """
        content = """---
steps: "not a list"
---"""
        # 実装計画に基づき、steps は非空リストであることを検証
        with self.assertRaisesRegex(ValueError, "Key 'steps' must be a non-empty list"):
            validate_frontmatter(content, ["steps"])

class TestSpawnHandoff(unittest.TestCase):
    def test_handoff_success(self):
        """
        正常な Handoff 方式の spawn 検証
        - 下書きファイルの読み取りと検証
        - PENDING の実値置換
        - グローバル配置とローカル削除
        """
        test_home = pathlib.Path("./test_home_handoff")
        test_home.mkdir(exist_ok=True)
        draft_path = pathlib.Path("tmp_task_draft.md")
        
        try:
            # 1. 下書きの準備
            draft_content = """---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: test-handoff
work_dir: /abs/path
mission: "Implement Handoff"
steps:
  - Step A
  - Step B
---
# Draft Content"""
            draft_path.write_text(draft_content)
            
            # 2. 新しい spawn の呼び出し
            # 現行: spawn(project_name, task_id, work_dir, tag, home_dir=None)
            # 新規案: spawn(local_draft_path, project_name=None, home_dir=None)
            project_name = "handoff-project"
            result_path = spawn(str(draft_path), project_name=project_name, home_dir=test_home)
            
            # 3. 検証: ローカル下書きが削除されていること (Handoff の完了)
            self.assertFalse(draft_path.exists())
            
            # 4. 検証: グローバル領域に配置されていること (SSOT への登録)
            self.assertTrue(result_path.exists())
            self.assertIn(project_name, str(result_path))
            
            # 5. 検証: 内容が置換されていること (コンテキストの注入)
            content = result_path.read_text()
            self.assertNotIn("task_id: PENDING", content)
            self.assertNotIn("parent_project_root: PENDING", content)
            self.assertNotIn("parent_branch: PENDING", content)
            self.assertIn("parent_task_tag: test-handoff", content)
            
        finally:
            if draft_path.exists():
                draft_path.unlink()
            if test_home.exists():
                shutil.rmtree(test_home)

class TestReportHandoff(unittest.TestCase):
    def test_report_handoff_success(self):
        """
        正常な Handoff 方式の report 検証
        - 報告書下書きの読み取りとバリデーション (PENDING 置換前)
        - 'task_id: PENDING' の指定 ID への置換
        - グローバル領域 (~/.gemini/...) への配置とローカル下書きの削除を確認。
        """
        test_home = pathlib.Path("./test_home_report_handoff")
        test_home.mkdir(exist_ok=True)
        draft_path = pathlib.Path("tmp_report_draft.md")
        
        try:
            task_id = "20260308-130000-WXYZ"
            # 1. 下書き準備
            draft_content = f"""---
status: success
task_id: PENDING
commits:
  - "feat: my change"
summary: "Finished"
next_actions: []
---"""
            draft_path.write_text(draft_content)
            
            # 2. ダミーのタスクディレクトリ準備
            project_name = "report-proj"
            task_dir = test_home / ".gemini" / "sub-sessions" / project_name / task_id
            task_dir.mkdir(parents=True)
            
            # 3. report 呼び出し
            # 現行: report(task_id, home_dir=None)
            # 新規案: report(local_draft_path, task_id, home_dir=None)
            result_path = report(str(draft_path), task_id, home_dir=test_home)
            
            # 4. 検証: ローカル削除とグローバル配置
            self.assertFalse(draft_path.exists())
            self.assertTrue(result_path.exists())
            self.assertIn("report.md", str(result_path))
            
            # 5. 検証: ID 置換
            content = result_path.read_text()
            self.assertIn(f"task_id: {task_id}", content)
            self.assertNotIn("task_id: PENDING", content)
            
        finally:
            if draft_path.exists():
                draft_path.unlink()
            if test_home.exists():
                shutil.rmtree(test_home)

    def test_report_overwrite_protection(self):
        """
        完了済みタスクへの上書き防止検証
        - 既に 'status: success' で提出済みのタスクに対し、別の報告書を提出しようとした場合に
          ValueError が送出されることを確認する。
        """
        test_home = pathlib.Path("./test_home_overwrite")
        test_home.mkdir(exist_ok=True)
        draft_path = pathlib.Path("tmp_report_overwrite.md")
        
        try:
            task_id = "20260308-Completed-Task"
            project_name = "overwrite-proj"
            task_dir = test_home / ".gemini" / "sub-sessions" / project_name / task_id
            task_dir.mkdir(parents=True)
            
            # 1. すでに success の報告書を置いておく
            existing_report = task_dir / "report.md"
            existing_report.write_text("---\nstatus: success\n---")
            
            # 2. 新しい報告を出そうとする
            draft_path.write_text("---\nstatus: failure\ntask_id: PENDING\nsummary: 'retry'\ncommits: []\nnext_actions: []\n---")
            
            # 3. 呼び出し。ValueError（または特定の上書きエラー）を期待
            with self.assertRaisesRegex(ValueError, "already reported as success"):
                report(str(draft_path), task_id, home_dir=test_home)
                
        finally:
            if draft_path.exists():
                draft_path.unlink()
            if test_home.exists():
                shutil.rmtree(test_home)

class TestListSessions(unittest.TestCase):
    def test_list_sessions_format(self):
        """list コマンドの出力形式検証"""
        test_home = pathlib.Path("./test_home_list")
        test_home.mkdir(exist_ok=True)
        
        try:
            # 1. テストデータの作成
            project_name = "list-proj"
            task_ids = ["20260308-1000-AAAA", "20260308-1100-BBBB"]
            tags = ["tag-a", "tag-b"]
            
            for tid, tag in zip(task_ids, tags):
                task_dir = test_home / ".gemini" / "sub-sessions" / project_name / tid
                task_dir.mkdir(parents=True)
                (task_dir / "task.md").write_text(f"---\ntask_id: {tid}\nparent_task_tag: {tag}\n---")
            
            # 2. list 呼び出し (stdout をキャプチャ)
            # 内部関数の list_sessions(home_dir=None) を想定
            from scripts.gemini_sub import list_sessions
            
            f = io.StringIO()
            with redirect_stdout(f):
                list_sessions(home_dir=test_home)
            output = f.getvalue()
            
            # 3. 検証
            self.assertIn("20260308-1000-AAAA", output)
            self.assertIn("tag-a", output)
            self.assertIn("20260308-1100-BBBB", output)
            self.assertIn("tag-b", output)
            
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

class TestShowCommands(unittest.TestCase):
    def test_show_task_success(self):
        """show-task の正常系検証"""
        test_home = pathlib.Path("./test_home_show")
        test_home.mkdir(exist_ok=True)
        try:
            tid = "20260308-SHOW-TASK"
            task_dir = test_home / ".gemini" / "sub-sessions" / "test-proj" / tid
            task_dir.mkdir(parents=True)
            content = "# Task content"
            (task_dir / "task.md").write_text(content)
            
            from scripts.gemini_sub import show_file
            f = io.StringIO()
            with redirect_stdout(f):
                show_file(tid, "task.md", home_dir=test_home)
            self.assertEqual(f.getvalue().strip(), content)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

    def test_show_report_success(self):
        """show-report の正常系検証"""
        test_home = pathlib.Path("./test_home_show_report")
        test_home.mkdir(exist_ok=True)
        try:
            tid = "20260308-SHOW-REPORT"
            task_dir = test_home / ".gemini" / "sub-sessions" / "test-proj" / tid
            task_dir.mkdir(parents=True)
            content = "# Report content"
            (task_dir / "report.md").write_text(content)
            
            from scripts.gemini_sub import show_file
            f = io.StringIO()
            with redirect_stdout(f):
                show_file(tid, "report.md", home_dir=test_home)
            self.assertEqual(f.getvalue().strip(), content)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

    def test_show_file_not_found(self):
        """存在しないファイルを表示しようとした際のエラー検証"""
        test_home = pathlib.Path("./test_home_not_found")
        test_home.mkdir(exist_ok=True)
        try:
            from scripts.gemini_sub import show_file
            with self.assertRaises(FileNotFoundError):
                show_file("INVALID-ID", "task.md", home_dir=test_home)
        finally:
            if test_home.exists():
                shutil.rmtree(test_home)

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
        """spawn が正しい内容の task.md を生成することを検証 (Handoff)"""
        test_home = pathlib.Path("./test_home_spawn")
        test_home.mkdir(exist_ok=True)
        draft_path = pathlib.Path("tmp_test_spawn.md")
        try:
            draft_content = """---
task_id: PENDING
parent_project_root: PENDING
parent_branch: PENDING
parent_task_tag: test-tag
work_dir: /abs/path
mission: "Test Mission"
steps:
  - Step 1
---"""
            draft_path.write_text(draft_content)
            
            project_name = "test-project"
            task_path = spawn(str(draft_path), project_name=project_name, home_dir=test_home)
            self.assertTrue(task_path.exists())
            content = task_path.read_text()
            self.assertNotIn("task_id: PENDING", content)
        finally:
            if draft_path.exists():
                draft_path.unlink()
            if test_home.exists():
                shutil.rmtree(test_home)

    def test_report_creates_correct_template(self):
        """report が正しい内容の report.md を配置することを検証 (Handoff)"""
        test_home = pathlib.Path("./test_home_report")
        test_home.mkdir(exist_ok=True)
        draft_path = pathlib.Path("tmp_test_report.md")
        try:
            task_id = "20260305-130000-EFGH"
            project_name = "test-project"
            task_dir = test_home / ".gemini" / "sub-sessions" / project_name / task_id
            task_dir.mkdir(parents=True)
            
            draft_content = f"""---
status: success
task_id: PENDING
commits: []
summary: "Final test"
next_actions: []
---"""
            draft_path.write_text(draft_content)
            
            report_path = report(str(draft_path), task_id, home_dir=test_home)
            self.assertTrue(report_path.exists())
            content = report_path.read_text()
            self.assertIn(f"task_id: {task_id}", content)
            self.assertIn("status: success", content)
        finally:
            if draft_path.exists():
                draft_path.unlink()
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
