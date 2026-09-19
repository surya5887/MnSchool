import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_table = "cells: { rowIndex: number; colIndex: number; content: string; hideBorder?: boolean }[];"
new_table = "cells: { rowIndex: number; colIndex: number; content: string; hideBorder?: boolean; isHeader?: boolean; colSpan?: number; rowSpan?: number; bgColor?: string; textColor?: string }[];"

code = code.replace(old_table, new_table)

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
