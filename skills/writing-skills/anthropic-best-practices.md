# スキル作成のベストプラクティス

> Claude がスキルを検出し、正常に使用できるようにするための、効果的なスキルの書き方を学びます。

優れたスキルとは、簡潔で構造化されており、実際の使用環境でテストされているものです。このガイドでは、Claude がスキルを効果的に検出し、利用できるようにするための具体的な作成上の決定事項を提供します。

スキルの仕組みに関する概念的な背景については、[スキルの概要](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)を参照してください。

## コア原則

### 簡潔さが重要

[コンテキストウィンドウ](https://platform.claude.com/docs/en/build-with-claude/context-windows)は公共の資産です。あなたのスキルは、Claude が知る必要のある他のすべての要素とコンテキストウィンドウを共有します。これには以下が含まれます：

* システムプロンプト
* 会話履歴
* 他のスキルのメタデータ
* 実際の要求

スキルのすべてのトークンに即座にコストが発生するわけではありません。起動時には、すべてのスキルのメタデータ（名前と説明）のみがプリロードされます。Claude は、そのスキルが関連性を持つようになったときにのみ `SKILL.md` を読み込み、必要に応じて追加のファイルを読み込みます。しかし、`SKILL.md` を簡潔に保つことは依然として重要です。一度 Claude がそれを読み込むと、すべてのトークンが会話履歴や他のコンテキストと競合することになるからです。

**デフォルトの前提**: Claude はすでに十分に賢い

Claude がまだ持っていないコンテキストのみを追加してください。情報の各断片に対して、以下の問いを投げかけてください：

* 「Claude は本当にこの説明を必要としているか？」
* 「Claude がこれをすでに知っていると仮定できるか？」
* 「この段落はそのトークンコストに見合う価値があるか？」

**良い例：簡潔**（約 50 トークン）：

````markdown  theme={null}
## PDF テキストの抽出

テキスト抽出には pdfplumber を使用してください：

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**悪い例：冗長すぎる**（約 150 トークン）：

```markdown  theme={null}
## PDF テキストの抽出

PDF (Portable Document Format) ファイルは、テキスト、画像、その他のコンテンツを含む一般的なファイル形式です。PDF からテキストを抽出するには、ライブラリを使用する必要があります。PDF 処理には多くのライブラリがありますが、使いやすく、ほとんどのケースをうまく処理できる pdfplumber をお勧めします。まず、pip を使用してインストールする必要があります。その後、以下のコードを使用できます...
```

簡潔なバージョンでは、Claude が PDF とは何であるか、そしてライブラリがどのように機能するかを知っていることを前提としています。

### 適切な自由度の設定

タスクの脆弱性と変動性に合わせて具体性のレベルを調整してください。

**高い自由度**（テキストベースの指示）：

使用場面：

* 複数のアプローチが有効である
* 決定がコンテキストに依存する
* 経験則がアプローチを導く

例：

```markdown  theme={null}
## コードレビュープロセス

1. コードの構造と構成を分析する
2. 潜在的なバグやエッジケースを確認する
3. 可読性と保守性の向上のための改善案を提示する
4. プロジェクトの規約への準拠を確認する
```

**中程度の自由度**（擬似コードまたはパラメータ付きスクリプト）：

使用場面：

* 推奨されるパターンが存在する
* ある程度の変動が許容される
* 設定が動作に影響を与える

例：

````markdown  theme={null}
## レポート作成

このテンプレートを使用し、必要に応じてカスタマイズしてください：

```python
def generate_report(data, format="markdown", include_charts=True):
    # データを処理
    # 指定された形式で出力を生成
    # オプションで可視化を含める
```
````

**低い自由度**（特定のスクリプト、パラメータはほとんどまたは全くない）：

使用場面：

* 操作が脆弱でエラーが発生しやすい
* 一貫性が極めて重要である
* 特定のシーケンスに従う必要がある

例：

````markdown  theme={null}
## データベースマイグレーション

必ずこのスクリプトを実行してください：

```bash
python scripts/migrate.py --verify --backup
```

コマンドを変更したり、追加のフラグを加えたりしないでください。
````

**アナロジー**: Claude を道を探索するロボットとして考えてください：

* **両側が崖の狭い橋**: 安全に進む唯一の方法しかありません。具体的なガードレールと正確な指示を提供してください（低い自由度）。例：正確な順序で実行しなければならないデータベースマイグレーション。
* **障害物のない広い野原**: 多くの道が成功に繋がります。大まかな方向性を示し、Claude が最適なルートを見つけることを信頼してください（高い自由度）。例：コンテキストが最適なアプローチを決定するコードレビュー。

### 予定しているすべてのモデルでテストする

スキルはモデルへの追加要素として機能するため、その効果は基盤となるモデルに依存します。予定しているすべてのモデルでスキルをテストしてください。

**モデル別のテストの考慮事項**:

* **Claude Haiku** (高速、経済的): スキルは十分なガイダンスを提供しているか？
* **Claude Sonnet** (バランス): スキルは明確で効率的か？
* **Claude Opus** (強力な推論): スキルは過剰な説明を避けているか？

Opus で完璧に機能するものが、Haiku ではより詳細を必要とする場合があります。複数のモデルでスキルを使用する予定がある場合は、それらすべてでうまく機能する指示を目指してください。

## スキルの構造

<Note>
  **YAML フロントマター**: `SKILL.md` のフロントマターには 2 つのフィールドが必要です：

  * `name` - スキルの人間が読める名前（最大 64 文字）
  * `description` - スキルの機能と使用時期についての 1 行の説明（最大 1024 文字）

  スキルの完全な構造の詳細については、[スキルの概要](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#skill-structure)を参照してください。
</Note>

### 命名規則

スキルを参照し、議論しやすくするために、一貫した命名パターンを使用してください。スキルの名前には **動名詞形式** (動詞 + -ing) を使用することをお勧めします。これは、スキルが提供する活動や能力を明確に表現するためです。

**良い命名例 (動名詞形式)**：

* "Processing PDFs" (PDFの処理)
* "Analyzing spreadsheets" (スプレッドシートの分析)
* "Managing databases" (データベースの管理)
* "Testing code" (コードのテスト)
* "Writing documentation" (ドキュメントの作成)

**許容される代替案**：

* 名詞句: "PDF Processing", "Spreadsheet Analysis"
* アクション指向: "Process PDFs", "Analyze Spreadsheets"

**避けるべきもの**：

* 曖昧な名前: "Helper", "Utils", "Tools"
* 汎用的すぎるもの: "Documents", "Data", "Files"
* スキルコレクション内での不整合なパターン

一貫した命名により、以下のことが容易になります：

* ドキュメントや会話でスキルを参照する
* スキルの機能を一目で理解する
* 複数のスキルを整理し、検索する
* プロフェッショナルでまとまりのあるスキルライブラリを維持する

### 効果的な説明の書き方

`description` フィールドはスキルの検出を可能にするものであり、スキルの機能と使用時期の両方を含める必要があります。

<Warning>
  **常に三人称で記述してください**。説明はシステムプロンプトに挿入されるため、視点が不一致だと検出の問題が発生する可能性があります。

  * **良い:** "Processes Excel files and generates reports" (Excelファイルを処理し、レポートを生成する)
  * **避けるべき:** "I can help you process Excel files" (私はExcelファイルの処理をお手伝いできます)
  * **避けるべき:** "You can use this to process Excel files" (あなたはこれを使ってExcelファイルを処理できます)
</Warning>

**具体的であり、重要な用語を含めてください**。スキルの機能と、いつ使用すべきかの特定のトリガー/コンテキストの両方を含めます。

各スキルには正確に 1 つの説明フィールドがあります。説明はスキル選択において重要です。Claude はこれを使用して、100 以上の利用可能なスキルの中から適切なスキルを選択します。あなたの説明は、Claude がこのスキルを選択すべきタイミングを知るのに十分な詳細を提供しなければならず、`SKILL.md` の残りの部分で実装の詳細を提供します。

効果的な例：

**PDF 処理スキル：**

```yaml  theme={null}
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Excel 分析スキル：**

```yaml  theme={null}
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

**Git コミットヘルパースキル：**

```yaml  theme={null}
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

次のような曖昧な説明は避けてください：

```yaml  theme={null}
description: Helps with documents
```

```yaml  theme={null}
description: Processes data
```

```yaml  theme={null}
description: Does stuff with files
```

### 段階的開示 (Progressive Disclosure) パターン

`SKILL.md` は、オンボーディングガイドの目次のように、必要に応じて詳細な資料へ Claude を誘導する概要としての役割を果たします。段階的開示の仕組みについては、概要の [スキルの仕組み](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work) を参照してください。

**実践的なガイダンス:**

* 最適なパフォーマンスを得るために、`SKILL.md` の本文を 500 行未満に抑える
* この制限に近づいた場合は、コンテンツを別のファイルに分割する
* 以下のパターンを使用して、指示、コード、リソースを効果的に整理する

#### 視覚的概要：シンプルから複雑へ

基本的なスキルは、メタデータと指示を含む `SKILL.md` ファイルのみから始まります：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9" alt="YAMLフロントマターとMarkdown本文を示すシンプルなSKILL.mdファイル" data-og-width="2048" width="2048" data-og-height="1153" height="1153" data-path="images/agent-skills-simple-file.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=c61cc33b6f5855809907f7fda94cd80e 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=90d2c0c1c76b36e8d485f49e0810dbfd 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=ad17d231ac7b0bea7e5b4d58fb4aeabb 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f5d0a7a3c668435bb0aee9a3a8f8c329 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0e927c1af9de5799cfe557d12249f6e6 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=46bbb1a51dd4c8202a470ac8c80a893d 2500w" />

スキルが成長するにつれて、Claude が必要なときだけ読み込む追加のコンテンツをバンドルできます：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3" alt="reference.md や forms.md などの追加リファレンスファイルのバンドル。" data-og-width="2048" width="2048" data-og-height="1327" height="1327" data-path="images/agent-skills-bundling-content.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f8a0e73783e99b4a643d79eac86b70a2 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=dc510a2a9d3f14359416b706f067904a 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=82cd6286c966303f7dd914c28170e385 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=56f3be36c77e4fe4b523df209a6824c6 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=d22b5161b2075656417d56f41a74f3dd 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=3dd4bdd6850ffcc96c6c45fcb0acd6eb 2500w" />

完全なスキルディレクトリ構造は以下のようになります：

```
pdf/
├── SKILL.md              # メインの指示 (トリガー時に読み込まれる)
├── FORMS.md              # フォーム記入ガイド (必要に応じて読み込まれる)
├── reference.md          # API リファレンス (必要に応じて読み込まれる)
├── examples.md           # 使用例 (必要に応じて読み込まれる)
└── scripts/
    ├── analyze_form.py   # ユーティリティスクリプト (実行され、読み込まれない)
    ├── fill_form.py      # フォーム記入スクリプト
    └── validate.py       # バリデーションスクリプト
```

#### パターン 1: リファレンス付きのハイレベルガイド

````markdown  theme={null}
---
name: PDF Processing
description: PDFファイルからテキストや表を抽出し、フォームに記入し、ドキュメントを結合します。PDFファイルを扱うときや、ユーザーがPDF、フォーム、またはドキュメントの抽出に言及したときに使用します。
---

# PDF Processing

## クイックスタート

pdfplumber でテキストを抽出：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## 高度な機能

**フォーム記入**: 完全なガイドは [FORMS.md](FORMS.md) を参照
**API リファレンス**: すべてのメソッドは [REFERENCE.md](REFERENCE.md) を参照
**使用例**: 一般的なパターンは [EXAMPLES.md](EXAMPLES.md) を参照
````

Claude は、`FORMS.md`、`REFERENCE.md`、または `EXAMPLES.md` を必要なときにのみ読み込みます。

#### パターン 2: ドメイン固有の整理

複数のドメインを持つスキルの場合、無関係なコンテキストの読み込みを避けるために、コンテンツをドメインごとに整理します。ユーザーが販売指標について尋ねたとき、Claude は財務やマーケティングのデータではなく、販売関連のスキーマのみを読み込む必要があります。これにより、トークンの使用量を低く抑え、コンテキストを集中させることができます。

```
bigquery-skill/
├── SKILL.md (概要とナビゲーション)
└── reference/
    ├── finance.md (収益、請求指標)
    ├── sales.md (案件、パイプライン)
    ├── product.md (API使用状況、機能)
    └── marketing.md (キャンペーン、アトリビューション)
```

````markdown SKILL.md theme={null}
# BigQuery Data Analysis

## 利用可能なデータセット

**財務**: 収益、ARR、請求 → [reference/finance.md](reference/finance.md) を参照
**販売**: 案件、パイプライン、アカウント → [reference/sales.md](reference/sales.md) を参照
**製品**: API使用状況、機能、採用 → [reference/product.md](reference/product.md) を参照
**マーケティング**: キャンペーン、アトリビューション、メール → [reference/marketing.md](reference/marketing.md) を参照

## クイック検索

find specific metrics using grep:

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
````

#### パターン 3: 条件付きの詳細

基本的なコンテンツを表示し、高度なコンテンツへのリンクを貼ります：

```markdown  theme={null}
# DOCX Processing

## ドキュメントの作成

新しいドキュメントには docx-js を使用してください。[DOCX-JS.md](DOCX-JS.md) を参照。

## ドキュメントの編集

単純な編集の場合は、XML を直接修正してください。

**変更履歴の記録**: [REDLINING.md](REDLINING.md) を参照
**OOXML の詳細**: [OOXML.md](OOXML.md) を参照
```

Claude は、ユーザーがそれらの機能を必要とする場合にのみ `REDLINING.md` や `OOXML.md` を読み込みます。

### 深くネストされた参照を避ける

Claude は、参照されたファイルからさらに別のファイルが参照されている場合、ファイルを部分的にしか読み込まないことがあります。ネストされた参照に遭遇すると、Claude はファイル全体を読み込むのではなく、`head -100` のようなコマンドを使用してコンテンツをプレビューすることがあり、その結果、情報が不完全になる可能性があります。

**参照は `SKILL.md` から 1 レベルの深さに保ってください**。必要なときに Claude がファイル全体を読み込めるように、すべてのリファレンスファイルは `SKILL.md` から直接リンクする必要があります。

**悪い例：深すぎる**：

```markdown  theme={null}
# SKILL.md
[advanced.md](advanced.md) を参照...

# advanced.md
[details.md](details.md) を参照...

# details.md
実際の情報はこちら...
```

**良い例：1 レベルの深さ**：

```markdown  theme={null}
# SKILL.md

**基本操作**: [SKILL.md 内の指示]
**高度な機能**: [advanced.md](advanced.md) を参照
**API リファレンス**: [reference.md](reference.md) を参照
**使用例**: [examples.md](examples.md) を参照
```

### 長いリファレンスファイルには目次を付ける

100 行を超えるリファレンスファイルには、上部に目次を含めてください。これにより、部分的な読み込みによるプレビュー時でも、Claude は利用可能な情報の全範囲を把握できます。

**例**：

```markdown  theme={null}
# API Reference

## 目次
- 認証とセットアップ
- コアメソッド (作成、読み取り、更新、削除)
- 高度な機能 (バッチ操作、ウェブフック)
- エラーハンドリングパターン
- コード例

## 認証とセットアップ
...

## コアメソッド
...
```

Claude は必要に応じてファイル全体を読み込んだり、特定のセクションにジャンプしたりできます。

このファイルシステムベースのアーキテクチャがどのように段階的開示を可能にするかについての詳細は、後述のアドバンスセクションにある [ランタイム環境](#runtime-environment) セクションを参照してください。

## ワークフローとフィードバックループ

### 複雑なタスクにはワークフローを使用する

複雑な操作は、明確で連続的なステップに分割してください。特に複雑なワークフローの場合は、Claude が回答にコピーして進行状況をチェックできるチェックリストを提供してください。

**例 1：調査合成ワークフロー**（コードを使用しないスキルの場合）：

````markdown  theme={null}
## 調査合成ワークフロー

このチェックリストをコピーして進行状況を追跡してください：

```
調査の進行状況:
- [ ] ステップ 1: すべてのソースドキュメントを読み込む
- [ ] ステップ 2: 主要なテーマを特定する
- [ ] ステップ 3: 主張をクロスリファレンスする
- [ ] ステップ 4: 構造化された要約を作成する
- [ ] ステップ 5: 引用を確認する
```

**ステップ 1: すべてのソースドキュメントを読み込む**

`sources/` ディレクトリ内の各ドキュメントを確認します。主要な議論と裏付けとなる証拠をメモします。

**ステップ 2: 主要なテーマを特定する**

ソース間でパターンを探します。繰り返し現れるテーマは何ですか？ソース間で意見が一致している点、または一致していない点はどこですか？

**ステップ 3: 主張をクロスリファレンスする**

主要な主張ごとに、それがソース資料に記載されていることを確認します。各ポイントをどのソースが裏付けているかをメモします。

**ステップ 4: 構造化された要約を作成する**

テーマ別に調査結果を整理します。以下を含めてください：
- 主要な主張
- ソースからの裏付けとなる証拠
- 相反する視点（ある場合）

**ステップ 5: 引用を確認する**

すべての主張が正しいソースドキュメントを参照していることを確認します。引用が不完全な場合は、ステップ 3 に戻ります。
````

この例は、ワークフローがコードを必要としない分析タスクにどのように適用されるかを示しています。チェックリストパターンは、あらゆる複雑なマルチステッププロセスに有効です。

**例 2：PDF フォーム記入ワークフロー**（コードを使用するスキルの場合）：

````markdown  theme={null}
## PDF フォーム記入ワークフロー

このチェックリストをコピーし、完了した項目にチェックを入れてください：

```
タスクの進行状況:
- [ ] ステップ 1: フォームを分析する (analyze_form.py を実行)
- [ ] ステップ 2: フィールドマッピングを作成する (fields.json を編集)
- [ ] ステップ 3: マッピングを検証する (validate_fields.py を実行)
- [ ] ステップ 4: フォームに記入する (fill_form.py を実行)
- [ ] ステップ 5: 出力を確認する (verify_output.py を実行)
```

**ステップ 1: フォームを分析する**

実行: `python scripts/analyze_form.py input.pdf`

これによりフォームフィールドとその場所が抽出され、`fields.json` に保存されます。

**ステップ 2: フィールドマッピングを作成する**

`fields.json` を編集して、各フィールドの値を追加します。

**ステップ 3: マッピングを検証する**

実行: `python scripts/validate_fields.py fields.json`

続行する前に、バリデーションエラーを修正します。

**ステップ 4: フォームに記入する**

実行: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**ステップ 5: 出力を確認する**

実行: `python scripts/verify_output.py output.pdf`

確認に失敗した場合は、ステップ 2 に戻ります。
````

明確なステップにより、Claude が重要な検証をスキップするのを防ぐことができます。チェックリストは、Claude とあなたの両方がマルチステップのワークフローを通じた進行状況を追跡するのに役立ちます。

### フィードバックループの実装

**一般的なパターン**: バリデーターを実行 → エラーを修正 → 繰り返す

このパターンは出力の品質を大幅に向上させます。

**例 1：スタイルガイドへの準拠**（コードを使用しないスキルの場合）：

```markdown  theme={null}
## コンテンツレビュープロセス

1. STYLE_GUIDE.md のガイドラインに従ってコンテンツをドラフトする
2. チェックリストに照らしてレビューする：
   - 用語の一貫性を確認する
   - 例が標準形式に従っているか検証する
   - すべての必須セクションが存在することを確認する
3. 問題が見つかった場合：
   - 各問題を特定のセクション参照とともにメモする
   - コンテンツを修正する
   - チェックリストを再度レビューする
4. すべての要件が満たされた場合にのみ続行する
5. ドキュメントを確定して保存する
```

これは、スクリプトの代わりに参照ドキュメントを使用した検証ループパターンを示しています。「バリデーター」は `STYLE_GUIDE.md` であり、Claude は読み取って比較することでチェックを実行します。

**例 2：ドキュメント編集プロセス**（コードを使用するスキルの場合）：

```markdown  theme={null}
## ドキュメント編集プロセス

1. `word/document.xml` に編集を加える
2. **直ちに検証する**: `python ooxml/scripts/validate.py unpacked_dir/`
3. 検証に失敗した場合：
   - エラーメッセージを注意深く確認する
   - XML 内の問題を修正する
   - 再度検証を実行する
4. **検証に合格した場合にのみ続行する**
5. 再構築する: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. 出力ドキュメントをテストする
```

検証ループにより、エラーを早期に発見できます。

## コンテンツガイドライン

### 時間に敏感な情報を避ける

古くなってしまうような情報は含めないでください：

**悪い例：時間に敏感**（後に誤りとなる）：

```markdown  theme={null}
2025 年 8 月より前に行う場合は、古い API を使用してください。
2025 年 8 月以降は、新しい API を使用してください。
```

**良い例**（「古いパターン」セクションを使用）：

```markdown  theme={null}
## 現在の方法

v2 API エンドポイントを使用してください: `api.example.com/v2/messages`

## 古いパターン

<details>
<summary>レガシー v1 API (2025-08 廃止)</summary>

v1 API は以下を使用していました: `api.example.com/v1/messages`

このエンドポイントは現在サポートされていません。
</details>
```

古いパターンのセクションは、メインコンテンツを煩雑にすることなく歴史的なコンテキストを提供します。

### 用語を一貫させる

1 つの用語を選択し、スキル全体でそれを使用してください：

**良い - 一貫している**：

* 常に "API endpoint" (API エンドポイント)
* 常に "field" (フィールド)
* 常に "extract" (抽出)

**悪い - 一貫性がない**：

* "API endpoint", "URL", "API route", "path" を混ぜる
* "field", "box", "element", "control" を混ぜる
* "extract", "pull", "get", "retrieve" を混ぜる

一貫性は、Claude が指示を理解し、それに従うのに役立ちます。

## 一般的なパターン

### テンプレートパターン

出力形式のテンプレートを提供します。必要に応じて厳密さのレベルを調整してください。

**厳密な要件の場合**（API レスポンスやデータ形式など）：

````markdown  theme={null}
## レポート構造

常にこの正確なテンプレート構造を使用してください：

```markdown
# [分析タイトル]

## エグゼクティブサマリー
[主要な調査結果の 1 段落の概要]

## 主要な調査結果
- 裏付けデータを含む調査結果 1
- 裏付けデータを含む調査結果 2
- 裏付けデータを含む調査結果 3

## 推奨事項
1. 具体的な実行可能な推奨事項
2. 具体的な実行可能な推奨事項
```
````

**柔軟なガイダンスの場合**（適応が有用な場合）：

````markdown  theme={null}
## レポート構造

以下は適切なデフォルト形式ですが、分析に基づいて最善の判断を下してください：

```markdown
# [分析タイトル]

## エグゼクティブサマリー
[概要]

## 主要な調査結果
[発見した内容に基づいてセクションを適応させる]

## 推奨事項
[特定のコンテキストに合わせて調整する]
```

特定の分析タイプに合わせて、必要に応じてセクションを調整してください。
````

### 使用例パターン

出力の品質が例を見ることに依存するスキルの場合は、通常のプロンプトと同様に入力/出力のペアを提供します：

````markdown  theme={null}
## コミットメッセージ形式

以下の例に従ってコミットメッセージを生成してください：

**例 1:**
入力: JWTトークンによるユーザー認証を追加しました
出力:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**例 2:**
入力: レポートで日付が正しく表示されないバグを修正しました
出力:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

**例 3:**
入力: 依存関係を更新し、エラーハンドリングをリファクタリングしました
出力:
```
chore: update dependencies and refactor error handling

- Upgrade lodash to 4.17.21
- Standardize error response format across endpoints
```

このスタイルに従ってください: type(scope): 簡潔な説明、その後に詳細な説明。
````

例を提供することで、Claude は説明だけよりも、望ましいスタイルや詳細レベルをより明確に理解できます。

### 条件付きワークフローパターン

決定ポイントを通じて Claude をガイドします：

```markdown  theme={null}
## ドキュメント修正ワークフロー

1. 修正タイプを決定します：

   **新しいコンテンツを作成しますか？** → 下記の「作成ワークフロー」に従う
   **既存のコンテンツを編集しますか？** → 下記の「編集ワークフロー」に従う

2. 作成ワークフロー:
   - docx-js ライブラリを使用する
   - ドキュメントをゼロから構築する
   - .docx 形式でエクスポートする

3. 編集ワークフロー:
   - 既存のドキュメントを解凍する
   - XML を直接修正する
   - 変更のたびに検証する
   - 完了したら再パックする
```

<Tip>
  ワークフローが多くのステップで大きく複雑になった場合は、それらを別のファイルに移し、目前のタスクに基づいて適切なファイルを読み込むよう Claude に指示することを検討してください。
</Tip>

## 評価とイテレーション

### 最初に評価を構築する

**広範なドキュメントを書く前に評価 (Evaluation) を作成してください。** これにより、スキルが想像上の問題ではなく、実際の問題を解決することを保証できます。

**評価主導の開発:**

1. **ギャップの特定**: スキルなしで代表的なタスクに対して Claude を実行します。具体的な失敗や欠落しているコンテキストを記録します
2. **評価の作成**: これらのギャップをテストする 3 つのシナリオを構築します
3. **基準線の確立**: スキルなしでの Claude のパフォーマンスを測定します
4. **最小限の指示を書く**: ギャップに対処し、評価をパスするのに十分なコンテンツだけを作成します
5. **繰り返す**: 評価を実行し、基準線と比較し、改良します

このアプローチにより、決して具体化されないかもしれない要件を予想するのではなく、実際の問題を解決していることを確認できます。

**評価の構造**:

```json  theme={null}
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "適切な PDF 処理ライブラリまたはコマンドラインツールを使用して、PDF ファイルを正常に読み取る",
    "ページを欠かすことなく、ドキュメント内のすべてのページからテキストコンテンツを抽出する",
    "抽出されたテキストを、明確で読みやすい形式で output.txt という名前のファイルに保存する"
  ]
}
```

<Note>
  この例は、シンプルなテストルーブリックを使用したデータ駆動型の評価を示しています。現在、これらの評価を実行するための組み込みの方法は提供されていません。ユーザーは独自の評価システムを作成できます。評価は、スキルの効果を測定するための「唯一の真実」です。
</Note>

### Claude とともにスキルを反復的に開発する

最も効果的なスキル開発プロセスには、Claude 自体が関与します。ある Claude のインスタンス（「Claude A」）と協力して、他のインスタンス（「Claude B」）が使用するスキルを作成します。Claude A は指示の設計と洗練を助け、Claude B は実際のタスクでそれらをテストします。これは、Claude モデルが効果的なエージェントの指示の書き方と、エージェントが必要とする情報の両方を理解しているために機能します。

**新しいスキルの作成:**

1. **スキルなしでタスクを完了する**: 通常のプロンプトを使用して、Claude A とともに問題を解決します。作業を進める中で、自然にコンテキストを提供し、好みを説明し、手順に関する知識を共有することになります。繰り返し提供している情報に注目してください。

2. **再利用可能なパターンの特定**: タスク完了後、将来の同様のタスクに役立つどのようなコンテキストを提供したかを特定します。

   **例**: BigQuery の分析を行った場合、テーブル名、フィールド定義、フィルタリングルール（「常にテストアカウントを除外する」など）、および一般的なクエリパターンを提供したかもしれません。

3. **Claude A にスキル作成を依頼する**: 「今使用したこの BigQuery 分析パターンを捉えたスキルを作成してください。テーブルスキーマ、命名規則、およびテストアカウントをフィルタリングするルールを含めてください。」

   <Tip>
     Claude モデルはスキルの形式と構造をネイティブに理解しています。Claude にスキル作成を手伝ってもらうために、特別なシステムプロンプトや「スキル作成」スキルは必要ありません。単にスキルを作成するよう Claude に依頼すれば、適切なフロントマターと本文を持つ、正しく構造化された `SKILL.md` コンテンツが生成されます。
   </Tip>

4. **簡潔さをレビューする**: Claude A が不必要な説明を追加していないか確認します。「勝率 (win rate) の意味についての説明は削除してください。Claude はすでにそれを知っています」と伝えます。

5. **情報アーキテクチャの改善**: コンテンツをより効果的に整理するよう Claude A に依頼します。例えば、「テーブルスキーマは別のリファレンスファイルにするように整理してください。後でテーブルを追加するかもしれません」などです。

6. **同様のタスクでテストする**: スキルがロードされた新しいインスタンスである Claude B で、関連するユースケースに対してそのスキルを使用します。Claude B が正しい情報を見つけ、ルールを正しく適用し、タスクを正常に処理するかどうかを観察します。

7. **観察に基づいて反復する**: Claude B が苦戦したり何かを見落としたりした場合は、具体例を持って Claude A に戻ります。「Claude がこのスキルを使用したとき、第 4 四半期の日付でフィルタリングするのを忘れていました。日付フィルタリングパターンについてのセクションを追加すべきでしょうか？」

**既存スキルの反復:**

スキルの改善においても、同じ階層的なパターンが続きます。以下の間を行き来します：

* **Claude A との作業**（スキルの洗練を助けるエキスパート）
* **Claude B でのテスト**（スキルを使用して実際の作業を行うエージェント）
* **Claude B の動作の観察**と Claude A への洞察の持ち帰り

1. **実際のワークフローでスキルを使用する**: テストシナリオではなく、実際のタスクを Claude B（スキルがロードされた状態）に与えます

2. **Claude B の動作を観察する**: どこで苦戦し、どこで成功し、あるいはどこで予期せぬ選択をしたかをメモします

   **観察例**: 「Claude B に地域別の売上レポートを依頼したところ、クエリは書きましたが、スキルにそのルールが記載されているにもかかわらず、テストアカウントのフィルタリングを忘れました。」

3. **改善のために Claude A に戻る**: Share the current SKILL.md and describe what you observed. Ask: 「地域レポートを依頼したときに Claude B がテストアカウントのフィルタリングを忘れたことに気づきました。スキルにはフィルタリングについて記載されていますが、十分に目立っていないのかもしれません。」

4. **Claude A の提案をレビューする**: Claude A は、ルールをより目立たせるための再編、"always filter" (常にフィルタリングする) の代わりに "MUST filter" (必ずフィルタリングしなければならない) のようなより強い言葉の使用、あるいはワークフローセクションの再構築などを提案するかもしれません。

5. **変更を適用してテストする**: Claude A の洗練を反映してスキルを更新し、同様の要求で Claude B と再度テストします

6. **使用状況に基づいて繰り返す**: 新しいシナリオに遭遇するたびに、この「観察-洗練-テスト」のサイクルを続けます。各イテレーションは、推測ではなく、実際のエージェントの行動に基づいてスキルを向上させます。

**チームからのフィードバックの収集:**

1. チームメンバーとスキルを共有し、彼らの使用状況を観察します
2. 尋ねます：スキルは期待通りにアクティブになりますか？指示は明確ですか？何が欠けていますか？
3. フィードバックを取り入れ、自分自身の使用パターンにおける盲点に対処します

**なぜこのアプローチが機能するのか**: Claude A はエージェントのニーズを理解しており、あなたはドメインの専門知識を提供し、Claude B は実際の使用を通じてギャップを明らかにし、反復的な洗練は推測ではなく観察された行動に基づいてスキルを向上させるからです。

### Claude がどのようにスキルをナビゲートするかを観察する

スキルを反復する際は、Claude が実際にどのようにそれを使用しているかに注意を払ってください。以下に注目してください：

* **予期せぬ探索パス**: Claude はあなたが想定していなかった順序でファイルを読み込んでいますか？これは、あなたの構造が思ったほど直感的ではないことを示している可能性があります
* **見落とされた繋がり**: Claude は重要なファイルへの参照に従うことに失敗していませんか？リンクをより明示的または目立たせる必要があるかもしれません
* **特定のセクションへの過度の依存**: Claude が同じファイルを繰り返し読み込んでいる場合、そのコンテンツをメインの `SKILL.md` に移すべきかどうかを検討してください
* **無視されたコンテンツ**: Claude がバンドルされたファイルに一度もアクセスしない場合、それは不要であるか、メインの指示での合図が不十分である可能性があります

推測ではなく、これらの観察に基づいて反復してください。スキルのメタデータの `name` と `description` は特に重要です。Claude は現在のタスクに応じてスキルをトリガーするかどうかを決定する際にこれらを使用します。これらが、スキルが何を行い、いつ使用されるべきかを明確に記述していることを確認してください。

## 避けるべきアンチパターン

### Windows スタイルのパスを避ける

Windows 上であっても、ファイルパスには常にスラッシュを使用してください：

* ✓ **良い**: `scripts/helper.py`, `reference/guide.md`
* ✗ **避ける**: `scripts\helper.py`, `reference\guide.md`

Unix スタイルのパスはすべてのプラットフォームで機能しますが、Windows スタイルのパスは Unix システムでエラーを引き起こします。

### 選択肢を与えすぎない

必要でない限り、複数のアプローチを提示しないでください：

````markdown  theme={null}
**悪い例：選択肢が多すぎる**（混乱を招く）:
「pypdf、pdfplumber、PyMuPDF、pdf2image などを使用できます...」

**良い例：デフォルトを提供する**（エスケープハッチ付き）:
「テキスト抽出には pdfplumber を使用してください：
```python
import pdfplumber
```

OCR を必要とするスキャンされた PDF の場合は、代わりに pytesseract 付きの pdf2image を使用してください。」
````

## アドバンス：実行可能なコードを含むスキル

以下のセクションでは、実行可能なスクリプトを含むスキルに焦点を当てます。スキルが Markdown の指示のみを使用する場合は、[効果的なスキルのためのチェックリスト](#checklist-for-effective-skills) へ進んでください。

### 丸投げせず、解決する

スキルのためのスクリプトを書くときは、Claude に丸投げするのではなく、エラー条件を処理してください。

**良い例：エラーを明示的に処理する**:

```python  theme={null}
def process_file(path):
    """ファイルを処理し、存在しない場合は作成します。"""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # 失敗する代わりにデフォルトのコンテンツでファイルを作成する
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        # 失敗する代わりに代替案を提供する
        print(f"Cannot access {path}, using default")
        return ''
