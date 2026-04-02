# Superpowersスキルのテスト (Gemini CLI 移植版)

> [!NOTE]
> このドキュメントは `superpowers-original/docs/testing.md` から移植されました。
> 内容は Claude Code 向けに記述されていますが、テストの設計思想や検証ポイントは Gemini CLI でも共通です。
> `claude` コマンドや `.jsonl` 解析に関する記述は、Gemini CLI の環境（`tests/*.mjs` やツール実行履歴）に適宜読み替えてください。

---

# Superpowersスキルのテスト

このドキュメントでは、Superpowers スキル、特に `subagent-driven-development` のような複雑なスキルの統合テスト方法について説明します。

## 概要 (Overview)

サブエージェント、ワークフロー、および複雑な相互作用を伴うスキルのテストには、実際の Claude Code セッションをヘッドレスモードで実行し、セッションログ（transcripts）を通じてその挙動を検証する必要があります。

## テスト構造 (Test Structure)

```
tests/
├── claude-code/
│   ├── test-helpers.sh                    # 共有テストユーティリティ
│   ├── test-subagent-driven-development-integration.sh
│   ├── analyze-token-usage.py             # トークン分析ツール
│   └── run-skill-tests.sh                 # テストランナー（存在する場合）
```

## テストの実行 (Running Tests)

### 統合テスト (Integration Tests)

統合テストは、実際のスキルを使用してリアルな Claude Code セッションを実行します。

```bash
# subagent-driven-development の統合テストを実行する
cd tests/claude-code
./test-subagent-driven-development-integration.sh
```

**注意:** 統合テストは複数のサブエージェントによる実際の実装計画を実行するため、完了までに 10〜30 分かかる場合があります。

### 要件 (Requirements)

- **superpowers プラグインディレクトリ**から実行する必要があります（一時ディレクトリからではありません）。
- Claude Code がインストールされ、`claude` コマンドが利用可能である必要があります。
- ローカル開発マーケットプレイスが有効である必要があります（`~/.claude/settings.json` の `enabledPlugins` に `"superpowers@superpowers-dev": true` が設定されていること）。

## 統合テスト: subagent-driven-development (Integration Test: subagent-driven-development)

### 検証内容 (What It Tests)

この統合テストでは、`subagent-driven-development` スキルが以下を正しく行っているかを検証します。

1. **計画の読み込み (Plan Loading)**: 開始時に一度だけ計画を読み込んでいるか。
2. **タスクの完全なテキスト (Full Task Text)**: サブエージェントに不完全な情報ではなく、完全なタスク説明を提供しているか（サブエージェントにファイルを読み込ませる手間を省いているか）。
3. **自己レビュー (Self-Review)**: サブエージェントが報告前に自己レビューを実行しているか。
4. **レビューの順序 (Review Order)**: 仕様準拠レビューをコード品質レビューより先に実行しているか。
5. **レビューループ (Review Order)**: 問題が見つかった場合にレビューループが使用されているか。
6. **独立した検証 (Independent Verification)**: 仕様レビューアが実装者の報告を鵜呑みにせず、独立してコードを読み込んでいるか。

### 動作の仕組み (How It Works)

1. **セットアップ (Setup)**: 最小限の実装計画を含む一時的な Node.js プロジェクトを作成します。
2. **実行 (Execution)**: ヘッドレスモードでスキルと共に Claude Code を実行します。
3. **検証 (Verification)**: セッションログ（`.jsonl` ファイル）を解析し、以下を確認します：
   - スキルツールが呼び出されたか。
   - サブエージェントがディスパッチされたか（Task ツール）。
   - TodoWrite が追跡に使用されたか。
   - 実装ファイルが作成されたか。
   - テストをパスしたか。
   - Git コミットが適切なワークフローを示しているか。
4. **トークン分析 (Token Analysis)**: サブエージェントごとのトークン使用量の内訳を表示します。

### テスト出力例 (Test Output)

