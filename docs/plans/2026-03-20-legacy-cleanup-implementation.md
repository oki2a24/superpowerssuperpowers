# レガシー・クリーンアップ 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** スキル指示の Node.js 化、物理的な Python 関連ファイルの削除、およびドキュメントの更新を行い、プロジェクトを完全に Node.js 準拠の状態にする。

**アーキテクチャ:**
1.  **一括置換**: 全スキルファイルおよびエージェントプロンプト内の `python3 scripts/todo.py` を `node scripts/todo.mjs` へ置換。
2.  **物理的クリーンアップ**: 不要となった `venv/` ディレクトリの削除。
3.  **整合性修正**: スクリプト内のヘルプメッセージおよびテストコードの修正。
4.  **最終検証**: 全テストスイートの実行による退行確認。

**技術スタック:** Node.js, Shell (sed/rm), Git

---

### 構造可視化 (Structure / Hierarchy)
```text
Project Root/
├── .gemini/
│   ├── skills/ (Update: node scripts/todo.mjs)
│   └── tasks/
├── agents/
│   └── task-manager.md (Update: node scripts/todo.mjs)
├── scripts/
│   └── todo.mjs (Fix: Help message)
├── tests/
│   └── test_todo_core.mjs (Fix: Test expectation)
├── README.md (Update: Remove Python requirement)
└── venv/ (Delete)
```

---

### タスク 1: スキル指示およびエージェントプロンプトの Node.js 化

**ファイル:**
- 変更: `.gemini/skills/**/*.md`
- 変更: `agents/task-manager.md`

**ステップ 1: 置換のプレビュー実行**
実行: `grep -r "python3 scripts/todo.py" .gemini/skills/ agents/`
期待値: 複数のヒットが表示されること。

**ステップ 2: 一括置換の実行**
実行: `find .gemini/skills/ agents/ -name "*.md" -type f -exec sed -i '' 's/python3 scripts\/todo.py/node scripts\/todo.mjs/g' {} +`
実行: `find .gemini/skills/ agents/ -name "*.md" -type f -exec sed -i '' 's/scripts\/todo.py/scripts\/todo.mjs/g' {} +`

**ステップ 3: 置換結果の確認**
実行: `grep -r "python3 scripts/todo.py" .gemini/skills/ agents/`
期待値: ヒットが 0 件であること。

**ステップ 4: コミット**
実行: `git add .gemini/skills/ agents/`
実行: `git commit -m "chore: migrate todo script references from Python to Node.js in skills and agents"`

---

### タスク 2: スクリプトおよびテストの磨き上げ

**ファイル:**
- 変更: `scripts/todo.mjs:405-436`
- 変更: `tests/test_todo_core.mjs:121`

**ステップ 1: `todo.mjs` のヘルプメッセージ修正**
`scripts/todo.mjs` 内の `todo.py` を `todo.mjs` に置換します。

**ステップ 2: `test_todo_core.mjs` の期待値修正**
テストコード内の `Usage: todo.py` 判定を `Usage: todo.mjs` に修正します。

**ステップ 3: テストの実行 (Todo Core)**
実行: `node tests/test_todo_core.mjs`
期待値: すべてパスすること。

**ステップ 4: コミット**
実行: `git add scripts/todo.mjs tests/test_todo_core.mjs`
実行: `git commit -m "chore: update todo.mjs help message and related tests"`

---

### タスク 3: 物理的クリーンアップとドキュメント更新

**ファイル:**
- 削除: `venv/`
- 変更: `README.md`
- 変更: `docs/TODO.md`

**ステップ 1: `venv/` ディレクトリの削除**
実行: `rm -rf venv/`

**ステップ 2: `README.md` の Python 要件削除**
`README.md` から Python 3.x への言及を削除し、Node.js への完全準拠を記述します。

**ステップ 3: `docs/TODO.md` の更新**
「スキル内の Node.js 移行」タスクを完了（`[x]`）にします。

**ステップ 4: コミット**
実行: `git add README.md docs/TODO.md`
実行: `git rm -r venv/ --cached` (もし追跡されていれば)
実行: `git commit -m "chore: remove venv and update documentation to reflect Node.js-only requirement"`

---

### タスク 4: 全テストによる最終検証

**ステップ 1: 全テストの実行**
実行: `for f in tests/*.mjs; do echo "Running $f..."; node "$f" || exit 1; done`
期待値: すべてのテスト（`test_gemini_sub.mjs`, `test_reset_skill.mjs`, `test_todo_*.mjs`）がパスすること。

**ステップ 2: 最終確認**
実行: `grep -r "python3" .` (サブモジュールを除く)
期待値: 歴史的ドキュメントやサブモジュール以外に Python の実用的な参照がないこと。

**ステップ 3: コミット (必要あれば)**
実行: `git status` で残存物がないか確認。
