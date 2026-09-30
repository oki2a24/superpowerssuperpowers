# GitHub issues

`gh` がインストール済みで認証済みならそれを使用します。認証、レート制限、JSON を扱います。なければ curl で公開 API、次にパートナーが開く URL にフォールバックします。

## 検索

```bash
gh search issues --repo obra/superpowers --limit 10 "<terms>" \
  --json number,state,title --jq '.[] | "\(.number)\t\(.state)\t\(.title)"'
```

`gh` なし（未認証、1分10リクエスト）:

```bash
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/search/issues?q=repo:obra/superpowers+is:issue+<url-encoded terms>&per_page=10" \
  | jq -r '.items[] | "\(.number)\t\(.state)\t\(.title)"'
```

curl もなければ `https://github.com/obra/superpowers/issues?q=<terms>` を渡します。

## 作成

記入済み `templates/issue.md` をワークスペースに書き、正確な文面を示します。承認後に作成します:

```bash
gh issue create --repo obra/superpowers --title "<title>" --body-file <path> \
  --label bug --label automated-issue-report
```

報告者に push 権限がないと GitHub はラベルを黙って落とすため、ラベルが付くのはコラボレーターのみです。テンプレートフッターは skill-filed である旨を残します。`gh` はファイルを添付できません。issue 作成後にブラウザで添付できるよう、パートナーにバンドルパスを渡します。

`gh` なしの場合は `diagnosis_report.md` テンプレートの事前記入リンクを渡します。どの報告者にも両ラベルが付きます:

```
https://github.com/obra/superpowers/issues/new?template=diagnosis_report.md&title=<url-encoded title>&body=<url-encoded body>
```

GitHub は約8,000文字超の URL を拒否します。超える場合はタイトルのみのリンクを送り、本文はファイルから貼り付けるようパートナーに伝えます。
