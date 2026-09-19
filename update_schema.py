import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("  marks: number;\n}", "  marks: number;\n  blocks?: PaperBlock[];\n}")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
