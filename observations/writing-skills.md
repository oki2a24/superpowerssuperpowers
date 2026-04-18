# 知見：設計進化における三位一体の規律

## 概要
大規模な設計変更やスキルの刷新において、物理的構造（パス）と論理的品質（TDD）を切り離さず、視覚的に定着させるための規律。

## コア規律：三位一体 (The Trinity)
新しいスキルの作成、または既存スキルの大規模なリファクタリング（昇格等）を行う際、以下の三要素を同時に提示・検証しなければならない。

1.  **物理的構造 (Physical Structure)**:
    - 略称（`obs`等）を一切排除し、フルスペル（`observations`）での物理パスを明示せよ。
    - インストール後のパス（`~/.gemini/extensions/...`）を常に意識せよ。
2.  **論理的品質 (Logical Quality / RED-GREEN)**:
    - `writing-skills` の RED-GREEN-REFACTOR をドキュメント自体に適用せよ。
    - 知見を適用する前の「失敗（RED）」を物理的に証明せよ。
3.  **視覚的事実 (Visual Fact / AA図)**:
    - 複雑なパス構造や優先順位を AA 図（mermaid または text）で可視化せよ。
    - 別セッションの AI が一瞬で「事実」として認識できる状態にせよ。

## 昇格（Promote）時の注意
L3/L4 から L2 へ知見を昇格させる際は、この三位一体が満たされているかを `observation-distiller` で再検証せよ。

---

# 知見：writing-skills (Gemini固有)

<!-- IMPROVED_ON: 2026-02-27 | REASON: 自己改善システムの導入に伴い、ローカル・アダプテーションの記述形式とバックアップ/復旧の重要性を明記。 -->
<!-- IMPROVED_ON: 2026-02-28 | REASON: Mermaid記法の厳格化、セッション管理（リフレッシュ/再起動）の分離、および実証テストの義務化を反映。 -->
<!-- IMPROVED_ON: 2026-04-18 | REASON: 移植元アップデート追随に伴い、外部出典ドキュメント（Anthropic等）の用語・ツール読み替えガイドを追加。 -->

## 概要
`writing-skills` および `anthropic-best-practices.md` を使用する際、Gemini CLI 環境における適切な解釈とツールの読み替えを行うためのガイド。

## 外部出典ドキュメントの読み替え (Source Adaptation)
このプロジェクトのスキル作成ガイドラインは、Anthropic 社の Claude 向けベストプラクティスに基づいています。ドキュメント内の記述は、以下のマッピングに従って Gemini CLI 環境へ適応させてください。

### 用語・概念の読み替え
| オリジナル (Claude 向け) | Gemini CLI における解釈 | 備考 |
| :--- | :--- | :--- |
| **Claude** | **Gemini / エージェント** | 自身への指示として受け取る |
| **Claude Haiku** | **Gemini Flash** | 高速・経済的モデル |
| **Claude Sonnet** | **Gemini Pro** | バランスモデル |
| **Claude Opus** | **Gemini Ultra / Advanced** | 強力な推論モデル |
| **CLAUDE.md** | **GEMINI.md** | プロジェクト憲法・規約ファイル |
| **~/.claude/skills/** | **~/.gemini/skills/** | グローバルスキルディレクトリ |

### ツール名の読み替え
| Claude Code ツール | Gemini CLI 対応ツール |
| :--- | :--- |
| `Read` | `read_file` |
| `Write` | `write_file` |
| `Edit` | `replace` |
| `Bash` | `run_shell_command` |
| `Grep` | `grep_search` |
| `Glob` | `glob` |
| `Task` | `executing-plans` / `subagent-driven-development` |
| `TodoWrite` | `scripts/todo.mjs` (または `todo` ツール) |

## AIエージェントへの指示 (Gemini固有)
- **ソースの尊重**: `anthropic-best-practices.md` などの外部出典ドキュメントを編集する際は、安易に「Claude」を「Gemini」に置換せず、上記の読み替えガイドを優先せよ。
- **Mermaidの厳格な記述**: Markdown内でダイアグラムを記述する際は、必ず ` ```mermaid ` 言語指定を使用し、適切な Mermaid 記法（例: `graph TD`）で記述すること。
- **セッション管理の区別**:
    - **セッション・リフレッシュ**: 履歴を破棄してコンテキストを節約する行為。再開用プロンプトが必要。
    - **スキルの認識（再起動）**: `gemini --resume latest` を使い、履歴を保持したまま新しいスキルを読み込ませる行為。
- **実証テストの義務化**: スキルの検証において、単なるシミュレーションの報告は認められない。必ず具体的なファイル操作やタスク遂行を伴う「実証テスト」を実行し、その証拠を提示すること。
- **ローカル・アダプテーションの保護**: 移植済みスキルをアップデートする際は、既存の `## ローカル・アダプテーション (Gemini固有)` セクション（本知見ファイル等）を必ず確認し、新バージョン適用後も一貫性を維持すること。
