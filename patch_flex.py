import re

file_path = 'src/pages/NewAdmission.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace flex: '1 1 350px' with nothing or '1 1 auto' or just remove it
old_div = "<div className=\"submit-notice-container\" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 350px' }}>"
new_div = "<div className=\"submit-notice-container\" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto' }}>"

content = content.replace(old_div, new_div)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated flex basis.")