```
========================================
 Integration Test: subagent-driven-development
========================================

Test project: /tmp/tmp.xyz123

=== Verification Tests ===

Test 1: Skill tool invoked...
  [PASS] subagent-driven-development skill was invoked

Test 2: Subagents dispatched...
  [PASS] 7 subagents dispatched

Test 3: Task tracking...
  [PASS] TodoWrite used 5 time(s)

Test 6: Implementation verification...
  [PASS] src/math.js created
  [PASS] add function exists
  [PASS] multiply function exists
  [PASS] test/math.test.js created
  [PASS] Tests pass

Test 7: Git commit history...
  [PASS] Multiple commits created (3 total)

Test 8: No extra features added...
  [PASS] No extra features added

=========================================
 Token Usage Analysis
=========================================

Usage Breakdown:
----------------------------------------------------------------------------------------------------
Agent           Description                          Msgs      Input     Output      Cache     Cost
----------------------------------------------------------------------------------------------------
main            Main session (coordinator)             34         27      3,996  1,213,703 $   4.09
3380c209        implementing Task 1: Create Add Function     1          2        787     24,989 $   0.09
34b00fde        implementing Task 2: Create Multiply Function     1          4        644     25,114 $   0.09
3801a732        reviewing whether an implementation matches...   1          5        703     25,742 $   0.09
4c142934        doing a final code review...                    1          6        854     25,319 $   0.09
5f017a42        a code reviewer. Review Task 2...               1          6        504     22,949 $   0.08
a6b7fbe4        a code reviewer. Review Task 1...               1          6        515     22,534 $   0.08
f15837c0        reviewing whether an implementation matches...   1          6        416     22,485 $   0.07
----------------------------------------------------------------------------------------------------

TOTALS:
  Total messages:         41
  Input tokens:           62
  Output tokens:          8,419
  Cache creation tokens:  132,742
  Cache read tokens:      1,382,835

  Total input (incl cache): 1,515,639
  Total tokens:             1,524,058

  Estimated cost: $4.67
  (at $3/$15 per M tokens for input/output)

========================================
 Test Summary
========================================

STATUS: PASSED
```

## トークン分析ツール (Token Analysis Tool)

### 使用法 (Usage)

任意の Claude Code セッションからトークン使用量を分析します。

```bash
python3 tests/claude-code/analyze-token-usage.py ~/.claude/projects/<project-dir>/<session-id>.jsonl
```

### セッションファイルの探し方 (Finding Session Files)

セッションログは `~/.claude/projects/` に、作業ディレクトリのパスをエンコードした名前で保存されます。

```bash
# 例: /Users/jesse/Documents/GitHub/superpowers/superpowers の場合
SESSION_DIR="$HOME/.claude/projects/-Users-jesse-Documents-GitHub-superpowers-superpowers"

# 最近のセッションを探す
ls -lt "$SESSION_DIR"/*.jsonl | head -5
```

### 表示内容 (What It Shows)

- **メインセッションの使用量**: コーディネーター（あなた、またはメインの Claude インスタンス）によるトークン使用量。
- **サブエージェントごとの内訳**: 各 Task 呼び出しごとの以下を表示：
  - エージェント ID
  - 説明（プロンプトから抽出）
  - メッセージ数
  - 入力/出力トークン
  - キャッシュ使用量
  - 推定コスト
- **合計**: 全体のトークン使用量とコストの見積もり。

### 出力の理解 (Understanding the Output)

- **High cache reads**: 良好 - プロンプトキャッシュが機能していることを意味します。
- **High input tokens on main**: 正常 - コーディネーターはフルコンテキストを持っています。
- **Similar costs per subagent**: 正常 - 各サブエージェントは同様のタスクの複雑さを受け取ります。
- **Cost per task**: 一般的な範囲は、タスクごとに $0.05〜$0.15 です。

## トラブルシューティング (Troubleshooting)

### スキルがロードされない (Skills Not Loading)

**問題**: ヘッドレステストの実行時にスキルが見つからない。

**解決策**:
1. 必ず superpowers ディレクトリから実行しているか確認してください: `cd /path/to/superpowers && tests/...`
2. `~/.claude/settings.json` の `enabledPlugins` に `"superpowers@superpowers-dev": true` が含まれているか確認してください。
3. `skills/` ディレクトリにスキルが存在するか確認してください。

### 権限エラー (Permission Errors)

**問題**: Claude がファイルの書き込みやディレクトリへのアクセスをブロックされる。

