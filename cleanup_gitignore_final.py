import re

def main():
    with open('.gitignore', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # If we find a Gemini comment and then tasks, we skip them if they are redundant.
        if "# Gemini CLI Temporary Tasks" in line:
            # Skip this whole block (the header and the next 3 lines)
            i += 4
            continue
        
        # Otherwise, just perform replacement on any remaining .gemini references
        line = line.replace('.gemini/tasks/*', '.antigravity/tasks/*')
        line = line.replace('!.gemini/tasks/.gitkeep', '!.antigravity/tasks/.gitkeep')
        new_lines.append(line)
        i += 1

    with open('.gitignore', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
