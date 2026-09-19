import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("cols: number;\\n    cells:", "cols: number;\\n    tableBgColor?: string;\\n    tableTextColor?: string;\\n    cells:")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
