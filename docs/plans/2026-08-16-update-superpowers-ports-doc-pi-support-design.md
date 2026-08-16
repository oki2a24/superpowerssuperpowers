# デザインドキュメント: `update-superpowers-ports-doc` スキルの Pi CLI 対応

**日付:** 2026-08-16  
**ステータス:** 承認済み  
**トピック:** `update-superpowers-ports-doc` スキルの Pi CLI 互換性向上  

---

## 1. 概要と目的

`update-superpowers-ports-doc` スキル（`.agents/skills/update-superpowers-ports-doc/SKILL.md`）は、移植されたスキルの詳細およびコミットハッシュで `docs/superpowers_ports.md` を自動更新するための標準手動ツールです。

本デザインでは、ファイル配置（`.agents/skills/`）は維持したまま、本リポジトリで **Pi CLI** を起動した際にも本スキルがスムーズに認識・実行できるように修正します。既存の Pi スキル自動検出機能およびツールマッピング構造（`skills/using-superpowers/references/pi-tools.md`）を活用します。

---

## 2. アーキテクチャと設計原則

### 2.1 ネイティブ自動検出
- Pi CLI は `.agents/skills/<skill-name>/SKILL.md` 配下のスキルを自動的に検出します。
- ファイルの移動やシンボリックリンク配置は不要であり、`.agents/skills/update-superpowers-ports-doc/SKILL.md` を唯一の真実 (SSOT) とします。

### 2.2 ツール抽象化とリファレンスマッピング
- `write_file` のような特定の単一プラットフォーム向けツール固有名の指定を廃止し、アクション指向のリクエスト（ファイル読み込み、ファイル編集/書き込み、シェルコマンド実行）に置き換えます。
- `skills/using-superpowers/references/pi-tools.md` を参照する明示的なガイダンスを追加します：
  - **ファイル読み込み**: `read` (Pi) / `view_file` (Antigravity) / `Read` (Claude)
  - **ファイル編集/書き込み**: `edit` または `write` (Pi) / `replace_file_content` または `write_to_file` (Antigravity) / `Edit` または `Write` (Claude)
  - **シェルコマンド実行**: `bash` (Pi) / `run_command` (Antigravity) / `Bash` (Claude)

---

## 3. `SKILL.md` の詳細変更内容

対象ファイル: `.agents/skills/update-superpowers-ports-doc/SKILL.md`

### 更新セクション:
1. **概要・ヘッダー**:
   - Pi, Antigravity, Claude Code, Gemini CLI 等のマルチプラットフォーム対応を明記。
2. **実装プロトコル (Platform Independent Protocol)**:
   - ツールのマッピング解釈のため `skills/using-superpowers/references/pi-tools.md` への参照を明記。
   - 各ステップ（読み込み、コミットハッシュ確認、書き込み・更新、Gitコミット）を抽象アクション表現で記述。
3. **コアパターン**:
   - 手順5の `write_file` 表記を「ファイル編集/書き込みツールで保存」へ更新。

---

## 4. 検証およびテスト戦略

1. スキルの内容が `view_file` / `read` 等で正しく読み込めるか検証。
2. `docs/superpowers_ports.md` のフォーマットがスキルのロジックと一致しているか確認。
3. Git コミットプロシージャのシミュレーション検証。
