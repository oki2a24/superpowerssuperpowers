import re

path = '/Users/oki2a24/superpowerssuperpowers/README.md'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []

# We will process the file line by line and skip lines we want to remove or replace.
i = 0
while i < len(lines):
    line = lines[i]

    # --- Diagram Cleanup (Line ~120s) ---
    if 'L3: Personal (Global)' in line and 'L4: Project (Local)' in line:
        new_lines.append('     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)                   \n')
        i += 1
        continue

    if '~/.antigravity/observations/' in line and './.antigravity/observations/' in line:
        new_lines.append(' [Extension Root]/skills      [Extension Root]/observations    ~/.antigravity/observations/           \n')
        i += 2 # Skip next line (which is the redundancy)
        continue

    # --- Table Cleanup (Line ~135s) ---
    if 'L4: Project Local' in line and '.antigravity/observations/' in line:
        i += 1
        continue # Remove this row completely

    if 'L3: Personal Global' in line:
        line = line.replace('**L3: Personal (Global)**', '**L3: Global (~/.antigravity/)**')
        new_lines.append(line)
        i += 1
        continue

    # --- Directory Structure Cleanup (Line ~165s) ---
    if '.antigravity/skills/' in line or '.antigravity/observations/' in line:
        # The user said "it should ONLY specify ~/.antigravity/"
        # To avoid confusion and duplication, we will unify these with the global ones.
        if '.antigravity/skills/' in line:
            line = line.replace('.antigravity/skills/', '~/.antigravity/skills/')
        elif '.antigravity/observations/' in line:
            line = line.replace('.antigravity/observations/', '~/.antigravity/observations/')

    new_lines.append(line)
    i += 1

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
