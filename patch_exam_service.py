import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("        optionImages?: string[];", "        optionImages?: (string | undefined)[];\\n        optionShapes?: ({ type: string; color: string } | undefined)[];")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)