```

**悪い例：Claude に丸投げする**:

```python  theme={null}
def process_file(path):
    # 単に失敗させて Claude に考えさせる
    return open(path).read()
```

設定パラメータも、根拠を明確にし、文書化して「謎の定数 (voodoo constants)」を避けるべきです（アウスターハウトの法則）。あなたが正しい値を知らなければ、Claude はどうやってそれを決定するのでしょうか？

**良い例：自己文書化**:

```python  theme={null}
# HTTP リクエストは通常 30 秒以内に完了します
# 長めのタイムアウトは低速な接続を考慮しています
REQUEST_TIMEOUT = 30

# 3 回の再試行は信頼性と速度のバランスをとっています
# ほとんどの一時的な失敗は 2 回目の再試行までに解決します
MAX_RETRIES = 3
```

**悪い例：マジックナンバー**:

```python  theme={null}
TIMEOUT = 47  # なぜ 47 なのか？
RETRIES = 5   # なぜ 5 なのか？
```

### ユーティリティスクリプトを提供する

Claude がスクリプトを書けるとしても、あらかじめ用意されたスクリプトには利点があります：

**ユーティリティスクリプトの利点**:

* 生成されたコードよりも信頼性が高い
* トークンの節約（コンテキストにコードを含める必要がない）
* 時間の節約（コード生成が不要）
* 使用間での一貫性の確保

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=4bbc45f2c2e0bee9f2f0d5da669bad00" alt="指示ファイルと並行して実行可能なスクリプトをバンドルする" data-og-width="2048" width="2048" data-og-height="1154" height="1154" data-path="images/agent-skills-executable-scripts.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=9a04e6535a8467bfeea492e517de389f 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=e49333ad90141af17c0d7651cca7216b 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=954265a5df52223d6572b6214168c428 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=2ff7a2d8f2a83ee8af132b29f10150fd 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=48ab96245e04077f4d15e9170e081cfb 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0301a6c8b3ee879497cc5b5483177c90 2500w" />

上の図は、実行可能なスクリプトが指示ファイルとどのように連携するかを示しています。指示ファイル (`forms.md`) がスクリプトを参照し、Claude はその内容をコンテキストに読み込むことなく実行できます。

**重要な区別**: Claude が以下のいずれを行うべきか、指示の中で明確にしてください：

* **スクリプトを実行する**（最も一般的）: 「`analyze_form.py` を実行してフィールドを抽出する」
* **リファレンスとして読み取る**（複雑なロジックの場合）: 「フィールド抽出アルゴリズムについては `analyze_form.py` を参照」

ほとんどのユーティリティスクリプトでは、実行の方が信頼性が高く効率的であるため、実行が好まれます。スクリプト実行の仕組みの詳細については、後述の [ランタイム環境](#runtime-environment) セクションを参照してください。

**例**:

````markdown  theme={null}
## ユーティリティスクリプト

**analyze_form.py**: PDF からすべてのフォームフィールドを抽出する

```bash
python scripts/analyze_form.py input.pdf > fields.json
```

出力形式:
```json
{
  "field_name": {"type": "text", "x": 100, "y": 200},
  "signature": {"type": "sig", "x": 150, "y": 500}
}
```

**validate_boxes.py**: 重複する境界ボックスがないかチェックする

```bash
python scripts/validate_boxes.py fields.json
# 返り値: "OK" または競合のリスト
```

**fill_form.py**: フィールド値を PDF に適用する

```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
````

