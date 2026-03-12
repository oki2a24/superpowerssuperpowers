import fs from 'node:fs';

const TARGET_HEADER = "## ローカル・アダプテーション (Gemini固有)";

/**
 * 指定されたスキルファイルからローカル・アダプテーションセクションを削除します。
 *
 * @param {string} filePath - リセットするスキルファイルへのパス。
 * @returns {boolean} 正常にセクションが削除された場合は true、セクションが見つからないかファイルが存在しない場合は false。
 */
export function resetSkillFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const index = content.indexOf(TARGET_HEADER);

  if (index === -1) return false;

  // セクションの直前までの内容を取得
  let newContent = content.slice(0, index);
  
  // 【知見】セクションを削除した後に不要な空行が残らないよう、trimEnd() で末尾の空白を削除します。
  // これにより、元のファイルでセクションの前に複数の空行が存在していた場合でも、
  // 後の改行付与ロジックと組み合わせて、適切に 1 つの改行に集約されます。
  newContent = newContent.trimEnd();
  
  // 【知見】POSIX 標準のテキストファイル形式（末尾改行）を維持するため、
  // コンテンツが存在する場合は末尾に必ず 1 つの改行を付与します。
  // newContent が空（ファイル全体が削除対象だった場合など）は、完全に空のファイルとします。
  if (newContent && !newContent.endsWith('\n')) {
    newContent += '\n';
  }

  fs.writeFileSync(filePath, newContent);
  return true;
}
