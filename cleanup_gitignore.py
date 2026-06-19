def main():
    with open('.gitignore', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        if '.gemini/tasks/*' in line:
            line = line.replace('.gemini/tasks/*', '.antigravity/tasks/*')
        elif '!.gemini/tasks/.gitkeep' in line:
            line = line.replace('!.gemini/tasks/.gitkeep', '!.antigravity/tasks/.gitkeep')
        new_lines.append(line)

    with open('.gitignore', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
