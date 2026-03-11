# Node.js 移行 (gemini_sub) 実装計画

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `scripts/gemini_sub.py` を Node.js (v25.8.0, ESM) へ移植し、`node:test` を用いた検証をパスさせる。

**アーキテクチャ:** 
現在の Python 実装（行ベースのステートマシンによる YAML パーサ）を Node.js に忠実に移植し、試行錯誤の背景を含むコメントを継承する。`node:fs` と `node:child_process` を使用し、CLI 引数は `node:util` の `parseArgs` で処理する。

**技術スタック:** Node.js v25.8.0 (ESM), `node:fs`, `node:path`, `node:child_process`, `node:util`, `node:test`, `node:assert`

---

### タスク 1: Node.js 版 gemini_sub.mjs の雛形作成 (TDD)

**ファイル:**
- 作成: `scripts/gemini_sub.mjs`
- テスト作成: `tests/test_gemini_sub.mjs`

**ステップ 1: 失敗するテストを作成 (YAML パースの基本)**

Python 版の `TestFrontmatterValidation` を参考に、日本語の解説を含むテストを記述します。

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseYamlFrontmatter } from '../scripts/gemini_sub.mjs';

describe('YAML Parser', () => {
  test('should parse simple key-value pairs', () => {
    /**
     * 正常な Frontmatter の基本パースをテストします。
     * - キー: 値 のペアが正しくオブジェクトに変換されること。
     * - クォートの除去が正しく行われること。
     */
    const yamlText = 'title: "Hello World"\nmission: "Test Mission"';
    const result = parseYamlFrontmatter(yamlText);
    assert.deepStrictEqual(result, { title: 'Hello World', mission: 'Test Mission' });
  });
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: "parseYamlFrontmatter is not a function" 等で FAIL

**ステップ 3: Python 版を基に parseYamlFrontmatter を移植 (コメント含む)**

Python 版 `scripts/gemini_sub.py` の `validate_frontmatter` 内にある「実装の背景と苦労した点」のコメントをそのまま移植します。

**ステップ 4: テストがパスすることを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: PASS

**ステップ 5: コミット**

```bash
git add scripts/gemini_sub.mjs tests/test_gemini_sub.mjs
git commit -m "feat: Node.js 版 gemini_sub に YAML パーサを移植する (TDD)"
```

---

### タスク 2: バリデーションとエラーメッセージの移植 (TDD)

**ステップ 1: 失敗するテストを作成 (異常系とリスト形式)**

Python 版の `test_invalid_yaml_syntax`, `test_invalid_list_type` 等を移植します。

```javascript
test('should throw error for invalid yaml syntax', () => {
  /**
   * YAML 構文エラーの検知をテストします。
   * - 裸のコロンが2つ以上ある場合、簡易パーサーではクォートを要求するように設計。
   */
  const content = 'invalid: : yaml';
  assert.throws(() => parseYamlFrontmatter(content), {
    message: 'YAML syntax error: Invalid value \': yaml\' (Try quoting it)'
  });
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: 異常系のテストが FAIL

**ステップ 3: 最小限の実装を追加 (バリデーションロジック)**

Python 版の `validate_frontmatter` にあるエラーチェックを `scripts/gemini_sub.mjs` に実装します。

**ステップ 4: テストがパスすることを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: PASS

**ステップ 5: コミット**

```bash
git add scripts/gemini_sub.mjs tests/test_gemini_sub.mjs
git commit -m "feat: gemini_sub に YAML バリデーションとエラーメッセージを実装する (TDD)"
```

---

### タスク 3: CLI 引数処理と Git 操作の移植 (TDD)

**ステップ 1: 失敗するテストを作成 (コマンド実行と引数パース)**

`node:child_process` のモック（またはテスト用ディレクトリ）を使用し、`spawn` や `report` コマンドの挙動をテストします。

```javascript
test('should parse CLI arguments correctly', () => {
  /**
   * CLI 引数のパースをテストします。
   * - util.parseArgs を使用して spawn コマンドとファイルパスを正しく取得できること。
   */
  // ... 引数パースのテストロジック
});
```

**ステップ 2: テストが失敗することを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: FAIL

**ステップ 3: 最小限の実装を作成 (メインロジックの移植)**

`node:util` の `parseArgs` を使用し、Python 版の `if __name__ == "__main__":` 以降のロジックを移植します。

**ステップ 4: テストがパスすることを確認するために実行**

実行: `node --test tests/test_gemini_sub.mjs`
期待値: PASS

**ステップ 5: コミット**

```bash
git add scripts/gemini_sub.mjs tests/test_gemini_sub.mjs
git commit -m "feat: gemini_sub の CLI 引数処理とメインロジックを移植する (TDD)"
```

