/**
 * Markdown の Frontmatter を抽出し、パースを行います。
 * 
 * 【実装の背景と苦労した点】
 * 標準ライブラリのみで動作させるため、YAML パーサーを自作しました。実装中、以下の「型判定の曖昧さ」が
 * 大きな課題となりました：
 * 
 * 1. 曖昧な空値:
 *    'key:' や 'key: ""' という行が現れた際、それが「空の文字列」を意図しているのか、
 *    それとも「次の行からリストが始まる」のかを、その行単体では判定できません。
 * 
 * 2. 試行錯誤の末の解決策（遅延リスト変換）:
 *    - 最初にキーが現れた際は、一旦空文字列 "" として保持します。
 *    - 次の行が '- ' で始まるリストアイテムだった場合のみ、動的にリスト型 [] へ変換します。
 *    - これにより、'mission: ""'（空でエラーにしたい文字列）と、
 *      'steps:'（次にリストが続く正常な記述）を正確に区別できるようになりました。
 * 
 * 【パース制限】
 * - インデントは無視されます（フラットな構造のみサポート）。
 * - 値の中にコロン ':' を含む場合は、必ずクォート（"..."）で囲んでください。
 */
export function parseYamlFrontmatter(content) {
  const parts = content.split('---');
  // NOTE: 引数が Frontmatter のみの文字列（--- を含まない）である場合も考慮できるよう、
  // 柔軟にパース対象を決定します。
  const yamlText = parts.length >= 3 ? parts[1].trim() : content.trim();

  const data = {};
  let currentKey = null;

  for (const line of yamlText.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // リスト要素の処理
    if (trimmedLine.startsWith('- ')) {
      if (currentKey) {
        // 【重要】遅延変換: 最初のリストアイテムが現れた時点で、キーの型をリストに確定させる。
        // これにより、'mission: ""'（文字列）と 'steps:'（リスト）のパース時の曖昧さを排除している。
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = [];
        }
        const val = trimmedLine.slice(2).trim();
        data[currentKey].push(removeQuotes(val));
      } else {
        throw new Error(`YAML syntax error: Unexpected list item '${trimmedLine}'`);
      }
      continue;
    }

    // キー: 値 の処理
    if (!trimmedLine.includes(':')) {
      throw new Error(`YAML syntax error: Invalid line '${trimmedLine}'`);
    }

    const colonIndex = trimmedLine.indexOf(':');
    const key = trimmedLine.slice(0, colonIndex).trim();
    let val = trimmedLine.slice(colonIndex + 1).trim();

    // クォートの除去
    val = removeQuotes(val);

    // 値の中に裸のコロンが含まれているかチェック (クォート除去後)
    if (val.includes(':')) {
      throw new Error(`YAML syntax error: Invalid value '${val}' (Try quoting it)`);
    }

    if (!val) {
      // 空の値。現時点では文字列かリストか不明。
      // 次の行がリストアイテムならリストになる。
      data[key] = '';
    } else if (val === '[]') {
      data[key] = [];
    } else {
      data[key] = val;
    }
    currentKey = key;
  }

  return data;
}

function removeQuotes(val) {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1).trim();
  }
  return val;
}
