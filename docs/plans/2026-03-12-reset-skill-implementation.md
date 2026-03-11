# reset_skill.mjs 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `scripts/reset_skill.py` を Node.js (v25.8.0, ESM) に移植し、スキルファイルのリセット機能を単体テスト付きで提供する。

**アーキテクチャ:** Node.js 標準ライブラリ (`node:fs`, `node:path`, `node:test`) を使用した ESM モジュール。ファイルを文字列として読み込み、正規表現またはインデックス検索で特定セクションを削除する。

**技術スタック:** Node.js v25.8.0 (Standard Library only)

---

### 物理的 I/O 定義

- **入力**: 
    - CLI 引数: `process.argv.slice(2)` (スキルファイルのパスの配列)
    - ファイル読み込み: `fs.readFileSync(filePath, 'utf8')`
- **出力**:
    - ファイル書き込み: `fs.writeFileSync(filePath, updatedContent)`
    - 戻り値: `resetSkillFile(filePath)` は変更があれば `true`、なければ `false` を返す。
    - 標準出力: エラー時のみ `console.error` (または Python 版に合わせる)

---

### タスク 1: テスト環境の準備と最初の失敗するテスト (RED)

**ファイル:**
- 作成: `tests/test_reset_skill.mjs`

**ステップ 1: 失敗するテストを作成**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resetSkillFile } from '../scripts/reset_skill.mjs';

test('resetSkillFile should remove the local adaptation section', async (t) => {
  const tempFile = path.join(process.cwd(), 'tests/temp_skill.md');
  const content = `
# Sample Skill
## Instructions
Do something.

## ローカル・アダプテーション (Gemini固有)
Extra info.
`;
  fs.writeFileSync(tempFile, content.trim() + '\n');

  try {
    const result = resetSkillFile(tempFile);
    assert.strictEqual(result, true, 'Should return true when section is removed');
    
    const updatedContent = fs.readFileSync(tempFile, 'utf8');
    const expected = `# Sample Skill\n## Instructions\nDo something.\n`;
    assert.strictEqual(updatedContent, expected, 'Content should be reset correctly');
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_reset_skill.mjs`
期待値: `Error: Cannot find module '../scripts/reset_skill.mjs'` で FAIL

**ステップ 3: 最小限のファイルを作成**

作成: `scripts/reset_skill.mjs` (中身は空、または `export function resetSkillFile() {}`)

**ステップ 4: コミット**

```bash
git add tests/test_reset_skill.mjs scripts/reset_skill.mjs
git commit -m "test: reset_skill.mjs の最初のテストケースを追加する"
```

---

### タスク 2: `resetSkillFile` の基本実装 (GREEN)

**ファイル:**
- 変更: `scripts/reset_skill.mjs`

**ステップ 1: 最小限の実装を作成**

```javascript
import fs from 'node:fs';

const TARGET_HEADER = "## ローカル・アダプテーション (Gemini固有)";

/**
 * 指定されたスキルファイルからローカル・アダプテーションセクションを削除します。
 *
 * @param {string} filePath - リセットするスキルファイルへのパス。
 * @returns {boolean} 正常にセクションが削除された場合は true、セクションが見つからないかファイルが存在しない場合は false。
 */
export function resetSkillFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const index = content.indexOf(TARGET_HEADER);

  if (index === -1) return false;

  let newContent = content.slice(0, index);
  
  // 直前の空行を削除してクリーンアップ
  newContent = newContent.trimEnd();
  
  // 末尾に改行を保証
  if (newContent && !newContent.endsWith('\n')) {
    newContent += '\n';
  }

  fs.writeFileSync(filePath, newContent);
  return true;
}
```

**ステップ 2: テストがパスすることを確認するために実行**

実行: `node --test tests/test_reset_skill.mjs`
期待値: PASS

**ステップ 3: コミット**

```bash
git add scripts/reset_skill.mjs
git commit -m "feat: resetSkillFile の基本ロジックを実装する"
```

---

### タスク 3: エッジケースのテストと実装の洗練 (RED/GREEN)

**ファイル:**
- 変更: `tests/test_reset_skill.mjs`
- 変更: `scripts/reset_skill.mjs`

**ステップ 1: エッジケースのテストを追加 (RED)**
- ヘッダーが存在しない場合。
- ファイルが存在しない場合。
- 複数回の空行がある場合。

**ステップ 2: 実装の修正と検証 (GREEN)**
Python 版の「ヘッダー直前の不要な空行を削除し、クリーンな状態にする」ロジックを忠実に再現する。

**ステップ 3: コミット**

```bash
git add tests/test_reset_skill.mjs scripts/reset_skill.mjs
git commit -m "test: reset_skill.mjs のエッジケース対応とロジックの洗練"
```

---

### タスク 4: CLI インターフェースの完成 (RED/GREEN)

**ファイル:**
- 変更: `tests/test_reset_skill.mjs`
- 変更: `scripts/reset_skill.mjs`

**ステップ 1: CLI の振る舞いを検証するテストを追加 (RED)**

```javascript
test('CLI should show usage when no arguments provided', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync('node', ['scripts/reset_skill.mjs'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1, 'Should exit with code 1');
  assert.match(result.stdout, /使用法:/, 'Should show usage message');
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_reset_skill.mjs`
期待値: `reset_skill.mjs` が空、あるいは `main` 未実装のため FAIL

**ステップ 3: `main` 関数とエントリポイントの実装 (GREEN)**

```javascript
/**
 * スクリプトのエントリーポイント。
 */
export function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("使用法: node reset_skill.mjs <スキルファイルのパス> ...");
    process.exit(1);
  }

  for (const path of args) {
    resetSkillFile(path);
  }
}

// 直接実行された場合
import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
```

**ステップ 4: テストがパスすることを確認するために実行**

実行: `node --test tests/test_reset_skill.mjs`
期待値: PASS

**ステップ 5: コミット**

```bash
git add scripts/reset_skill.mjs tests/test_reset_skill.mjs
git commit -m "feat: reset_skill.mjs の CLI インターフェースを TDD で実装する"
```
