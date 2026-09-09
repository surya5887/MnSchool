import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    r"background: \'rgba(255, 99, 132, 0.05)\', borderRadius: \'8px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', color: \'var(--danger)\', fontWeight: 600, letterSpacing: \'2px\', textTransform: \'uppercase\'",
    "background: 'rgba(255, 99, 132, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase'"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed quotes")
