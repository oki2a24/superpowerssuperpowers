#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
スキルファイルのリセットスクリプト

指定されたスキルファイル（Markdown形式）から、
「## ローカル・アダプテーション (Gemini固有)」というヘッダー以降の記述を削除し、
純粋な移植版の状態にリセットします。
"""

import sys
import os

# ローカル・アダプテーションセクションを識別するターゲットヘッダー
TARGET_HEADER = "## ローカル・アダプテーション (Gemini固有)"

def reset_skill_file(file_path: str) -> bool:
    """
    指定されたスキルファイルからローカル・アダプテーションセクションを削除します。

    Args:
        file_path (str): リセットするスキルファイルへのパス。

    Returns:
        bool: 正常にセクションが削除された場合はTrue、
              セクションが見つからないかファイルが存在しない場合はFalse。
    """
    # ファイルの存在確認
    if not os.path.exists(file_path):
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    found_index = -1
    # ターゲットヘッダーの行番号を検索
    for i, line in enumerate(lines):
        if TARGET_HEADER in line:
            found_index = i
            break

    # ターゲットヘッダーが見つかった場合
    if found_index != -1:
        # ヘッダー以前の行を保持
        new_lines = lines[:found_index]
        
        # ヘッダー直前の不要な空行を削除し、クリーンな状態にする
        while new_lines and not new_lines[-1].strip():
            new_lines.pop()
        
        # ファイルの最後に改行があることを保証する（存在しない場合のみ追加）
        if new_lines and not new_lines[-1].endswith('\n'):
            new_lines[-1] += "\n"

        # 修正された内容でファイルを上書き保存
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    else:
        # ターゲットヘッダーが見つからなかった場合
        return False

def main():
    """
    スクリプトのエントリーポイント。
    コマンドライン引数としてファイルパスを受け取り、reset_skill_fileを呼び出します。
    """
    if len(sys.argv) < 2:
        print("使用法: python reset_skill.py <スキルファイルのパス> ...")
        sys.exit(1)

    # 各ファイルパスに対してリセット処理を実行
    for path in sys.argv[1:]:
        reset_skill_file(path)

if __name__ == "__main__":
    main()
