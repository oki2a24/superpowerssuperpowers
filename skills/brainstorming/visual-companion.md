# ビジュアル・コンパニオン・ガイド

モックアップ、図解、選択肢をブラウザで表示するための、ブレインストーミング補助ツールです。

## 使用のタイミング

セッション全体ではなく、**質問ごとに**使用するかどうかを判断してください。判断基準は：**「ユーザーはこれを読むよりも、見たほうがよく理解できるか？」**です。

**ブラウザを使用するケース**（内容そのものが視覚的な場合）:

- **UI モックアップ** — ワイヤーフレーム、レイアウト、ナビゲーション構造、コンポーネントのデザイン
- **アーキテクチャ図** — システムコンポーネント、データフロー、リレーションシップマップ
- **視覚的な比較** — 2 つのレイアウト、2 つの配色、2 つのデザインの方向性の比較
- **デザインの洗練** — 見た目、余白、視覚的な階層に関する質問
- **空間的な関係** — 状態遷移図、フローチャート、実体関連図

**ターミナルを使用するケース**（内容がテキストや表の場合）:

- **要件とスコープの質問** — 「X は何を意味しますか？」「どの機能がスコープに含まれますか？」
- **概念的な A/B/C の選択** — 言葉で説明されたアプローチの選択
- **トレードオフのリスト** — 長所と短所、比較表
- **技術的な決定** — API 設計、データモデリング、アーキテクチャアプローチの選択
- **明確化のための質問** — 回答が視覚的な好みではなく、言葉であるものすべて

UI に関するトピックの質問であっても、自動的に視覚的な質問になるわけではありません。「どんなウィザード形式がいいですか？」は概念的であり、ターミナルを使用します。「これらのウィザードのレイアウトのうち、どれがしっくりきますか？」は視覚的であり、ブラウザを使用します。

## 仕組み

サーバーがディレクトリを監視し、新しい HTML ファイルをブラウザに提供します。`screen_dir` に HTML コンテンツを書き込むと、ユーザーはそれをブラウザで確認し、クリックしてオプションを選択できます。選択内容は `state_dir/events` に JSONL 形式で記録され、次のターンで読み取ることができます。

**コンテンツ・フラグメントとフル・ドキュメント:** HTML ファイルが `<!DOCTYPE` または `<html` で始まる場合、サーバーはそれをそのまま提供します。それ以外の場合、サーバーは自動的にコンテンツを「フレーム・テンプレート」でラップし、ヘッダー、CSS テーマ、選択インジケータ、対話型インフラを追加します。**デフォルトではコンテンツ・フラグメント（断片）を書き込んでください。** ページを完全に制御する必要がある場合にのみ、フル・ドキュメントを書き込みます。

## セッションの開始

```bash
# 永続化を有効にしてサーバーを起動（モックアップはプロジェクト内に保存される）
skills/brainstorming/scripts/start-server.sh --project-dir .

# 戻り値の例: {"type":"server-started","port":52341,"url":"http://localhost:52341",
#           "screen_dir":".superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":".superpowers/brainstorm/12345-1706000000/state"}
```

レスポンスから `screen_dir` と `state_dir` を保存し、ユーザーに URL を開くよう伝えてください。

**接続情報の取得:** サーバーは起動時の JSON を `$STATE_DIR/server-info` に書き込みます。`--project-dir` を使用している場合は、`<project>/.superpowers/brainstorm/` 内のセッションディレクトリを確認してください。

**注意:** `--project-dir` にプロジェクトのルートを渡すことで、モックアップが `.superpowers/brainstorm/` に保存され、サーバー再起動後も保持されます。`.superpowers/` を `.gitignore` に追加するようユーザーに提案してください。

**プラットフォーム別の起動方法（Gemini CLI）:**

```bash
# --foreground を指定し、run_shell_command で is_background: true を設定する
# これにより、プロセスが会話のターンをまたいで存続する
skills/brainstorming/scripts/start-server.sh --project-dir . --foreground
```

URL にブラウザからアクセスできない場合は、ホストをバインドしてください：

```bash
skills/brainstorming/scripts/start-server.sh \
  --project-dir . \
  --host 0.0.0.0 \
  --url-host localhost
```

## ループの流れ

