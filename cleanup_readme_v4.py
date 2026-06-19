import re

def main():
    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the Gemini installation block completely.
    pattern_gemini_block = r'\*\*Gemini CLI の場合:\*\*\s*```bash\n.*?```'
    content = re.sub(pattern_gemini_block, '', content, flags=re.DOTALL)

    # 2. Fix header line 6
    content = content.replace("**Antigravity CLI (agy) & Gemini CLI のための高精度インテリジェンス & スキル拡張**", "**Antigravity CLI (agy) のための高精度インテリジェンス & スキル拡張**")

    # 3. Replace observations paths in architecture diagram
    content = content.replace("(~/.gemini/observations/)               (./.gemini/observations/)", "~/.antigravity/observations/")

    # 4. Handle the <br> stuff in tables (remove it)
    content = re.sub(r'<br>\(`\.\/\.gemini\/observations\/\`\)', '', content)
    content = re.sub(r'<br>\(`~\/\.gemini\/observations\/\`\)', '', content)

    # 5. Cleanup the " (または .gemini/) " pattern in directory lists
    # It's typically: `(.antigravity/...) (または .gemini/) : ...`
    # We want to replace it with just `(.antigravity/...) : ...` or better yet, remove the extra bracket.
    content = re.sub(r'\s*\(または\s*\`.\.gemini\/.*\`\)\s*', ' ', content) # This might be too aggressive

    # Let's try a more specific replacement for that pattern
    content = re.sub(r'\s*\(または\s*\`\.gemini/.*?`\)', '', content) 
    content = re.sub(r'\s*\(または\s*\`~/.gemini/.*?`\)', '', content)

    # Wait, looking at line 168 in output: `- **`.antigravity/skills/` ) : ...`
    # It seems there was a `)` left over from the match. I'll just do another pass for trailing single closing brackets next to colons if they look like that.
    content = re.sub(r'\s*\)\s*:', ' :', content)

    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