**解決策**:
1. `--permission-mode bypassPermissions` フラグを使用してください。
2. `--add-dir /path/to/temp/dir` を使用して、テストディレクトリへのアクセスを許可してください。
3. テストディレクトリのファイル権限を確認してください。

### テストのタイムアウト (Test Timeouts)

**問題**: テストに時間がかかりすぎてタイムアウトする。

**解決策**:
1. タイムアウト時間を延長してください: `timeout 1800 claude ...` (30 分)。
2. スキルロジックに無限ループがないか確認してください。
3. サブエージェントのタスクの複雑さを見直してください。

### セッションファイルが見つからない (Session File Not Found)

**問題**: テスト実行後にセッションログが見つからない。

**解決策**:
1. `~/.claude/projects/` 内の正しいプロジェクトディレクトリを確認してください。
2. `find ~/.claude/projects -name "*.jsonl" -type f -mmin -60` を使用して最近のセッションを探してください。
3. テストが実際に実行されたか確認してください（テスト出力にエラーがないか確認）。

## 新しい統合テストの作成 (Writing New Integration Tests)

### テンプレート (Template)

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# テストプロジェクトを作成
TEST_PROJECT=$(create_test_project)
trap "cleanup_test_project $TEST_PROJECT" EXIT

# テストファイルを設定...
cd "$TEST_PROJECT"

# スキルを指定して Claude を実行
PROMPT="Your test prompt here"
cd "$SCRIPT_DIR/../.." && timeout 1800 claude -p "$PROMPT" \
  --allowed-tools=all \
  --add-dir "$TEST_PROJECT" \
  --permission-mode bypassPermissions \
  2>&1 | tee output.txt

# セッションを探して分析
WORKING_DIR_ESCAPED=$(echo "$SCRIPT_DIR/../.." | sed 's/\\//-/g' | sed 's/^-//')
SESSION_DIR="$HOME/.claude/projects/$WORKING_DIR_ESCAPED"
SESSION_FILE=$(find "$SESSION_DIR" -name "*.jsonl" -type f -mmin -60 | sort -r | head -1)

# セッションログを解析して挙動を確認
if grep -q '"name":"Skill".*"skill":"your-skill-name"' "$SESSION_FILE"; then
    echo "[PASS] Skill was invoked"
fi

# トークン分析を表示
python3 "$SCRIPT_DIR/analyze-token-usage.py" "$SESSION_FILE"
```

### ベストプラクティス (Best Practices)

1. **常にクリーンアップする (Always cleanup)**: trap を使用して一時ディレクトリを必ず削除してください。
2. **ログを解析する (Parse transcripts)**: ユーザー向けの出力ではなく、`.jsonl` セッションファイルを解析してください。
3. **権限を許可する (Grant permissions)**: `--permission-mode bypassPermissions` と `--add-dir` を使用してください。
4. **プラグインディレクトリから実行する (Run from plugin dir)**: スキルは superpowers ディレクトリから実行された場合にのみロードされます。
5. **トークン使用量を表示する (Show token usage)**: コストの可視化のために常にトークン分析を含めてください。
6. **実際の挙動をテストする (Test real behavior)**: ファイルが実際に作成されたか、テストがパスしたか、コミットが行われたかを確認してください。

## セッションログの形式 (Session Transcript Format)

セッションログは JSONL (JSON Lines) 形式で、各行がメッセージまたはツール結果を表す JSON オブジェクトです。

### 主要なフィールド (Key Fields)

```json
{
  "type": "assistant",
  "message": {
    "content": [...],
    "usage": {
      "input_tokens": 27,
      "output_tokens": 3996,
      "cache_read_input_tokens": 1213703
    }
  }
}
```

### ツール結果 (Tool Results)

```json
{
  "type": "user",
  "toolUseResult": {
    "agentId": "3380c209",
    "usage": {
      "input_tokens": 2,
      "output_tokens": 787,
      "cache_read_input_tokens": 24989
    },
    "prompt": "You are implementing Task 1...",
    "content": [{"type": "text", "text": "..."}]
  }
}
```

`agentId` フィールドはサブエージェントセッションにリンクしており、`usage` フィールドにはその特定のサブエージェント呼び出しのトークン使用量が含まれます。
