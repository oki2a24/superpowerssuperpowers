# ビジュアルコンパニオンガイド (Visual Companion Guide)

モックアップ、図、選択肢を表示するためのブラウザベースのビジュアルブレインストーミングコンパニオンです。

## 使用するタイミング (When to Use)

セッションごとではなく、**質問ごと**に判断してください。判断基準: **「ユーザーはこれを発言を読むよりも、目で見る方が理解しやすいか？」**

コンテンツ自体が視覚的である場合は **ブラウザを使用** します：

- **UIモックアップ** — ワイヤーフレーム、レイアウト、ナビゲーション構造、コンポーネントデザイン
- **アーキテクチャ図** — システム構成要素、データフロー、関係マップ
- **視覚的な比較（並列表示）** — 2つのレイアウト、2つのカラーパレット、2つのデザイン方向性の比較
- **デザインの磨き込み (Design polish)** — ルック＆フィール、余白、視覚的階層に関する質問の場合
- **空間的・構造的関係** — ステートマシン、フローチャート、図として描画されるエンティティ関係

コンテンツがテキストや表形式である場合は **ターミナルを使用** します：

- **要件やスコープに関する質問** — 「Xはどういう意味か？」「どの機能がスコープ内か？」
- **概念的な A/B/C の選択** — 言葉で説明されたアプローチ間の選択
- **トレードオフリスト** — メリット・デメリット、比較表
- **技術的決定** — APIデザイン、データモデリング、アーキテクチャ手法の選定
- **確認のための質問** — 回答が視覚的嗜好ではなく言葉によるもの全般

UIトピックに*関する*質問であっても、自動的に視覚的な質問になるわけではありません。「どのようなウィザードを作りたいですか？」は概念的です — ターミナルを使用してください。「これらのウィザードレイアウトのうち、どちらがしっくりきますか？」は視覚的です — ブラウザを使用してください。

## 動作原理 (How It Works)

サーバーは特定のディレクトリ内の HTML ファイルを監視し、最新のものをブラウザに配信します。AIが `screen_dir` に HTML コンテンツを書き込み、ユーザーはそれをブラウザで確認してクリックで選択できます。選択内容は `state_dir/events` に記録され、次のターンで AI が読み取ります。

**コンテンツフラグメント vs 完全なドキュメント:** HTML ファイルが `<!DOCTYPE` または `<html` で始まる場合、サーバーはそれをそのまま配信します（ヘルパースクリプトのみ注入）。それ以外の場合、サーバーは自動的にコンテンツをフレームテンプレートで包み込み、ヘッダー、CSSテーマ、接続ステータス、インタラクティブインフラを追加します。**デフォルトではコンテンツフラグメントを記述してください。** ページ全体を完全に制御する必要がある場合にのみ、完全なドキュメントを記述します。

## セッションの開始 (Starting a Session)

```bash
# ユーザーがコンパニオンの使用を承認した後に起動します。--open は最初の画面で自動的にブラウザを開きます。
# --project-dir はモックアップを保存し、同一ポートでの再起動を可能にします。
scripts/start-server.sh --project-dir /path/to/project --open

# 返り値の例: {"type":"server-started","port":52341,
#           "url":"http://localhost:52341/?key=ab12…",
#           "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

レスポンスから `screen_dir` と `state_dir` を保存します。`--open` を指定すると、最初の画面をプッシュしたときにブラウザが自動的に開きます。ユーザーに開くよう頼む必要はありませんが、フォールバックとして URL を共有しておきます（ヘッドレス環境やリモート設定では自動で開かない場合があります）。

**URL にはセッションキーが含まれています (`?key=…`)。** サーバーはキーのないリクエストを拒否するため、常に `url` フィールドの**完全な** URL をユーザーに伝えてください。クエリ文字列を削除したり、裸の `http://host:port` を渡したりしないでください。このキーによって HTTP および WebSocket アクセスが保護され、不要なタブやネットワーク上の他のマシンが画面を読み取ったりイベントを注入したりするのを防ぎます。初回ロード後、ブラウザはクッキーを介してキーを記憶するため、リロードや `/files/*` アセットの読み込みではキーを再入力する必要はありません。

**接続情報の検索:** サーバーは起動 JSON を `$STATE_DIR/server-info` に書き込みます。バックグラウンドでサーバーを起動して stdout を取得しなかった場合は、そのファイルを読み込んで URL とポートを取得してください。`--project-dir` を使用している場合は、`<project>/.superpowers/brainstorm/` でセッションディレクトリを確認してください。

**注:** プロジェクトルートを `--project-dir` として渡すことで、モックアップが `.superpowers/brainstorm/` に永続化され、サーバーの再起動後も保持されます。指定しない場合、ファイルは `/tmp` に作成され削除されます。`.gitignore` に `.superpowers/` が未登録の場合は追加するようユーザーに促してください。

**プラットフォームごとのサーバー起動方法:**

**Claude Code:**
```bash
# デフォルトモードで動作します — スクリプト自体がサーバーをバックグラウンド化します。
scripts/start-server.sh --project-dir /path/to/project --open
```

