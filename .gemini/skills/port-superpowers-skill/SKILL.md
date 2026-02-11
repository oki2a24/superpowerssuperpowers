---
name: port-superpowers-skill
description: "obra/superpowersのスキルをGemini CLIに手動で移植するための標準作業手順書（SOP）に従って、AIエージェントをガイドします。"
---

# Superpowersスキル移植ガイド

このスキルは、`obra/superpowers`からGemini CLIへのスキル移植プロセスを、以下の標準作業手順書（SOP）に従ってガイドします。

## 手動スキル移植の標準作業手順書(SOP)

1.  **移植対象スキルの決定と環境設定の確認**:
    *   **AIエージェントへの指示**: まず、移植対象のSuperpowersスキル名をユーザーに尋ねてください。（例: brainstorming, using-git-worktrees）
    *   **AIエージェントへの指示**: `superpowers-original`リポジトリの正確なパスを確認します。もしパスが不明な場合は、`ls -d ../superpowers-original`などを実行して確認し、正しいパスを特定してください。パスが確定したら、「`superpowers-original`リポジトリのパスは`[確定したパス]`です。」と報告し、次のステップに進むかユーザーに確認してください。

2.  **元のSKILL.mdの読み込みと理解**:
    *   決定されたスキル名と`superpowers-original`のパスを使って、移植対象となる`{superpowers_original_path}/skills/{skill_name}/SKILL.md`を読み込みます。
    *   読み込んだ内容から、スキルの目的、ワークフロー、意図を詳細に理解します。理解が完了したら、その概要をユーザーに報告し、次のステップに進むか確認してください。

3.  **Gemini CLIへの適応分析**:
    *   スキルの核となる目的とパラメータ、トリガー条件を特定します。
    *   元のSKILL.md内でClaude固有の記述（例: `/plugin`コマンド、`Task("...")`、`CLAUDE.md`への参照、`digraph`ブロック、`superpowers:`プレフィックスのスキル呼び出し）をリストアップします。
    *   これらのClaude固有の要素をGemini CLIの既存機能（`run_shell_command`、`write_file`、`write_todos`、対話など）でどのように代替または表現するかを検討し、具体案を立案します。
    *   分析結果と代替案をユーザーに提示し、必要に応じて追加の質問を行ってください。ユーザーの承認を得てから次のステップに進んでください。

4.  **Gemini CLI用SKILL.mdのドラフト作成**:
    *   上記の分析に基づき、Gemini CLI形式の新しい`SKILL.md`のコンテンツをドラフトします。
    *   コンテンツは以下の構造を原則とします。
        *   YAMLフロントマター (`name`, `description`)
        *   **AIエージェントへの指示**: `parameters`ブロックは原則として含めないでください。必要な情報は、スキルの`instructions`内でエージェントがユーザーに質問して取得するように設計してください。
        *   トップレベルの見出し (`# <Skill Name>`)
        *   `## Overview` (スキルの概要と目的)
        *   `## The Process` (スキルの実行手順。AIが実行すべき具体的なステップ)
        *   `## 参考情報` (元のSKILL.mdにあったが、直接的な指示ではない情報。例: `Quick Reference`, `Common Mistakes`, `Example Workflow`, `Red Flags`, `Integration`など。必要に応じて要約・整形します)
    *   元のSKILL.mdに記述されていた、エージェントへの直接的な指示（例:「Announce at start」のような部分）は、新しい`SKILL.md`の`instructions`内で適切に表現されるようにします。
    *   ドラフトが完成したら、ユーザーに提示し、レビューと承認を求めてください。

5.  **新規SKILL.mdの作成とコミット**:
    *   ユーザーの承認を得たSKILL.mdのドラフトを、`./.gemini/skills/{skill_name}/SKILL.md`として`write_file`ツールで書き込みます。
    *   Gitに`git add`し、コミットメッセージ「feat: <skill_name>スキルを移植する (SKILL.md)」でコミットします。コミットが完了したら、その旨を報告し、次のステップに進むか確認してください。

6.  **Gemini CLIの再起動と認識の確認**:
    *   **AIエージェントへの指示**: 作成したスキルをGemini CLIが認識するために、ユーザーにGemini CLIの再起動を依頼してください。
    *   **AIエージェントへの指示**: 再起動手順として、「現在のセッションを`Ctrl+C`で終了し、ターミナルで`gemini --resume latest`を実行してください。」と伝えてください。
    *   再起動後、`gemini skills list`を実行して、移植したスキルが正しく認識されていることを確認します。

7.  **移植スキルのテスト計画と実行**:
    *   移植したスキルがGemini CLI環境で意図通りに動作することを確認するためのテスト計画を立案します。
    *   必要に応じて、`activate_skill`を使ってスキルを実際に実行し、動作を確認します。テスト結果をユーザーに報告し、次のステップに進むか確認してください。

8.  **SOPの継続的な改善と次のスキルへの着手**:
    *   移植作業を通じて得られた新しい知見や改善点は、このSOPにフィードバックし、常に最新かつ最適な手順となるように更新します。
    *   ユーザーに次のスキル移植に進むか、別のタスクに進むかを確認してください。
