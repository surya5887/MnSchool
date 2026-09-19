import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("tfStyle?: 'checkbox' | 'circle' | 'none';", "tfStyle?: 'checkbox' | 'circle' | 'none' | 'checkbox_only' | 'circle_only';")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