Windows では、スクリプトが自動検出してフォアグラウンドモード（ツール呼び出しをブロックするモード）に切り替えます。Bash ツール呼び出しで `run_in_background: true` を使用して会話ターンを跨いでサーバーを存続させ、次のターンで `$STATE_DIR/server-info` を読み込んで URL とポートを取得してください。

**Codex:**
```bash
# Codex はバックグラウンドプロセスを刈り取ります。スクリプトは CODEX_CI を自動検出し、
# フォアグラウンドモードに切り替えます。通常通り実行してください（追加フラグは不要です）。
scripts/start-server.sh --project-dir /path/to/project --open
```

**Gemini CLI:**
```bash
# --foreground を使用し、シェルツール呼び出しで is_background: true を設定して
# プロセスがターンを跨いで存続するようにします
scripts/start-server.sh --project-dir /path/to/project --open --foreground
```

**Copilot CLI:**
```bash
# --foreground を使用し、bash ツール経由で mode: "async" を指定してサーバーを起動し、
# プロセスがターンを跨いで存続するようにします。後で操作する必要がある場合に備えて、
# 返された shellId を保存してください。
scripts/start-server.sh --project-dir /path/to/project --open --foreground
```

**その他の環境:** 会話ターンを跨いでサーバーがバックグラウンドで動作し続ける必要があります。環境が分離されたプロセスを終了させてしまう場合は、`--foreground` を使用し、プラットフォームのバックグラウンド実行メカニズムでコマンドを起動してください。

ブラウザから URL にアクセスできない場合（リモート/コンテナ環境でよくあります）、ループバック以外のホストをバインドします：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

返される URL JSON に出力されるホスト名を制御するには `--url-host` を使用します。

## ループ手順 (The Loop)

1. **サーバーが生きていることを確認**し、`screen_dir` 内の新しいファイルに **HTML を書き込みます**:
   - **必須: URLを言及したり画面をプッシュしたりする前に、サーバーが稼働中であることを確認してください。** `$STATE_DIR/server-info` が存在し、`$STATE_DIR/server-stopped` が存在しないことをチェックします。停止している場合は、**同じ `--project-dir`** を指定して `start-server.sh` で再起動します — 同じポートが再利用されるため、ユーザーが開いているタブは自動的に再接続され（ダウン中は「一時停止」オーバーレイが表示されます）、新しい URL を送信する必要はありません。サーバーは 4 時間アイドル状態が続くと自動終了します（`--idle-timeout-minutes` で設定可能）。
   - 意味のあるファイル名を使用します: `platform.html`, `visual-style.html`, `layout.html`
   - **ファイル名を再利用しないでください** — 各画面には常に新しいファイルを割り当てます
   - ファイル作成ツールを使用してください — **cat/heredoc は使用しないでください**（ターミナルに雑音を出力するため）
   - サーバーは自動的に最新のファイルを配信します

2. **ユーザーに何が表示されるかを伝え、ターンを終了します:**
   - 毎回 URL を案内します（初回だけでなくすべてのステップで）
   - 画面に何が表示されているか簡単にテキストで要約します（例: 「トップページの3つのレイアウト案を表示しています」）
   - ターミナルで返答するよう依頼します: 「ご覧いただき、ご意見をお聞かせください。必要に応じて選択肢をクリックして選ぶこともできます。」

3. **次のターンで** — ユーザーがターミナルで返答した後:
   - `$STATE_DIR/events` が存在すれば読み込みます — これにはユーザーのブラウザ操作（クリック、選択）が JSON lines 形式で記録されています
   - ターミナルのテキストと統合して全体像を把握します
   - ターミナルのメッセージが主たるフィードバックであり、`state_dir/events` は構造化された操作データを提供します

4. **反復改善または進行** — フィードバックによって現在の画面が変更される場合は、新しいファイルを作成します（例: `layout-v2.html`）。現在のステップが検証された場合のみ、次の質問に進みます。

5. **ターミナルに戻る際はアンロード** — 次のステップでブラウザが必要ない場合（確認の質問、トレードオフの議論など）、待機画面をプッシュして古いコンテンツをクリアします：

   ```html
   <!-- filename: waiting.html (または waiting-2.html など) -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">ターミナルで会話を継続中...</p>
   </div>
   ```

   これにより、会話が進んでいるのに解決済みの選択肢をユーザーが見続けずに済みます。次の視視的な質問が発生した際は、通常通り新しいコンテンツファイルをプッシュします。

6. 完了するまで繰り返します。

## コンテンツフラグメントの書き方 (Writing Content Fragments)

ページ内部に入るコンテンツのみを記述します。サーバーが自動的にフレームテンプレート（ヘッダー、CSSテーマ、接続ステータス、すべての対話用インフラ）でラップします。

**最小限の例:**

