# opencode へのインストール

opencode に SuperpowersSuperpowers を統合する場合の手順です。

## インストール

プロジェクトディレクトリ（または `~/.config/opencode/opencode.json`）に
`opencode.json` を作成し、`plugin` 配列へ本リポジトリの git URL を
追加してください。

```json
{
   "plugin": [
        "superpowerssuperpowers@git+https://github.com/oki2a24/superpowerssuperpowers.git"
    ]
}
```

保存後、opencode を再起動します。再起動時に opencode 内蔵パッケージマネージャー
がプラグインを解決・ダウンロードし、`skills/` の全コアスキルを自動登録します。

特定の版本を固定したい場合、`#<tag>` または `#<branch>` を URL 末尾に添付します:

```json
{
   "plugin": [
        "superpowerssuperpowers@git+https://github.com/oki2a24/superpowerssuperpowers.git#HEAD"
    ]
}
```

## 動作確認

セッション開始直後、opencode に次のように入力してください:

> "あなたはどんなスキルを持っている？"

`using-superpowers` のブートストラップが注入されていれば、AI が
`brainstorming`/`test-driven-development` など、本プラグインの全スキル名を
列挙します。

または、opencode のネイティブ `skill` ツールに直接問いかけます:

```
skill ツールで利用可能なスキル一覧を表示して
```

### 自動起動テスト（acceptance test）

以下のプロンプトで、`brainstorming` が自動起動するか確認できます。

> react todo list を作りたい

AI が `brainstorming` スキルを起動し、コードを書く前に設計質問を始めたら、
統合は正しく機能しています。

## 更新

opencode の plugin 指定は `git+https` を使用するため、再起動時に最新 commit へ
自動更新されます。

```bash
# opencode を再起動（git+https 指定のため最新 commit へ自動更新されます）
# 手動でキャッシュを差し替えたい場合は:
opencode run --print-logs "reinstall superpowers" 2>&1
```

## トラブルシューティング

### プラグインが読み込まれない

```bash
opencode run --print-logs "hello" 2>&1 | grep -i superpower
```

ログに `plugin load` や `superpowers` が見えなければ、`opencode.json` の
`plugin` 配列が正しく記述されているかを確認してください。

### スキルが見つからない

```
`skill` ツールでスキル一覧を表示してください
```

``skills/` ディレクトリが `.opencode/plugins/superpowers.js` 内の `config`
フック経由で `config.skills.paths` へ登録されているはずですが、
`skills/using-superpowers/SKILL.md` が存在しない場合、プラグインは
ブートストラップを注入せず無音に終了します。git checkout が浅くないこと、
`.opencode/plugins/superpowers.js` が正しいパスを参照していることを確認
してください。

### 旧 symlink ベースのインストールからの移行

過去に `~/.config/opencode/plugins/superpowers.js` に symlink を張っていた
場合、プラグインを先に削除してください:

```bash
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers
```

## 個人スキル / プロジェクトスキル

| 範囲 | 配置先 |
|------|--------|
| プロジェクトスキル | `.opencode/skills/<name>/SKILL.md` |
| 個人スキル | `~/.config/opencode/skills/<name>/SKILL.md` |
| 外部スキル（自動ロード） | `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md` |
