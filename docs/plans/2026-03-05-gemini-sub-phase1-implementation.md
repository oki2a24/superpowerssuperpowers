# gemini-sub (Phase 1) 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** サブセッションの起動 (`spawn`) と報告 (`report`) を制御する、外部依存のない Python スクリプト `scripts/gemini_sub.py` を実装する。

**アーキテクチャ:** 
- `scripts/gemini_sub.py` という単一の実行可能ファイルとして構成。
- サブセッションごとのデータは `~/.gemini/sub-sessions/<project_name>/<session_id>/` に集約。
- 環境変数 `GEMINI_SUB_LAUNCHER` を使用して、tmux, iTerm2, manual の起動モードを抽象化。

**技術スタック:** 
- Python 3 (標準ライブラリ: `pathlib`, `datetime`, `os`, `sys`, `json`, `subprocess`)

---

### タスク 1: 基本構造とセッションID生成のテスト

**ファイル:**
- 作成: `scripts/gemini_sub.py`
- テスト: `tests/test_gemini_sub.py`

**ステップ 1: 失敗するテストを作成**
セッション ID が `YYYYMMDD-HHMMSS` 形式で生成されることを確認するテスト。

```python
import unittest
import re
import sys
import os

# scripts ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.gemini_sub import generate_session_id

class TestGeminiSub(unittest.TestCase):
    def test_generate_session_id(self):
        session_id = generate_session_id()
        self.assertTrue(re.match(r"^\d{8}-\d{6}$", session_id))

if __name__ == "__main__":
    unittest.main()
```

**ステップ 2: テストが失敗することを確認するために実行**
実行: `python3 tests/test_gemini_sub.py`
期待値: `ImportError` または `AttributeError`

**ステップ 3: 最小限の実装を作成**
`scripts/gemini_sub.py` に `generate_session_id` を実装。

```python
import datetime

def generate_session_id():
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

if __name__ == "__main__":
    print(generate_session_id())
```

**ステップ 4: テストがパスすることを確認するために実行**
実行: `python3 tests/test_gemini_sub.py`
期待値: PASS

**ステップ 5: コミット**
```bash
git add scripts/gemini_sub.py tests/test_gemini_sub.py
git commit -m "feat: add session ID generation and base script"
```

---

### タスク 2: `spawn` コマンドの実装（ディレクトリと `task.md`）

**ファイル:**
- 変更: `scripts/gemini_sub.py`
- テスト: `tests/test_gemini_sub.py`

**ステップ 1: 失敗するテストを作成**
`spawn` メソッドが指定されたディレクトリに `task.md` を作成することを確認するテストケースを追加。

**ステップ 2: テストが失敗することを確認するために実行**
実行: `python3 tests/test_gemini_sub.py`

**ステップ 3: 最小限の実装を作成**
`pathlib` を使用して `~/.gemini/sub-sessions/` 配下にディレクトリを作成し、YAML Frontmatter を含む `task.md` を出力するロジックを `scripts/gemini_sub.py` に追加。

**ステップ 4: テストがパスすることを確認するために実行**
実行: `python3 tests/test_gemini_sub.py`

**ステップ 5: コミット**
```bash
git add scripts/gemini_sub.py tests/test_gemini_sub.py
git commit -m "feat: implement spawn command to generate task.md"
```

---

### タスク 3: ランチャー抽象化の実装

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**ステップ 1: 手動起動モードの実装**
`GEMINI_SUB_LAUNCHER=manual` の場合、次に実行すべき `gemini --resume <session_id>` コマンドを標準出力に表示するよう実装。

**ステップ 2: tmux モードの実装**
環境変数が `tmux` の場合、`tmux new-window` を実行する `subprocess.run` を追加。

**ステップ 3: 動作確認**
実際のターミナルで `python3 scripts/gemini_sub.py spawn` を実行し、期待されるコマンドが表示（またはウィンドウが起動）されるか確認。

**ステップ 4: コミット**
```bash
git commit -am "feat: add launcher abstraction (manual and tmux support)"
```

---

### タスク 4: `report` コマンドの実装

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**ステップ 1: `report.md` テンプレート生成の実装**
`scripts/gemini_sub.py report` 実行時に、設計書通りの YAML Frontmatter を持つ `report.md` をカレントディレクトリ（またはセッションディレクトリ）に生成。

**ステップ 2: 動作確認**
生成された `report.md` の内容を目視で確認。

**ステップ 3: コミット**
```bash
git commit -am "feat: implement report command to generate report.md template"
```

---

### タスク 5: パス検証と実行可能属性の付与

**ファイル:**
- 変更: `scripts/gemini_sub.py`

**ステップ 1: Shebang と実行権限**
ファイルの先頭に `#!/usr/bin/env python3` を追加し、実行権限を付与。
実行: `chmod +x scripts/gemini_sub.py`

**ステップ 2: コミット**
```bash
git commit -am "chore: make gemini_sub.py executable"
```
