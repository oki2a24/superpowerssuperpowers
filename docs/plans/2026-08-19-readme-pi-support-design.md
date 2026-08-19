# README.md Pi Coding Agent 対応反映 デザインドキュメント

## Overview
README.md に Pi Coding Agent の正式サポートを反映し、公式ドキュメントに基づいたインストール・アップデート・アンインストール手順を追記します。

## Target Files & Changes

### `README.md`
1. **概要・キャッチコピー**:
   - 対応環境として Antigravity CLI (agy), Gemini CLI, Codex に加えて Pi Coding Agent を明記。
2. **クイックスタート (Quick Start)**:
   - **1. インストール**: `pi install git:https://github.com/oki2a24/superpowerssuperpowers` を追加。
   - **2. アップデート**: `pi update git:https://github.com/oki2a24/superpowerssuperpowers` および `pi update --all` を追加。
   - **3. アンインストール**: `pi remove git:https://github.com/oki2a24/superpowerssuperpowers` を追加。

## Verification Plan
1. README.md の表示・記法に崩れがないか確認。
2. Git commit を作成。
