# Observation: SessionStart フックによる自動注入

## 1. `using-superpowers` スキルの自動化
- **背景**: このプロジェクトでは、Gemini CLI の `SessionStart` フックにより `using-superpowers` スキルの内容が自動的に AI のシステムプロンプト冒頭に注入される。
- **推奨**: セッション開始時にエージェントが自ら `using-superpowers` を読み込む（`activate_skill` する）必要はない。フックによる注入が最優先のコンテキストとして既に機能しているため、エージェントは即座にタスク（`todo.mjs` の確認など）に着手すべきである。
- **検証方法**: セッション開始直後に `What are your current rules?` と尋ね、注入された内容が正しく認識されているか確認すること。
