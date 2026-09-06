import re

file_path = 'src/pages/Staff.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'return allStaff\.filter\((.*?)\s*\}\);\s*\}, \[allStaff, activeTab, searchQuery\]\);', re.DOTALL)
replacement = r"return allStaff.filter(\1\n      }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));\n    }, [allStaff, activeTab, searchQuery]);"

new_content = pattern.sub(replacement, content)

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced with regex.")
else:
    print("No match found for regex.")
