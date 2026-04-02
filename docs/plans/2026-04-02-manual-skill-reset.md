# manual-skill-reset 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `skills/writing-skills/SKILL.md` を「階層化 Observations アーキテクチャ」に完全に適合させ、不要な「ローカル・アダプテーション」セクションを排除するとともに、拡張機能のバージョンを `v1.4.5` へ更新する。

**アーキテクチャ:** 
1.  物理的な削除: `writing-skills/SKILL.md` 末尾の `## ローカル・アダプテーション (Gemini固有)` セクションを削除。
2.  論理的な修正: スキル定義内の指示を、`observations/` への蒸留に関する内容に書き換える。
3.  バージョニング: `gemini-extension.json` の `version` をインクリメント。

**技術スタック:** なし（JSON/Markdown 編集）

---

### タスク 1: SKILL.md のクリーンアップと修正

**ファイル:**
- 変更: `skills/writing-skills/SKILL.md`

**ステップ 1: 不要セクションの削除**

`## ローカル・アダプテーション (Gemini固有)` 以降をすべて削除し、ファイル末尾を空行1つで終わらせる。

**ステップ 2: 指示内容の置換**

「ローカル・アダプテーションの追加 (Gemini CLI固有)」セクション（L136辺り）を、「知見の蒸留 (Observations)」に関する指示に書き換える。

### タスク 2: 拡張機能のバージョンアップ

**ファイル:**
- 変更: `gemini-extension.json`

**ステップ 1: バージョンの更新**

`version`: `"1.4.4"` を `"1.4.5"` に変更する。

### タスク 3: 完了の検証 (DoD)

**ステップ 1: 物理的残存の確認**

実行: `grep -r "ローカル・アダプテーション" skills/`
期待値: ヒットしないこと。

**ステップ 2: コミット**

```bash
git add skills/writing-skills/SKILL.md gemini-extension.json
git commit -m "chore: writing-skills の現代化とバージョンアップ (v1.4.5)"
```
