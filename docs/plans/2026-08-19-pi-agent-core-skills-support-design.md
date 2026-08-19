# Pi Agent Core Skills Support Design

## Overview
/superpowerssuperpowers リポジトリ内の全コアスキル群を Pi エージェント環境に対応・調和させるための設計書です。
Pi エージェント上でのスキル呼び出し手順を `using-superpowers` スキルに明示し、個別スキル内の特定プラットフォーム依存の表記を一般化します。

## Target Files & Changes

### 1. `skills/using-superpowers/SKILL.md`
- **`description`**:
  - スキル起動機構の例に Pi での `read` ツール呼び出しまたは `/skill:name` コマンドを追加。
- **`## スキルへのアクセス方法`**:
  - Pi エージェント向けのセクションを追加:
    - **Pi エージェントにおいて:** Pi ネイティブのスキル機構（`read` ツールでスキルの `SKILL.md` を読み込むか、人間パートナーが `/skill:name` を使用）でスキルをロードして起動します（詳細は `references/pi-tools.md` を参照）。
- **`## プラットフォーム適応 (Platform Adaptation)`**:
  - `[pi-tools.md](references/pi-tools.md)` への参照リンクが正常に配置されていることを確認。

### 2. コアスキル群における表記の一般化
特定のプラットフォーム専用ツール名（例: `activate_skill`）を指している箇所を、マルチプラットフォーム対応の一般的なアクション表現（例: 「スキルを起動して」等）へと整理・更新します。
- `skills/executing-plans/SKILL.md`: `activate_skill` 表記を一般的なスキル起動表現へ変更
- `skills/systematic-debugging/SKILL.md`: `activate_skill('test-driven-development')` をスキル起動指示に変更
- `skills/writing-plans/SKILL.md`: `activate_skill` 表記を一般的なスキル起動表現へ変更

### 3. `docs/superpowers_ports.md`
- Pi エージェント全コアスキル対応の履歴を記録。

## Verification Plan
1. `skills/using-superpowers/SKILL.md` および各スキルの変更内容が誤解の余地なく矛盾がないかセルフレビューを実施。
2. Git 状態を確認しコミットを作成。
