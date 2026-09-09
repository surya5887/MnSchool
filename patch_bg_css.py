import re

file_path = 'src/index.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the transparent background and blur
old_bg = "background: rgba(255, 255, 255, 0.85);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);"
new_bg = "background: #ffffff;\n  /* Removed blur to prevent text bleed-through */"

content = content.replace(old_bg, new_bg)

# Make the dock padding larger on mobile
old_padding = "padding: 12px !important;"
new_padding = "padding: 16px !important;\n    box-shadow: 0 -10px 30px rgba(0,0,0,0.1) !important;"

content = content.replace(old_padding, new_padding)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.css for solid background.")