### 視覚的分析を使用する

入力を画像としてレンダリングできる場合は、Claude に分析させます：

````markdown  theme={null}
## フォームレイアウト分析

1. PDF を画像に変換する：
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. 各ページの画像を分析してフォームフィールドを特定する
3. Claude はフィールドの場所とタイプを視覚的に把握できる
````

<Note>
  この例では、`pdf_to_images.py` スクリプトを自作する必要があります。
</Note>

Claude の視覚能力は、レイアウトや構造を理解するのに役立ちます。

### 検証可能な中間出力を生成する

Claude が複雑で自由度の高いタスクを実行するとき、間違いを犯す可能性があります。「計画-検証-実行」パターンは、Claude にまず構造化された形式で計画を作成させ、実行前にスクリプトでその計画を検証させることで、エラーを早期に発見します。

**例**: スプレッドシートに基づいて PDF 内の 50 個のフォームフィールドを更新するよう Claude に依頼する場合を想像してください。検証がないと、Claude は存在しないフィールドを参照したり、競合する値を作成したり、必須フィールドを見落としたり、更新を誤って適用したりする可能性があります。

**解決策**: 上記のワークフローパターン（PDF フォーム記入）を使用しますが、変更を適用する前に検証される中間ファイル `changes.json` を追加します。ワークフローは「分析 → **計画ファイルの作成** → **計画の検証** → 実行 → 確認」となります。

