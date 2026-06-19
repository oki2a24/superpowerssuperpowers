import re

def main():
    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Gemini installation block. It starts at "**Gemini CLI の場合:**" and ends at the next "```".
    # But wait, there's an Antigravity one before it. 
    # The original file has:
    # ### 1. インストール
    # **Antigravity CLI (agy) の場合:**
    # ```bash
    # agy plugin install ...
    # ```
    #
    # **Gemini CLI の場合:**
    # ```bash
    # gemini extensions install ...
    # ```

    # Let's use regex to find the block specifically for Gemini.
    pattern = r'\*\*Gemini CLI の場合:\*\*\n```bash\ngemini extensions install .*?\n```'
    content = re.sub(pattern, '', content)

    # 2. Remove any leftover "gemini extensions install" if it's outside a block (just in case)
    content = re.sub(r'gemini extensions install https://github.com/oki2a24/superpowerssuperpowers\n```', '', content)

    # 3. Fix header line 6
    content = content.replace("**Antigravity CLI (agy) & Gemini CLI のための高精度インテリジェンス & スキル拡張**", "**Antigravity CLI (agy) のための高精度インテリジェンス & スキル拡張**")

    # 4. Path replacements
    content = content.replace("(~/.gemini/observations/)               (./.gemini/observations/)", "~/.antigravity/observations/")
    content = re.sub(r'<br>\(`\.\/\.gemini\/observations\/\`\)', '', content)
    content = re.sub(r'<br>\(`~\/\.gemini\/observations\/\`\)', '', content)

    # 5. Unify (または `.gemini/`) in the directory list section
    # Around line 168-169 in original README
    content = content.replace("(または `.gemini/`)", ")")

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
