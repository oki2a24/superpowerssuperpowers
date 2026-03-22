# Extension 堅牢化 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`subagent-driven-development`スキルを使用してください。

**目標:** Git 非依存動作の実現、ディレクトリの自動生成、および UX の改善により、あらゆるプロジェクト環境で Superpowers 拡張機能を安定動作させる。

**アーキテクチャ:** 
- `todo.mjs`: Git 失敗を検知し、`default` ブランチ名ではなく `TODO.md` へのフォールバックを実装。
- `todo.mjs`: 書き込み時のディレクトリ存在チェックを共通化し、`init` 以外でも安全に動作させる。
- `gemini_sub.mjs`: ファイル生成時のパス出力を ANSI カラーで強調し、視認性を向上させる。

**技術スタック:** Node.js, ANSI Colors

---

### タスク 1: todo.mjs の Git 非依存化とディレクトリ自動生成

**ファイル:**
- 変更: `scripts/todo.mjs`

**ステップ 1: Git 判定ロジックの修正**
- `getBranchName` が失敗した際にエラー出力を抑制し、静かに `null` を返すように変更。
- `getTodoPath` でブランチ名が取得できない場合、`TODO.md` を返すように変更。

**ステップ 2: ディレクトリ自動生成の共通化**
- `ensureDir(path)` 関数を作成し、`init`, `add`, `start`, `done` の書き込み直前で呼び出す。

**ステップ 3: テスト (Git なし環境)**
- `mkdir /tmp/no-git-test && cd /tmp/no-git-test`
- `node <path>/todo.mjs init` を実行。
- `TODO.md` が作成されることを確認。

**ステップ 4: コミット**
```bash
git add scripts/todo.mjs
git commit -m "fix(todo): enable non-git operation and automatic directory creation"
```

---

### タスク 2: gemini_sub.mjs の生成パス視認性向上

**ファイル:**
- 変更: `scripts/gemini_sub.mjs`

**ステップ 1: 出力メッセージのカラー化**
- `createFromTemplate` 内の `console.log` に ANSI カラーを追加。
- 生成された下書きファイルの絶対パスを表示するように変更。

**ステップ 2: 検証**
- `node scripts/gemini_sub.mjs new-task` を実行。
- パスが強調表示されることを確認。

**ステップ 3: コミット**
```bash
git add scripts/gemini_sub.mjs
git commit -m "feat(sub): improve visibility of generated draft paths"
```
