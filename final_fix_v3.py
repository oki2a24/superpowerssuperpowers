import re

path = '/Users/oki2a24/superpowerssuperpowers/README.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Unified Path Logic: All observations/skills should use ~/.antigravity/ (no local .antigravity/)
# First, clean up the mess created by previous scripts if they exist
content = content.replace('~/~/.antigravity/', '~/.antigravity/')
content = content.replace('~~/.antigravity/', '~/.antigravity/')

# 2. Fixing Diagram: Simplify to L1, L2, L3 ONLY.
# Use a pattern that matches the current (messy) line 121-125 area.
pattern_diagram = re.compile(r'L1: Core \(Skills\).*?L4: Project \(Local\)\n.*?\n.*?\s+\|.*?\n', re.DOTALL)

# Actually, let's just use exact string replacement for the whole diagram block to be 100% sure of appearance.
diagram_old = """     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)
 [Extension Root]/skills      [Extension Root]/observations    ~/~/.antigravity/observations/            ~/~/.antigravity/observations/
           |                            |                             |                                       |
           +----------------------------+-----------------------------+---------------------------------------+
                                        |
                                        v
                               [ AI Execution Context ]"""

# Wait, the current content is slightly different. Let's match what I saw in `sed -n '120,135p'` output.
diagram_pattern = """     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)
 [Extension Root]/skills      [Extension Root]/observations    ~/~/.antigravity/observations/            ~/~/.antigravity/observations/
           |                            |                             |                                       |
           +----------------------------+-----------------------------+---------------------------------------+
                                        |
                                        v
                               [ AI Execution Context ]"""

# Let's go with regex to find the pattern.
content = re.sub(r'L3: Global \(~\/\.antigravity\/\) .*?\[ AI Execution Context \]', 
                 '     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)\n [Extension Root]/skills      [Extension Root]/observations    ~/.antigravity/observations/\n           |                            |                             |\n           +----------------------------+-----------------------------+\n                                        |\n                                        v\n                               [ AI Execution Context ]', 
                 content, flags=re.DOTALL)

# (Wait, the regex in python with raw strings is tricky)

# Let's just do it simply:
# Replace the bad diagram block
old_diagram = """     L1: Core (Skills)            L2: Extension (Shared)         L3: Global (~/.antigravity/)
 [Extension Root]/skills      [Extension Root]/observations    ~/~/.antigravity/observations/            ~/~/.antigravity/observations/
           |                            |                             |                                       |
           +----------------------------+-----------------------------+---------------------------------------+
                                        |
                                        v
                               [ AI Execution도 Context ]""" # Wait, I used typos in my thought.

# Let's just write the final version of README manually using a script for precision if it is small enough (it is). 