**なぜこのパターンが機能するのか:**

* **エラーを早期に発見**: 変更が適用される前に検証が問題を見つける
* **機械的に検証可能**: スクリプトが客観的な検証を提供する
* **可逆的な計画**: Claude はオリジナルに触れることなく計画を反復できる
* **明確なデバッグ**: エラーメッセージが特定の場所の問題を指し示す

**いつ使用するか**: バッチ操作、破壊的な変更、複雑な検証ルール、リスクの高い操作。

**実装のヒント**: 検証スクリプトは、Claude が問題を修正しやすくなるように、"Field 'signature_date' not found. Available fields: customer_name, order_total, signature_date_signed"（フィールド 'signature_date' が見つかりません。利用可能なフィールド: customer_name, order_total, signature_date_signed）のような具体的なエラーメッセージを詳細に出力するようにしてください。

### 依存関係のパッケージ化

スキルは、プラットフォーム固有の制限があるコード実行環境で実行されます：

* **claude.ai**: npm や PyPI からパッケージをインストールし、GitHub リポジトリから取得できます
* **Anthropic API**: ネットワークアクセスがなく、ランタイムでのパッケージインストールはできません

`SKILL.md` に必要なパッケージをリストし、[コード実行ツール ドキュメント](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool) で利用可能であることを確認してください。

