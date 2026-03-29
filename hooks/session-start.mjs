#!/usr/bin/env node

/**
 * @fileoverview Gemini CLI SessionStart Hook
 * このフックはセッション開始時に実行され、'using-superpowers' スキルの内容を
 * AI のコンテキストに注入することで、スキルの使用原則を徹底させます。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** ESモジュール環境での __dirname の代替 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** プロジェクトのルートディレクトリ（hooks/ の親） */
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * メイン処理: スキルファイルを読み込み、Gemini CLI が期待するフック形式の JSON を標準出力する。
 */
async function main() {
  try {
    // 1. using-superpowers スキルの内容を読み込む
    const skillPath = path.join(PROJECT_ROOT, 'skills', 'using-superpowers', 'SKILL.md');
    let skillContent = '';
    if (fs.existsSync(skillPath)) {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    } else {
      console.error(`Skill file not found: ${skillPath}`);
    }

    // 2. Gemini CLI Hook 形式の JSON を作成して stdout に出力
    const output = {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: `<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'using-superpowers' skill - your introduction to using skills. For all other skills, use the 'activate_skill' tool:**\n\n${skillContent}\n</EXTREMELY_IMPORTANT>`
      }
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    console.error('Hook error:', err);
    process.exit(1);
  }
}

main();
