# 多層防御バリデーション (Defense-in-Depth Validation)

## 概要

無効なデータによって引き起こされたバグを修正する際、一箇所にバリデーションを追加するだけで十分だと感じることがあります。しかし、その単一のチェックは、別のコードパス、リファクタリング、あるいはモックによってバイパス（回避）される可能性があります。

**中核原則:** データが通過する「すべての」レイヤーでバリデーションを行うこと。バグを構造的に不可能にすること。

## なぜ多層にするのか

- 単一のバリデーション: 「バグを修正した」
- 多層のバリデーション: 「バグを不可能にした」

異なるレイヤーが異なるケースをキャッチします。
- **入口のバリデーション:** ほとんどのバグをキャッチする。
- **ビジネスロジック:** エッジケースをキャッチする。
- **環境ガード:** コンテキスト固有の危険（例：テスト中の誤操作）を防ぐ。
- **デバッグログ:** 他のレイヤーが失敗した際の調査を助ける。

## 4つのレイヤー

### レイヤー 1: エントリポイント・バリデーション
**目的:** APIの境界で、明らかに無効な入力を拒否する。

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory を空にすることはできません');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory が存在しません: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory はディレクトリではありません: ${workingDirectory}`);
  }
  // ... 続行
}
```

### レイヤー 2: ビジネスロジック・バリデーション
**目的:** その操作においてデータが意味をなしていることを保証する。

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('ワークスペースの初期化には projectDir が必要です');
  }
  // ... 続行
}
```

### レイヤー 3: 環境ガード (Environment Guards)
**目的:** 特定のコンテキスト（例：テスト環境）での危険な操作を防止する。

```typescript
async function gitInit(directory: string) {
  // テスト中は、一時ディレクトリ以外での git init を拒否する
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `テスト中に一時ディレクトリ以外での git init を拒否しました: ${directory}`
      );
    }
  }
  // ... 続行
}
```

### レイヤー 4: デバッグ・インストルメンテーション
**目的:** 調査（フォレンジック）のためのコンテキストをキャプチャする。

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('git init を実行しようとしています', {
    directory,
    cwd: process.cwd(),
    stack,
  });
  // ... 続行
}
```

## パターンの適用方法

バグを見つけたとき：

1.  **データフローを追跡する** - 不正な値はどこから来たか？どこで使用されているか？
2.  **すべてのチェックポイントをマッピングする** - データが通過するすべての地点をリストアップする。
3.  **各レイヤーにバリデーションを追加する** - 入口、ビジネス、環境、デバッグ。
4.  **各レイヤーをテストする** - レイヤー1をバイパスしてみて、レイヤー2がそれをキャッチすることを確認する。

## 重要な教訓

単一のバリデーションポイントで満足してはいけません。すべてのレイヤーにチェックを追加してください。
これにより、将来のコード変更や予期せぬ使用状況に対しても堅牢なシステムを構築できます。
