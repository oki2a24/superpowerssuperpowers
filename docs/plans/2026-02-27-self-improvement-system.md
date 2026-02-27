# 自己改善システム 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** AIエージェントが実戦での学びを自律的にスキルファイルに反映し、かつ安全にリセットやアップデートができる仕組みを構築する。

**アーキテクチャ:**
1.  **物理的リセット**: Pythonスクリプト `scripts/reset_skill.py` により、スキルファイルの「ローカル・アダプテーション」セクションを削除可能にする。
2.  **受動的トリガー**: 開発完了スキル (`finishing-a-development-branch`) の終了時に改善提案を組み込む。
3.  **保護手順**: 移植メタスキル (`port-superpowers-skill`) のSOPを更新し、アップデート時の退避・再結合手順を定義する。

**技術スタック:** Python 3, Markdown, Shell Script

---

### タスク 1: リセットスクリプトの実装と単体テスト

**ファイル:**
- 作成: `scripts/reset_skill.py`
- 作成: `tests/test_reset_skill.py`

**ステップ 1: 失敗するテストを作成**
`tests/test_reset_skill.py` を作成し、指定したヘッダー以降が削除されることを検証するテストを書く。

**ステップ 2: テストが失敗することを確認するために実行**
実行: `../../venv/bin/python3 -m unittest tests/test_reset_skill.py`
期待値: FAIL (ModuleNotFoundError or FileNotFoundError)

**ステップ 3: 最小限の実装を作成**
`scripts/reset_skill.py` を作成し、`## ローカル・アダプテーション (Gemini固有)` 以降を削除するロジックを実装する。

**ステップ 4: テストがパスすることを確認するために実行**
実行: `../../venv/bin/python3 -m unittest tests/test_reset_skill.py`
期待値: PASS

**ステップ 5: コミット**
```bash
git add scripts/reset_skill.py tests/test_reset_skill.py
git commit -m "feat: スキルリセットスクリプトとテストを追加する"
```

### タスク 2: `finishing-a-development-branch` への改善提案プロセスの組み込み

**ファイル:**
- 変更: `.gemini/skills/finishing-a-development-branch/SKILL.md`

**ステップ 1: スキル定義の変更**
「後処理」のセクションに、実戦で得られた知見をスキルに反映すべきかユーザーに確認し、必要であれば `writing-skills` を起動する指示を追記する。

**ステップ 2: 目視確認**
変更後の `SKILL.md` を読み込み、デザインドキュメントの意図通りであることを確認する。

**ステップ 3: コミット**
```bash
git add .gemini/skills/finishing-a-development-branch/SKILL.md
git commit -m "feat: 開発完了時にスキルの改善提案を行うよう指示を追加する"
```

### タスク 3: `port-superpowers-skill` SOP の更新（アップデート保護）

**ファイル:**
- 変更: `.gemini/skills/port-superpowers-skill/SKILL.md`

**ステップ 1: SOPの更新**
「既存スキルのアップデート手順」セクションに、既存の「ローカル・アダプテーション」セクションを一時退避し、新バージョン適用後に再結合する具体的な手順を追加する。

**ステップ 2: コミット**
```bash
git add .gemini/skills/port-superpowers-skill/SKILL.md
git commit -m "feat: スキルアップデート時のローカル変更保護手順を追加する"
```

### タスク 4: 統合検証（シミュレーション）

**ファイル:**
- 作成: `.gemini/skills/test-dummy/SKILL.md`

**ステップ 1: ダミースキルの作成**
テスト用のダミースキルファイルを作成する。

**ステップ 2: ローカル・アダプテーションの手動追記**
ファイルを編集し、`## ローカル・アダプテーション (Gemini固有)` セクションを追加する。

**ステップ 3: リセットスクリプトの実行と検証**
`scripts/reset_skill.py` を実行し、追記したセクションが正しく削除され、元の状態に戻ることを確認する。

**ステップ 4: クリーンアップ**
ダミースキルファイルを削除する。

**ステップ 5: コミット（GEMINI.mdの更新を含む）**
`GEMINI.md` に今回の自己改善システムの導入について記録する。
```bash
git add GEMINI.md
git commit -m "docs: 自己改善システムの導入をGEMINI.mdに記録する"
```
