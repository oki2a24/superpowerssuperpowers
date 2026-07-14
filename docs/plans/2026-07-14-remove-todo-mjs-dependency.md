# todo.mjs 依存関係の排除とチェックボックス管理への統一 実装計画

**目標:**
agy 等の環境で `todo.mjs` への依存を排除し、実装計画やスキル内のチェックボックス (`- [ ]`) を直接更新することで進捗を管理する方式にスキル群を統一する。

**アーキテクチャ:**
- `todo.mjs` を含む Fallback / Native-First の記述を廃止。
- 代わりに、実装計画書やスキル自身の Markdown チェックリストを進捗管理の SSOT (Single Source of Truth) として定義する。

**技術スタック:**
- Markdown (SKILL.md 修正)

**グローバル制約:**
- 既存の日本語表現のトーンを維持する。
- 修正後の記述が他のプラットフォームやシステムに対しても汎用的であるようにする。

---

### タスク 1: brainstorming/SKILL.md の修正

**ファイル:**
- 変更: `skills/brainstorming/SKILL.md:20-26`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L22-25 を削除し、以下に置き換える。
  ```markdown
  以下の各項目について、**計画ファイルまたはこのスキルの各ステップのチェックボックス（`- [ ]`）を更新して進捗を追跡します。**
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(brainstorming): replace todo.mjs fallback with checkbox progress tracking"`

---

### タスク 2: executing-plans/SKILL.md の修正

**ファイル:**
- 変更: `skills/executing-plans/SKILL.md:24-28`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L24-27 を削除し、以下に置き換える。
  ```markdown
  4. **タスク化**: 懸念がない場合、計画項目のチェックボックス（`- [ ]`）を更新して進捗を追跡します。
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(executing-plans): replace todo.mjs with checklist progress tracking"`

---

### タスク 3: using-superpowers/SKILL.md の修正

**ファイル:**
- 変更: `skills/using-superpowers/SKILL.md:65-70`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  Mermaid 内の以下の部分：
  ```mermaid
  E -- "はい" --> F["各項目に対するtodoを作成"]
  F --> G_PATH["Native-First: 優先。<br/>Fallback: 必要なら todo.mjs 等を併用。"]
  G_PATH --> G
  ```
  を以下に修正する：
  ```mermaid
  E -- "はい" --> F["各項目に対するチェックリスト（- [ ]）を作成"]
  F --> G["チェックリストを更新して進捗を追跡"]
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する.
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(using-superpowers): update Mermaid flow to use checklist for progress tracking"`

---

### タスク 4: test-driven-development/SKILL.md の修正

**ファイル:**
- 変更: `skills/test-driven-development/SKILL.md:66-69`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L66-69 を削除し、以下に置き換える。
  ```markdown
  **進捗管理:** このスキルの各ステップのチェックボックス（`- [ ]`）を更新して進捗を追跡します。
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(tdd): replace todo.mjs fallback with checklist progress tracking"`

---

### タスク 5: systematic-debugging/SKILL.md の修正

**ファイル:**
- 変更: `skills/systematic-debugging/SKILL.md:66-70`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L66-69 を削除し、以下に置き換える。
  ```markdown
  2.  次に、このスキルの各ステップのチェックボックス（`- [ ]`）を更新して進捗を追跡します。
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(debugging): replace todo.mjs with checklist progress tracking"`

---

### タスク 6: writing-skills/SKILL.md の修正

**ファイル:**
- 変更: `skills/writing-skills/SKILL.md:610-611`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L610 を削除し、以下に置き換える。
  ```markdown
  **重要：以下の各チェックリスト項目のチェックボックス（`- [ ]`）を更新して進捗を追跡します。**
  ```
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(writing-skills): unify checklist progress tracking wording"`

---

### タスク 7: subagent-driven-development/SKILL.md の修正

**ファイル:**
- 変更: `skills/subagent-driven-development/SKILL.md:71-72`

**インターフェース (Interfaces):**
- なし

- [ ] **ステップ 1: 該当箇所の修正**
  L71 の：
  `4. **タスクリストの作成:** 各タスクに対してtoDoを作成します。`
  を以下に置き換える：
  `4. **進捗管理の準備:** 計画ファイル内または進捗台帳にタスクのチェックボックスを作成して進捗を追跡します。`
- [ ] **ステップ 2: 検証**
  `git diff` で意図通りの修正が反映されていることを確認する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs(sdd): update progress tracking rule to use file-based checklist"`

---

### タスク 8: 全体テストと確認

- [ ] **ステップ 1: テストスイートの実行**
  `for f in tests/test_*.mjs; do node $f; done` を実行して、スキル修正によってテストが破損していないことを確認する。
- [ ] **ステップ 2: superpowers_ports.md の更新**
  本セッションでの変更コミットハッシュを含めて `docs/superpowers_ports.md` を更新する。
- [ ] **ステップ 3: コミット**
  `git commit -m "docs: update superpowers_ports.md for todo.mjs removal"`
