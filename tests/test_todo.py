
import os
import unittest
from unittest.mock import patch, mock_open, call
from datetime import datetime
import sys
from io import StringIO
import subprocess # subprocessをモックするためにインポート

from scripts import todo

class TestTodoScript(unittest.TestCase):

    # テスト後に生成されたファイルをクリーンアップするためのセットアップ
    def setUp(self):
        self.test_dir = os.path.join(".gemini", "tasks")
        # Ensure the directory exists before starting tests that might need it
        os.makedirs(self.test_dir, exist_ok=True)
        self.todo_file_path = os.path.join(self.test_dir, "TODO-test-feature-branch.md")
        # テスト実行前にファイルが存在する場合は削除
        if os.path.exists(self.todo_file_path):
            os.remove(self.todo_file_path)

    # 各テストメソッドの後に実行されるクリーンアップ
    def tearDown(self):
        if os.path.exists(self.todo_file_path):
            os.remove(self.todo_file_path)
        # .gemini/tasks ディレクトリが空になったら削除
        # ただし、複数のテストが同じディレクトリを使う場合は注意が必要
        # ここでは、このテストスイートで作成されたファイルのみを削除する
        if os.path.exists(self.test_dir) and not os.listdir(self.test_dir):
            os.rmdir(self.test_dir)


    @patch('scripts.todo.get_branch_name')
    def test_init_creates_file_with_header(self, mock_get_branch_name):
        """
        `init` コマンドが正しいヘッダーを持つ新しいTODOファイルを作成することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        test_title = "My New Task"
        mock_get_branch_name.return_value = test_branch
        
        expected_path = os.path.join(".gemini", "tasks", f"TODO-{test_branch}.md")
        today_str = datetime.now().strftime('%Y-%m-%d')
        
        # --- 実行 ---
        todo.init(test_title)
        
        # --- 検証 ---
        # 1. ファイルが存在することを確認 (モックではなく実際のファイルシステムで)
        self.assertTrue(os.path.exists(expected_path))
        
        # 2. ファイルの内容を確認
        with open(expected_path, "r") as f:
            written_content = f.read()
        
        # ヘッダーの各部分が存在することを確認
        self.assertIn(f"# TASK: {test_title}", written_content)
        self.assertIn(f"- Branch: {test_branch}", written_content)
        self.assertIn(f"- Created: {today_str}", written_content)


    @patch('scripts.todo.get_branch_name')
    def test_add_appends_task_to_file(self, mock_get_branch_name):
        """
        `add` コマンドが新しいタスクをTODOファイルに追記することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        test_title = "Initial Task List"
        first_task = "Buy groceries"
        second_task = "Do laundry"
        mock_get_branch_name.return_value = test_branch

        # initでファイルを作成しておく
        todo.init(test_title)

        # --- 実行 ---
        todo.add(first_task)
        todo.add(second_task)

        # --- 検証 ---
        # ファイルの内容を確認
        with open(self.todo_file_path, "r") as f:
            content = f.read()
        
        # タスクが正しい形式で追記されていることを確認
        self.assertIn(f"- [ ] {first_task}\n", content)
        self.assertIn(f"- [ ] {second_task}\n", content)

        # タスクが既存のコンテンツの後に追記されていることを確認 (順序も含む)
        init_header_end_index = content.find(f"- Created: {datetime.now().strftime('%Y-%m-%d')}")
        first_task_index = content.find(f"- [ ] {first_task}")
        second_task_index = content.find(f"- [ ] {second_task}")

        self.assertGreater(first_task_index, init_header_end_index, "最初のタスクはヘッダーの後にあるべきです。")
        self.assertGreater(second_task_index, first_task_index, "2番目のタスクは1番目のタスクの後にあるべきです。")


    @patch('scripts.todo.get_branch_name')
    @patch('sys.stdout', new_callable=StringIO) # sys.stdoutをモック
    def test_show_displays_file_content(self, mock_stdout, mock_get_branch_name):
        """
        `show` コマンドがTODOファイルの内容を標準出力に表示することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        test_title = "Shopping List"
        task1 = "Apples"
        task2 = "Milk"
        mock_get_branch_name.return_value = test_branch

        # ファイルを初期化し、タスクを追加
        todo.init(test_title)
        todo.add(task1)
        todo.add(task2)

        # 期待される出力内容を構築 (ファイルの内容と一致するはず)
        expected_output_prefix = f"\n--- {os.path.basename(self.todo_file_path)} ---"
        with open(self.todo_file_path, "r") as f:
            expected_file_content = f.read().rstrip('\n') # show関数のrstrip('\n')に合わせる
        expected_full_output = expected_output_prefix + expected_file_content

        # --- 実行 ---
        todo.show()

        # --- 検証 ---
        # 標準出力の内容を確認
        self.assertEqual(expected_full_output, mock_stdout.getvalue())

    @patch('scripts.todo.get_branch_name')
    @patch('sys.stdout', new_callable=StringIO)
    def test_show_no_active_todo_message_if_file_not_exists(self, mock_stdout, mock_get_branch_name):
        """
        TODOファイルが存在しない場合に `show` コマンドが特定のメッセージを表示することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        
        # ファイルが存在しない状態を確実にする (setUpで削除されているはず)
        self.assertFalse(os.path.exists(self.todo_file_path))

        # --- 実行 ---
        todo.show()

        # --- 検証 ---
        # 標準出力の内容が期待されるメッセージであることを確認
        self.assertEqual("No active TODO for this branch.", mock_stdout.getvalue())


    @patch('scripts.todo.get_branch_name')
    def test_start_marks_first_matching_task_as_in_progress(self, mock_get_branch_name):
        """
        `start` コマンドが、最初に一致する未完了タスクを進行中 (`[/]`) に変更することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        todo.init("Tasks")
        todo.add("Task 1")
        todo.add("Task 2 [Important]")
        todo.add("Task 3")

        # --- 実行 ---
        todo.start("Task 2")

        # --- 検証 ---
        with open(self.todo_file_path, "r") as f:
            content = f.read()
        self.assertIn("- [/] Task 2 [Important]\n", content)
        self.assertIn("- [ ] Task 1\n", content) # 他のタスクは変更されない
        self.assertIn("- [ ] Task 3\n", content)

    @patch('scripts.todo.get_branch_name')
    @patch('sys.stdout', new_callable=StringIO)
    @patch('sys.exit')
    def test_start_exits_if_task_already_in_progress(self, mock_exit, mock_stdout, mock_get_branch_name):
        """
        既に進行中のタスクがある場合に `start` コマンドがエラーを表示して終了することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        todo.init("Tasks")
        todo.add("Task 1")
        todo.add("Task 2")
        todo.start("Task 1") # 最初のタスクを開始状態にする

        # --- 実行 ---
        todo.start("Task 2") # 別のタスクを開始しようとする

        # --- 検証 ---
        self.assertIn("ERROR: 他のタスクが実行中です。先に完了させてください。", mock_stdout.getvalue())
        mock_exit.assert_called_once_with(1)

    @patch('scripts.todo.get_branch_name')
    @patch('sys.stdout', new_callable=StringIO)
    @patch('sys.exit')
    def test_start_exits_if_no_matching_task_found(self, mock_exit, mock_stdout, mock_get_branch_name):
        """
        一致する未完了タスクが見つからない場合に `start` コマンドがエラーを表示して終了することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        todo.init("Tasks")
        todo.add("Task 1")

        # --- 実行 ---
        todo.start("NonExistent Task")

        # --- 検証 ---
        self.assertIn("Error: Task matching 'NonExistent Task' not found or already started.", mock_stdout.getvalue())
        mock_exit.assert_called_once_with(1)

    @patch('scripts.todo.get_branch_name')
    def test_done_marks_in_progress_task_as_completed(self, mock_get_branch_name):
        """
        `done` コマンドが現在進行中のタスク (`[/]`) を完了 (`[x]`) に変更することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        todo.init("Tasks")
        todo.add("Task A")
        todo.add("Task B")
        todo.start("Task A") # Task Aを進行状態にする

        # --- 実行 ---
        todo.done()

        # --- 検証 ---
        with open(self.todo_file_path, "r") as f:
            content = f.read()
        self.assertIn("- [x] Task A\n", content)
        self.assertIn("- [ ] Task B\n", content) # 他のタスクは変更されない

    @patch('scripts.todo.get_branch_name')
    @patch('sys.stdout', new_callable=StringIO)
    def test_done_no_in_progress_task_message_if_none(self, mock_stdout, mock_get_branch_name):
        """
        進行中のタスクがない場合に `done` コマンドが特定のメッセージを表示することをテストします。
        """
        # --- 前準備 ---
        test_branch = "test-feature-branch"
        mock_get_branch_name.return_value = test_branch
        todo.init("Tasks")
        todo.add("Task A")

        # --- 実行 ---
        todo.done()

        # --- 検証 ---
        self.assertEqual("No in-progress task found to mark as DONE.", mock_stdout.getvalue())


    @patch('sys.argv', ['todo.py'])
    @patch('sys.stdout', new_callable=StringIO)
    @patch('sys.exit')
    def test_main_exits_with_usage_if_no_args(self, mock_exit, mock_stdout):
        """
        引数なしで `main` を呼び出した場合、使用方法が表示され `sys.exit(1)` が呼び出されることをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        self.assertIn("Usage: todo.py [init|add|start|done|show] [args]", mock_stdout.getvalue())
        mock_exit.assert_called_once_with(1)

    @patch('sys.argv', ['todo.py', 'init', 'My Title'])
    @patch('scripts.todo.init')
    def test_main_calls_init_with_args(self, mock_init):
        """
        `main` が `init` コマンドと引数を適切に呼び出すことをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        mock_init.assert_called_once_with('My Title')

    @patch('sys.argv', ['todo.py', 'add', 'New Task'])
    @patch('scripts.todo.add')
    def test_main_calls_add_with_args(self, mock_add):
        """
        `main` が `add` コマンドと引数を適切に呼び出すことをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        mock_add.assert_called_once_with('New Task')

    @patch('sys.argv', ['todo.py', 'start', 'Task 1'])
    @patch('scripts.todo.start')
    def test_main_calls_start_with_args(self, mock_start):
        """
        `main` が `start` コマンドと引数を適切に呼び出すことをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        mock_start.assert_called_once_with('Task 1')

    @patch('sys.argv', ['todo.py', 'done'])
    @patch('scripts.todo.done')
    def test_main_calls_done(self, mock_done):
        """
        `main` が `done` コマンドを適切に呼び出すことをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        mock_done.assert_called_once()

    @patch('sys.argv', ['todo.py', 'show'])
    @patch('scripts.todo.show')
    def test_main_calls_show(self, mock_show):
        """
        `main` が `show` コマンドを適切に呼び出すことをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        mock_show.assert_called_once()

    @patch('sys.argv', ['todo.py', 'invalid_command'])
    @patch('sys.stdout', new_callable=StringIO)
    @patch('sys.exit')
    def test_main_exits_with_usage_if_invalid_command(self, mock_exit, mock_stdout):
        """
        不正なコマンドで `main` を呼び出した場合、使用方法が表示され `sys.exit(1)` が呼び出されることをテストします。
        """
        # --- 実行 ---
        todo.main()

        # --- 検証 ---
        self.assertIn("Usage: todo.py [init|add|start|done|show] [args]", mock_stdout.getvalue())
        mock_exit.assert_called_once_with(1)

    @patch('scripts.todo.subprocess.check_output')
    def test_get_branch_name_returns_correct_name(self, mock_check_output):
        """
        `get_branch_name` が実際の Git コマンドを実行し、正しいブランチ名を返すことをテストします。
        """
        # --- 前準備 ---
        mock_check_output.return_value = b'feature/my-new-feature\n'

        # --- 実行 ---
        branch_name = todo.get_branch_name()

        # --- 検証 ---
        mock_check_output.assert_called_once_with(["git", "rev-parse", "--abbrev-ref", "HEAD"])
        self.assertEqual("feature-my-new-feature", branch_name)

    @patch('scripts.todo.subprocess.check_output', side_effect=subprocess.CalledProcessError(1, "git"))
    def test_get_branch_name_returns_default_on_error(self, mock_check_output):
        """
        `get_branch_name` が Git コマンドでエラーが発生した場合に "default" を返すことをテストします。
        """
        # --- 実行 ---
        branch_name = todo.get_branch_name()

        # --- 検証 ---
        self.assertEqual("default", branch_name)
