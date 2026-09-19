import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("cols: number;\\n    tableBgColor?: string;", "cols: number;\\n    tableWidth?: number;\\n    tableBgColor?: string;")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