### ランタイム環境

スキルは、ファイルシステムアクセス、bash コマンド、およびコード実行機能を備えたコード実行環境で動作します。このアーキテクチャの概念的な説明については、概要の [スキルのアーキテクチャ](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#the-skills-architecture) を参照してください。

**これが作成にどのように影響するか:**

**Claude がスキルにアクセスする方法:**

1. **メタデータのプリロード**: 起動時に、すべてのスキルの YAML フロントマターから名前と説明がシステムプロンプトにロードされる
2. **オンデマンドのファイル読み込み**: Claude は、必要に応じて bash の `Read` ツールを使用して、ファイルシステムから `SKILL.md` や他のファイルにアクセスする
3. **効率的なスクリプト実行**: ユーティリティスクリプトは、その全内容をコンテキストに読み込むことなく、bash を介して実行できる。スクリプトの出力のみがトークンを消費する
4. **大容量ファイルによるコンテキストのペナルティなし**: リファレンスファイル、データ、またはドキュメントは、実際に読み込まれるまでコンテキストトークンを消費しない

* **ファイルパスが重要**: Claude は、ファイルシステムのようにスキルディレクトリをナビゲートします。バックスラッシュではなく、スラッシュ (`reference/guide.md`) を使用してください
* **ファイルを記述的に命名する**: `doc2.md` ではなく、コンテンツを示す名前を使用します: `form_validation_rules.md`
* **検出のために整理する**: ドメインまたは機能ごとにディレクトリを構成します
  * 良い: `reference/finance.md`, `reference/sales.md`
  * 悪い: `docs/file1.md`, `docs/file2.md`
* **包括的なリソースをバンドルする**: 完全な API ドキュメント、広範な例、大規模なデータセットを含めます。アクセスされるまでコンテキストペナルティはありません
* **決定論的な操作にはスクリプトを好む**: Claude に検証コードを生成させるのではなく、`validate_form.py` を作成します
* **実行の意図を明確にする**:
  * 「`analyze_form.py` を実行してフィールドを抽出する」 (実行)
  * 「抽出アルゴリズムについては `analyze_form.py` を参照」 (リファレンスとして読み取り)
* **ファイルアクセスのパターンをテストする**: 実際の要求でテストして、Claude がディレクトリ構造をナビゲートできることを確認します

**例:**

```
bigquery-skill/
├── SKILL.md (概要、リファレンスファイルへの案内)
└── reference/
    ├── finance.md (収益指標)
    ├── sales.md (パイプラインデータ)
    └── product.md (使用状況分析)
```

ユーザーが収益について尋ねると、Claude は `SKILL.md` を読み取り、`reference/finance.md` への参照を確認し、bash を呼び出してそのファイルだけを読み取ります。`sales.md` と `product.md` はファイルシステムに残ったままであり、必要になるまでコンテキストトークンを一切消費しません。このファイルシステムベースのモデルこそが、段階的開示を可能にしているものです。Claude は、各タスクが必要とするものを正確にナビゲートし、選択的にロードできます。

技術的なアーキテクチャの完全な詳細については、スキルの概要の [スキルの仕組み](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work) を参照してください。

### MCP ツールの参照

スキルで MCP (Model Context Protocol) ツールを使用する場合は、「ツールが見つかりません」というエラーを避けるために、常に完全修飾されたツール名を使用してください。

**形式**: `ServerName:tool_name`

**例**:

```markdown  theme={null}
テーブルスキーマを取得するには BigQuery:bigquery_schema ツールを使用してください。
Issue を作成するには GitHub:create_issue ツールを使用してください。
```

ここで：

* `BigQuery` と `GitHub` は MCP サーバー名です
* `bigquery_schema` と `create_issue` は、それらのサーバー内のツール名です

サーバープレフィックスがないと、特に複数の MCP サーバーが利用可能な場合に、Claude がツールを特定できない可能性があります。

### ツールがインストールされていると想定しない

パッケージが利用可能であると想定しないでください：

````markdown  theme={null}
**悪い例：インストール済みと想定**:
「ファイルを処理するには pdf ライブラリを使用してください。」

**良い例：依存関係を明示する**:
「必須パッケージをインストールしてください: `pip install pypdf`

その後、それを使用します：
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```」
````

## テクニカルノート

### YAML フロントマターの要件

`SKILL.md` のフロントマターには、`name`（最大 64 文字）と `description`（最大 1024 文字）フィールドが必要です。構造の完全な詳細については、[スキルの概要](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#skill-structure) を参照してください。

### トークンの予算

最適なパフォーマンスを得るために、`SKILL.md` の本文を 500 行未満に抑えてください。コンテンツがこれを超える場合は、前述の段階的開示パターンを使用して、コンテンツを別のファイルに分割してください。アーキテクチャの詳細については、[スキルの概要](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work) を参照してください。

## 効果的なスキルのためのチェックリスト

スキルを共有する前に、以下を確認してください：

### 基本品質

* [ ] 説明が具体的であり、重要な用語を含んでいる
* [ ] 説明にスキルの機能と使用時期の両方が含まれている
* [ ] SKILL.md の本文が 500 行未満である
* [ ] 追加の詳細は別のファイルにある（必要な場合）
* [ ] 時間に敏感な情報が含まれていない（または「古いパターン」セクションにある）
* [ ] 用語が全体を通して一貫している
* [ ] 例が抽象的ではなく具体的である
* [ ] ファイル参照が 1 レベルの深さである
* [ ] 段階的開示が適切に使用されている
* [ ] ワークフローに明確なステップがある

### コードとスクリプト

* [ ] スクリプトが問題を解決しており、Claude に丸投げしていない
* [ ] エラーハンドリングが明示的で役立つものである
* [ ] 「謎の定数」がない（すべての値の根拠がある）
* [ ] 必要なパッケージが指示にリストされており、利用可能であることが確認されている
* [ ] スクリプトに明確なドキュメントがある
* [ ] Windows スタイルのパスがない（すべてスラッシュを使用）
* [ ] 重要な操作に対する検証/確認ステップがある
* [ ] 品質が重要なタスクにフィードバックループが含まれている

### テスト

* [ ] 少なくとも 3 つの評価 (Evaluation) が作成されている
* [ ] Haiku、Sonnet、および Opus でテストされている
* [ ] 実際の使用シナリオでテストされている
* [ ] チームからのフィードバックが取り入れられている（該当する場合）

## 次のステップ

<CardGroup cols={2}>
  <Card title="エージェントスキルを始める" icon="rocket" href="https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/quickstart">
    最初のスキルを作成する
  </Card>

  <Card title="Claude Code でスキルを使用する" icon="terminal" href="https://docs.anthropic.com/en/docs/claude-code/skills">
    Claude Code でスキルを作成・管理する
  </Card>

  <Card title="API でスキルを使用する" icon="code" href="/en/api/skills-guide">
    プログラムでスキルをアップロードして使用する
  </Card>
</CardGroup>