```html
<h2>どちらのレイアウトが適していますか？</h2>
<p class="subtitle">可読性と視覚的階層を考慮してください</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>シングルカラム</h3>
      <p>シンプルで集中できる読書体験</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>2カラム</h3>
      <p>メインコンテンツとサイドバーナビゲーション</p>
    </div>
  </div>
</div>
```

これだけです。`<html>` も CSS も `<script>` タグも必要ありません。サーバーがすべて提供します。

## 利用可能な CSS クラス (CSS Classes Available)

フレームテンプレートは、コンテンツ用に以下の CSS クラスを提供します：

### 選択肢 (A/B/C の選択)

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>タイトル</h3>
      <p>説明</p>
    </div>
  </div>
</div>
```

**複数選択:** コンテナに `data-multiselect` を追加すると、ユーザーが複数の選択肢を選択できるようになります。クリックするごとにスタイルの選択/解除が切り替わります。

```html
<div class="options" data-multiselect>
  <!-- 同じ選択肢のマークアップ — ユーザーは複数選択/解除が可能 -->
</div>
```

### カード (ビジュアルデザイン)

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- モックアップコンテンツ --></div>
    <div class="card-body">
      <h3>名前</h3>
      <p>説明</p>
    </div>
  </div>
</div>
```

### モックアップコンテナ

```html
<div class="mockup">
  <div class="mockup-header">プレビュー: ダッシュボードレイアウト</div>
  <div class="mockup-body"><!-- あなたのモックアップ HTML --></div>
</div>
```

### 分割表示 (並列表示)

```html
<div class="split">
  <div class="mockup"><!-- 左 --></div>
  <div class="mockup"><!-- 右 --></div>
</div>
```

### メリット / デメリット (Pros/Cons)

```html
<div class="pros-cons">
  <div class="pros"><h4>メリット</h4><ul><li>長所</li></ul></div>
  <div class="cons"><h4>デメリット</h4><ul><li>短所</li></ul></div>
</div>
```

### モック要素 (ワイヤーフレーム構築ブロック)

```html
<div class="mock-nav">Logo | Home | About | Contact</div>
<div style="display: flex;">
  <div class="mock-sidebar">ナビゲーション</div>
  <div class="mock-content">メインコンテンツエリア</div>
</div>
<button class="mock-button">アクションボタン</button>
<input class="mock-input" placeholder="入力フィールド">
<div class="placeholder">プレースホルダーエリア</div>
```

### タイポグラフィとセクション

- `h2` — ページタイトル
- `h3` — セクション見出し
- `.subtitle` — タイトル下の副テキスト
- `.section` — 下部にマージンを持つコンテンツブロック
- `.label` — 小さな大文字のラベルテキスト

## ブラウザイベントのフォーマット (Browser Events Format)

ユーザーがブラウザで選択肢をクリックすると、その操作が `$STATE_DIR/events` に記録されます（1行に1つの JSON オブジェクト）。このファイルは、新しい画面をプッシュすると自動的にクリアされます。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Hybrid","timestamp":1706000115}
```

イベントストリーム全体からユーザーの探索プロセスが読み取れます — 最終決定を下す前に複数の選択肢をクリックする場合があります。最後の `choice` イベントが通常は最終選択となりますが、クリックのパターンから迷いや好みが窺える場合は質問してみる価値があります。

`$STATE_DIR/events` が存在しない場合、ユーザーはブラウザを操作していません — ターミナルのテキストのみを使用してください。

## デザインのヒント (Design Tips)

- **質問内容に応じて忠実度を調整** — レイアウトにはワイヤーフレーム、デザイン質問には磨き込まれたデザインを
- **各ページで質問意図を説明** — 単に「1つ選んでください」ではなく、「どちらのレイアウトがよりプロフェッショナルに感じられますか？」など
- **進む前に反復改善** — フィードバックによって現在の画面が変わる場合は、新しいバージョンを記述する
- 1画面につき **選択肢は最大 2〜4 個**
- **重要な場面では実コンテンツを使用** — 写真ポートフォリオなら実際の画像（Unsplash等）を使用する。ダミーコンテンツはデザイン上の問題を隠してしまいます。
- **モックアップはシンプルに保つ** — ピクセルパーフェクトなデザインではなく、レイアウトと構造に集中する

## ファイル命名規則 (File Naming)

- 意味のある名前を使用する: `platform.html`, `visual-style.html`, `layout.html`
- ファイル名を再利用しない — 各画面は常に新しいファイルでなければならない
- イテレーションの場合: `layout-v2.html`, `layout-v3.html` のようにバージョンサフィックスを付与する
- サーバーは更新時刻が最も新しいファイルを配信します

## クリーンアップ (Cleaning Up)

```bash
scripts/stop-server.sh $SESSION_DIR
```

セッションで `--project-dir` を使用した場合、モックアップファイルは後で参照できるよう `.superpowers/brainstorm/` に残ります。`/tmp` セッションのみが停止時に削除されます。

## リファレンス (Reference)

- フレームテンプレート (CSSリファレンス): `scripts/frame-template.html`
- ヘルパースクリプト (クライアント側): `scripts/helper.js`
