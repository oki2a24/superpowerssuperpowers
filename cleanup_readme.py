import re

def main():
    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Gemini CLI installation block and its header/footer parts
    # We want to remove the entire segment from "**Gemini CLI の場合:**" up to the next newline or end of code block.
    # Let's use a more robust way by finding the specific text pattern.
    content = re.sub(r'\*\*Gemini CLI の場合:\*\*\n```bash\ngemini extensions install .*?\n```\n', '', content, flags=re.DOTALL)

    # 2. Fix header (line 6)
    content = content.replace("**Antigravity CLI (agy) & Gemini CLI のための高精度インテリジェンス & スキル拡張**", "**Antigravity CLI (agy) のための高精度インテリジェンス & スキル拡張**")

    # 3. Replace observations paths
    # Original architecture diagram part: (~/.gemini/observations/)               (./.gemini/observations/)
    content = content.replace("(~/.gemini/observations/)               (./.gemini/observations/)", "~/.antigravity/observations/")

    # 4. Table cleanup (the <br>(...) part)
    content = re.sub(r'<br>\(`\.\/\.gemini\/observations\/\`\)', '', content)
    content = re.sub(r'<br>\(`~\/\.gemini\/observations\/\`\)', '', content)

    # 5. Unify "(または `.gemini/`)" in the directory list section (around line 170 in original, now probably around 168)
    content = content.replace("(または `.gemini/`)", ")")

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
