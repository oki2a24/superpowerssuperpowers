import re

path = '/Users/oki2a24/superpowerssuperpowers/README.md'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # 1. Diagram: remove L4 and fix redundancy in Line 122ish
    if 'L3: Personal (Global)' in line and 'L4: Project (Local)' in line:
        new_lines.append('     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)                   \n')
        continue
    if '~/.antigravity/observations/' in line and './.antigravity/observations/' in line:
        new_lines.append(' [Extension Root]/skills      [Extension Root]/observations    ~/.antigravity/observations/           \n')
        continue
    if '~/~/' in line or '.antigravity/sessions' in line or '../../' in line: # Cleanup debris
         # Skip the redundancy lines that might have been left by failed scripts
         if '~~~~~~~~~~~~~~~~' in line: continue
         if '//' in line: continue
         pass

    # 2. Table cleanup (Lines ~137)
    if '| **`./.antigravity/observations/`** | **L4: Project Local** |' in line:
        continue # Remove L4 row
    if 'L3: Personal Global' in line:
        line = line.replace('L3: Personal (Global)', 'L3: Global (~/.antigravity/)')

    # 3. Directory list cleanup (Lines ~167)
    if '.antigravity/skills/' in line:
        line = line.replace('.antigravity/skills/', '~/.antigravity/skills/')
    elif '.antigravity/observations/' in line:
        line = line.replace('.antigravity/observations/', '~/.antigravity/observations/')

    new_lines.append(line)

# After constructing, I will do one final pass with regex for the residue of my failed attempts
final_text = "".join(new_lines)
final_text = re.sub(r'~/\~/', '~/', final_text) # Fix double tilde
final_text = re.sub(r'~\s+~', '~\n', final_text) # Just in case

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_text)
