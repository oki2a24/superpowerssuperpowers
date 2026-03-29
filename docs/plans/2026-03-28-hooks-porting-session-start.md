# Hooks Porting (SessionStart) 実装計画 (TDD Strict)

> **AIエージェントへの指示**: この計画をタスクごとに実装するには、移植された`executing-plans`スキルを使用してください。

**目標:** `superpowers-original` の `session-start.sh` フックを Node.js (`.mjs`) に移植し、Gemini CLI のエクステンションとして自動ロードされるようにする。

**アーキテクチャ:** 
- `hooks/session-start.mjs`: `using-superpowers/SKILL.md` を読み込み、`SessionStart` フックが期待する JSON 形式（`additionalContext`）で標準出力する。
- `hooks/hooks.json`: Gemini CLI 用のフック定義。`${extensionPath}` を使用する。

**技術スタック:** Node.js (Standard Library only), `node:test` (Test Runner)

---

### タスク 1: Node.js フックスクリプトの実装 (TDD)

**スキル:** `test-driven-development`, `port-superpowers-skill`

**ファイル:**
- 作成: `hooks/session-start.mjs`
- テスト: `tests/test_hook_output.mjs`
- 参照: `skills/using-superpowers/SKILL.md`

**ステップ 1: [RED] 失敗するテストを作成**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('hooks/session-start.mjs - 正常系: 正しいJSON構造とスキル内容を出力すること', () => {
  try {
    // フックを実行し、出力をパースする
    const output = execSync('node hooks/session-start.mjs').toString();
    const json = JSON.parse(output);
    
    // 期待される構造とコンテンツが含まれているか検証
    assert.strictEqual(json.hookSpecificOutput.hookEventName, "SessionStart");
    assert.ok(json.hookSpecificOutput.additionalContext.includes('<EXTREMELY_IMPORTANT>'));
  } catch (e) {
    if (e.code === 'ENOENT' || e.message.includes('Cannot find module')) {
      throw new Error('実装ファイル hooks/session-start.mjs が見つかりません');
    }
    throw e;
  }
});
```

**ステップ 2: [RED] テストの失敗を確認**
実行: `node tests/test_hook_output.mjs` (または `npm test` 等プロジェクト標準のコマンド)
期待値: ファイル未存在 (Cannot find module) によるエラー（FAIL）

**ステップ 3: [GREEN] 最小限の実装を作成**

```javascript
#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// プロジェクトルート（hooks/ の親）を特定
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  try {
    // 1. using-superpowers スキルの内容を読み込む
    const skillPath = path.join(PROJECT_ROOT, 'skills', 'using-superpowers', 'SKILL.md');
    let skillContent = '';
    if (fs.existsSync(skillPath)) {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    } else {
      console.error(`Skill file not found: ${skillPath}`);
    }

    // 2. Gemini CLI Hook 形式の JSON を作成して stdout に出力
    const output = {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: `<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'using-superpowers' skill - your introduction to using skills. For all other skills, use the 'activate_skill' tool:**\n\n${skillContent}\n</EXTREMELY_IMPORTANT>`
      }
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    console.error('Hook error:', err);
    process.exit(1);
  }
}

main();
```

**ステップ 4: [GREEN] テストのパスを確認**
実行: `node tests/test_hook_output.mjs`
期待値: PASS

**ステップ 5: コミット**
```bash
git add hooks/session-start.mjs tests/test_hook_output.mjs
git commit -m "feat: session-startフックをTDDで実装する"
```

### タスク 2: hooks.json の作成 (TDD-like)

**スキル:** `port-superpowers-skill`, `verification-before-completion`

**ファイル:**
- 作成: `hooks/hooks.json`

**ステップ 1: [RED] 設定の欠如を確認**
実行: `ls hooks/hooks.json`
期待値: "No such file or directory" (FAIL)

**ステップ 2: [GREEN] フック定義の作成**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node ${extensionPath}${/}hooks${/}session-start.mjs",
            "async": true
          }
        ]
      }
    ]
  }
}
```

**ステップ 3: [GREEN] 設定の存在と内容を確認**
実行: `cat hooks/hooks.json`
期待値: 作成した JSON が正しく表示されること (PASS)

**ステップ 4: コミット**
```bash
git add hooks/hooks.json
git commit -m "feat: hooks.jsonを作成しSessionStartフックを登録する"
```

### タスク 3: 移植情報の記録 (TDD-like)

**スキル:** `update-superpowers-ports-doc`, `verification-before-completion`

**ファイル:**
- 変更: `docs/superpowers_ports.md`

**ステップ 1: [RED] 記録の欠如を確認**
実行: `grep "SessionStart" docs/superpowers_ports.md`
期待値: マッチなし (FAIL)

**ステップ 2: [GREEN] 記録の実行**
`activate_skill(name="update-superpowers-ports-doc")` を使用して情報を追記します。

**ステップ 3: [GREEN] 記録の存在を確認**
実行: `grep "SessionStart" docs/superpowers_ports.md`
期待値: マッチすること (PASS)

**ステップ 4: コミット**
```bash
git commit -am "docs: フックの移植情報を記録する"
```

### タスク 4: 動作検証と完了報告

**スキル:** `verification-before-completion`, `session-retrospective`

**ステップ 1: 物理チェックの実行**
実行: `node scripts/finish_check.mjs`
期待値: 不整合がないこと。

**ステップ 2: 完了報告の作成**
DoD チェックリストに基づき報告を行い、`session-retrospective` で知見を永続化する。
- [ ] **Cleanup**: テスト用ファイルの扱い（`tests/test_hook_output.mjs`）の確認。
- [ ] **Doc Sync**: `docs/superpowers_ports.md` への反映。
- [ ] **Versioning**: `gemini-extension.json` の更新要否確認。
- [ ] **Git Integrity**: 未コミット変更がないこと。
