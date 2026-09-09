import re

file_path = 'src/pages/NewAdmission.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_style = """.submit-notice-title {
              margin: 0 0 6px 0;
              color: #1e293b;
              font-size: 1.05rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.3px;
            }"""

new_style = """.submit-notice-title {
              margin: 0 0 6px 0;
              color: #1e293b;
              font-size: 1.05rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.3px;
            }
            .submit-notice-title span {
              background: #fef2f2;
              color: #ef4444;
              font-size: 0.65rem;
              padding: 4px 10px;
              border-radius: 12px;
              text-transform: uppercase;
              font-weight: 800;
              letter-spacing: 0.5px;
              border: 1px solid #fee2e2;
            }"""

content = content.replace(old_style, new_style)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed span style.")
