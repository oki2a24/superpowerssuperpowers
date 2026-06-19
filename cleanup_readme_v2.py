import re

def main():
    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the Gemini installation block completely.
    # Target pattern: **Gemini CLI の場合:** ... ```bash ... ```
    pattern_gemini_block = r'\*\*Gemini CLI の場合:\*\*\s*```bash\n.*?```'
    content = re.sub(pattern_gemini_block, '', content, flags=re.DOTALL)

    # 2. Remove "Gemini CLI" from the header (Line 6 in original README)
    content = content.replace("**Antigravity CLI (agy) & Gemini CLI のための高精度インテリジェンス & スキル拡張**", "**Antigravity CLI (agy) のための高精度インテリジェンス & スキル拡張**")

    # 3. Handle the observations path in Architecture Diagram
    # It's: (~/.gemini/observations/)               (./.gemini/observations/)
    content = content.replace("(~/.gemini/observations/)               (./.gemini/observations/)", "~/.antigravity/observations/")

    # 4. Handle observations paths in the table (with <br> wrappers)
    # This looks like: <br>(`./.gemini/observations/`)
    content = content.replace('<br>(`./.gemini/observations/`)', '')
    content = content.replace('<br>(`~/.gemini/observations/`)', '')

    # 5. Unify (または `.gemini/`) to just `)` in the directory list section
    content = content.replace("(または `.gemini/`)", ")")

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
