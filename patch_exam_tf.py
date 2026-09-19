import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("wordBank?: string[];\\n    blocks?:", "wordBank?: string[];\\n    trueLabel?: string;\\n    falseLabel?: string;\\n    tfStyle?: 'checkbox' | 'circle' | 'none';\\n    blocks?:")

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
