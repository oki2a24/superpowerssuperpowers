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

  let newContent = content.slice(0, index);
  
  // 直前の空行を削除してクリーンアップ
  newContent = newContent.trimEnd();
  
  // 末尾に改行を保証
  if (newContent && !newContent.endsWith('\n')) {
    newContent += '\n';
  }

  fs.writeFileSync(filePath, newContent);
  return true;
}
