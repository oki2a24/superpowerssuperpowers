#!/bin/bash
# Step 1: README.md Cleanup

# 1. Remove Gemini CLI installation block
# Search for the pattern and remove it until next triple backtick (approx)
# More robustly: remove from "**Gemini CLI の場合:**" to "```" following it.
sed -i '' '/\*\*Gemini CLI の場合:\*\*/,/```/d' README.md

# 2. Unify observation paths
# Replace (~/.gemini/observations/)               (./.gemini/observations/) with (~/.antigravity/observations/)
# And the HTML-like ones in lines 140/141
sed -i '' 's/(~/~\/.antigravity\/observations\/\(\)|\.\/ \.gemini\/observations\/\)/~/.antigravity\/observations\//g' README.md # Wait, this regex is tricky.

# Let's use a more direct approach for the specific strings found in grep
sed -i '' 's/(~\/.gemini\/observations\/\)/(~.antigravity/obsentations/)/g' README.md # No.

