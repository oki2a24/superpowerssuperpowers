# 最終レビューと締め処理

superpowers:subagent-driven-development の一部。計画の全タスクが完了しています。

ブランチ全体の最終レビューにもパッケージを作ります: `bash scripts/review-package PLAN_FILE MERGE_BASE HEAD` を実行します（MERGE_BASE はブランチの開始コミット、例: `git merge-base main HEAD`）。表示されたパスを最終レビューの派遣に含め、最終レビュアーが git コマンドで枝の差分を再導出する代わりに 1 ファイルを読めば済むようにします。利用可能な最上位モデルで派遣し（SKILL.md のモデル選択を参照）、superpowers:requesting-code-review の [code-reviewer.md](../../requesting-code-review/code-reviewer.md) を使います。台帳の保留 minor と parked 行を渡し、マージ前に何を修正すべきかトリアージさせます。

ブランチ全体の最終レビューが指摘を返したら、指摘一覧の全件を持った修正担当サブエージェントを **1 人だけ** 派遣します — 指摘ごとに修正者は作りません。指摘ごとに修正者を立てると、そのたびにコンテキストを再構築してスイートを再実行し、実在のセッションでは最終レビューの修正波が全タスク合計より高くつきました。その後、修正波のスコープ付き再レビューを **ちょうど 1 回** 実行します（修正範囲に `bash scripts/review-package PLAN_FILE FIX_BASE HEAD`、[re-review-prompt.md](../re-review-prompt.md)）。
残留指摘は修正ループのブレーカー（references/fix-loop.md）と同じように裁定します: 裁定付きで保留するか、load-bearing なものを裁定して決定を台帳に記録します。ここで止めるのは、実行中の計画が停止する4条件（SKILL.md 冒頭）だけです。2 回目の修正波はありません — 残る load-bearing な指摘は、`finishing-a-development-branch` が選択肢を示すときに人間パートナーへ表面化します。

### 締め処理 (Finish)

何かを削除する前に、`Ruling:` を含む台帳のすべての行 — 事前スキャンの裁定、保留した指摘、ブレーカーの裁定、そのすべて — を発生順に最終メッセージの「Rulings I made（行った裁定）」として集め、それぞれ誤っていた場合のコストを添えます。一覧は完全網羅です: 台帳に裁定があるなら、一覧にもあります。その一覧は、人間パートナーの代理で下した決定が本人に届く唯一の場所です — 相手はそれを読み、あなたが間違えたものを作り直します。ワークスペースとともに消える裁定は、密かに行われた決定です。

ブランチ全体の最終レビューがクリーンになり、その修正がマージされたら、この計画のワークスペースを削除します（`rm -rf <workspace>`）— もう記録は git 履歴です。兄弟ディレクトリは他の計画のものです。触れません。

superpowers:finishing-a-development-branch を使用します。
