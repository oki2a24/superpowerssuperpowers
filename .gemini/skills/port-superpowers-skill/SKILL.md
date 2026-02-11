---
name: port-superpowers-skill
description: "obra/superpowersのスキルをGemini CLIに手動で移植するための標準作業手順書（SOP）に従って、AIエージェントをガイドします。"
---

# Superpowersスキル移植ガイド

このスキルは、`obra/superpowers`からGemini CLIへのスキル移植プロセスを、以下の標準作業手順書（SOP）に従ってガイドします。

## 手動スキル移植の標準作業手順書(SOP)

1.  **移植対象スキルの決定と環境設定の確認**:
    *   **AIエージェントへの指示**: まず、移植対象のSuperpowersスキル名をユーザーに尋ねてください。（例: brainstorming, using-git-worktrees）
    *   **AIエージェントへの指示**: 次に、`superpowers-original`リポジトリの正確なパスを確認します。もしパスが不明な場合は、`ls -d ../superpowers-original`などを実行して確認し、正しいパスを特定してください。

2.  **元のSKILL.mdの読み込みと理解**:
    *   決定されたスキル名を使って、移植対象となる`superpowers-original/skills/{skill_name}/SKILL.md`を読み込みます。
    *   読み込んだ内容から、スキルの目的、ワークフロー、意図を詳細に理解します。

3.  **Gemini CLIへの適応分析**:
    *   スキルの核となる目的とパラメータ、トリガー条件を特定します。
    *   元のSKILL.md内でClaude固有の記述（例: `/plugin`コマンド、`Task("...")`、`CLAUDE.md`への参照、`digraph`ブロック、`superpowers:`プレフィックスのスキル呼び出し）をリストアップします。
    *   これらのClaude固有の要素をGemini CLIの既存機能（`run_shell_command`、`write_file`、`write_todos`、対話など）でどのように代替または表現するかを検討し、具体案を立案します。
    *   必要に応じて、ユーザーに追加の質問を行います。

4.  **Gemini CLI用SKILL.mdのドラフト作成**:
    *   上記の分析に基づき、Gemini CLI形式の新しい`SKILL.md`のコンテンツをドラフトします。
    *   コンテンツは以下の構造を原則とします。
        *   YAMLフロントマター (`name`, `description`, `parameters`)
        *   トップレベルの見出し (`# <Skill Name>`)
        *   `## Overview` (スキルの概要と目的)
        *   `## The Process` (スキルの実行手順。AIが実行すべき具体的なステップ)
        *   `## 参考情報` (元のSKILL.mdにあったが、直接的な指示ではない情報。例: `Quick Reference`, `Common Mistakes`, `Example Workflow`, `Red Flags`, `Integration`など。必要に応じて要約・整形します)
    *   元のSKILL.mdに記述されていた、エージェントへの直接的な指示（例:「Announce at start」のような部分）は、新しい`SKILL.md`の`instructions`内で適切に表現されるようにします。

5.  **新規SKILL.mdの作成とコミット**:
    *   作成したSKILL.mdのドラフトを、`./.gemini/skills/{skill_name}/SKILL.md`として`write_file`ツールで書き込みます。
    *   Gitに`git add`し、コミットメッセージ「feat: <skill_name>スキルを移植する (SKILL.md)」でコミットします。

6.  **移植スキルのテスト計画**:
    *   移植したスキルがGemini CLI環境で意図通りに動作することを確認するためのテスト計画を立案します。
    *   必要に応じて、`activate_skill`を使ってスキルを実際に実行し、動作を確認します。

7.  **SOPの継続的な改善**:
    *   移植作業を通じて得られた新しい知見や改善点は、このSOPにフィードバックし、常に最新かつ最適な手順となるように更新します。
