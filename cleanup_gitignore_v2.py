import re

def main():
    with open('.gitignore', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace # Gemini CLI Temporary Tasks with Antigravity one, or just remove the whole block if duplicate exists.
    # Let's just look for the pattern and replace everything to match what we want.
    # I want exactly this in .gitignore:
    # (empty lines)
    # # Antigravity CLI Temporary Tasks
    # .antigravity/tasks/*
    # !.antigravity/tasks/.gitkeep
    # (maybe the existing Antigravity block stays as is, and we remove the Gemini one)

    # Let's try to just replace all occurrences of gemini with antigravity in that context
    content = content.replace('# Gemini CLI Temporary Tasks', '# Antigravity CLI Temporary Tasks')
    content = content.replace('.gemini/tasks/*', '.antigravity/tasks/*')
    content = content.replace('!.gemini/tasks/.gitkeep', '!.antigravity/tasks/.gitkeep')

    # Now we have duplicates if the original already had them. Let's remove duplicate blocks.
    # A block is:
    # # Antigravity CLI Temporary Tasks
    # .antigravity/tasks/*
    # !.antigravity/tasks/.gitkeep

    pattern = r'(# Antigravity CLI Temporary Tasks\n\.antigravity/tasks/\*\n!\.antigravity/tasks/\.gitkeep)'
    content = re.sub(pattern + r'\n', '', content) 
    # Actually, the duplicate might not have a newline if it's at the end or something. 
    # Let's use a simpler approach: replace them with nothing and then add one clean block if needed.

    with open('.gitignore.tmp', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
