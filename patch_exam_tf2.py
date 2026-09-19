import re

with open('src/services/examService.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_prop = "wordBank?: string[];"
new_prop = "wordBank?: string[];\\n    trueLabel?: string;\\n    falseLabel?: string;\\n    tfStyle?: 'checkbox' | 'circle' | 'none';\\n    tfStatements?: string[];"

code = code.replace(old_prop, new_prop)

with open('src/services/examService.ts', 'w', encoding='utf-8') as f:
    f.write(code)