1. **サーバーが生存しているか確認し、HTML を書き込む**:
   - 書き込む前に `$STATE_DIR/server-info` が存在するか確認してください。存在しない（または `$STATE_DIR/server-stopped` がある）場合は、サーバーが終了しています。`start-server.sh` で再起動してください。
   - 意味のあるファイル名を使用してください：`platform.html`, `visual-style.html`, `layout.html`
   - **ファイル名を再利用しないでください** — 各画面に新しいファイルを作成します。
   - サーバーは常に最新の（更新日時が新しい）ファイルを配信します。

2. **ユーザーに状況を伝え、ターンを終了する**:
   - URL を再度提示してください（最初の 1 回だけでなく、毎回提示）。
   - 画面に何が表示されているか、テキストで簡潔に説明してください（例：「ホームページの 3 つのレイアウト案を表示しています」）。
   - ターミナルで回答を求めてください：「内容を確認して、どう思うか教えてください。必要であれば、クリックしてオプションを選択することもできます。」

3. **次のターン** — ユーザーがターミナルで返答した後:
   - `$STATE_DIR/events` が存在すれば読み取ってください。これにはブラウザでの操作（クリック、選択）が JSONL 形式で含まれています。
   - ターミナルのテキストと、ブラウザの操作データを組み合わせて判断してください。

4. **反復または進行**:
   - フィードバックによって現在の画面を修正する場合は、新しいファイル（例：`layout-v2.html`）を書き込んでください。現在のステップが検証されたら、次の質問に進みます。

5. **ターミナルに戻る際の表示**:
   - 次のステップがブラウザを必要としない場合、古いコンテンツを表示し続けないために「待機中」画面を送信してください。

   ```html
   <!-- filename: waiting.html -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">ターミナルで継続中...</p>
   </div>
   ```

## コンテンツ・フラグメントの書き方

ページの**中身だけ**を書き込みます。サーバーが自動的にフレーム（ヘッダー、テーマ CSS、対話インフラ）でラップします。

**最小限の例:**

```html
<h2>どのレイアウトが良いですか？</h2>
<p class="subtitle">読みやすさと視覚的な階層を考慮してください</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>シングルカラム</h3>
      <p>クリーンで、読むことに集中できる体験</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>2 カラム</h3>
      <p>サイドバー・ナビゲーションを備えたメインコンテンツ</p>
    </div>
  </div>
</div>
```

`<html>` や CSS、`<script>` タグは不要です。

## 利用可能な CSS クラス

フレーム・テンプレートが以下のクラスを提供しています：

### オプション (A/B/C の選択)

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

**複数選択:** コンテナに `data-multiselect` を追加すると、ユーザーが複数のオプションを選択できるようになります。

### カード (ビジュアルデザイン案)

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- モックアップの内容 --></div>
    <div class="card-body">
      <h3>名称</h3>
      <p>説明</p>
    </div>
  </div>
</div>
```

### モックアップ・コンテナ

```html
<div class="mockup">
  <div class="mockup-header">プレビュー: ダッシュボード・レイアウト</div>
  <div class="mockup-body"><!-- モックアップの HTML --></div>
</div>
```

### 左右分割 (Split view)

```html
<div class="split">
  <div class="mockup"><!-- 左側 --></div>
  <div class="mockup"><!-- 右側 --></div>
</div>
```

### 比較 (Pros/Cons)

```html
<div class="pros-cons">
  <div class="pros"><h4>長所</h4><ul><li>メリット</li></ul></div>
  <div class="cons"><h4>短所</h4><ul><li>デメリット</li></ul></div>
</div>
```

### デザインのヒント

- **2〜4 個のオプション**に留める
- **本物のコンテンツを使用する** — プレースホルダはデザイン上の問題を覆い隠します。
- **モックアップはシンプルに** — ピクセルパーフェクトを目指すのではなく、レイアウトと構造に集中してください。

## クリーンアップ

```bash
skills/brainstorming/scripts/stop-server.sh $SESSION_DIR
```

## 参考資料

- フレーム・テンプレート (CSS リファレンス): `skills/brainstorming/scripts/frame-template.html`
- ヘルパー・スクリプト (クライアント側): `skills/brainstorming/scripts/helper.js`
