import re

def fix():
    path = '/Users/oki2a24/superpowerssuperpowers/README.md'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Diagram fixes (Lines ~121)
    # Remove L4 entirely and fix the redundant Line 123.
    # We also ensure line 122 only has one instance of ~/.antigravity/observations/
    content = re.sub(r'L3: Personal \(Global\)                   L4: Project \(Local\)', 'L3: Global (~/.antigravity/)', content)
    content = content.replace('~/.antigravity/observations/            ./.antigravity/observations/', '~/.antigravity/observations/')
    # In case the redundancy is on a separate line as detected by my previous sed attempt (line 123)
    content = re.sub(r'\n\s+~/\.antigravity/observations/', '\n', content)

    # 2. Fix Line 137 & 138 (The table for observations)
    # Remove the L4 row completely
    pattern_l4_row = r'\| \*\*`\./\.antigravity/observations/`\*\* \| \*\*L4: Project Local\*\* \| .* \|'
    content = re.sub(pattern_l4_row, '', content)
    # Change L3 header to match diagram if necessary (Agent complained about mismatch)
    content = content.replace('**L3: Personal Global**', 'L3: Global (~/.antigravity/)')

    # 3. Fix Line 167 and 168 (Directory structure list)
    # The agent said "it should ONLY specify ~/.antigravity/". 
    # So we remove the entries that define .antigravity/ in the root as a separate thing if possible,
    # OR we just make sure they are referred to as part of the global one.
    # Actually, let's follow the requirement and unify them.
    content = content.replace('.antigravity/skills/', '~/.antigravity/skills/')
    content = content.replace('.antigravity/observations/', '~/.antigravity/observations/')

    # 4. Double check Line 142 (Already fixed, but ensure it's clean)
    if '.gemini/' in line: # this was just a logic error in my thought process earlier
        pass

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix()
