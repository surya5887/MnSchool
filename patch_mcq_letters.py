import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("['a', 'b', 'c', 'd'][optIdx]", "['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][optIdx]")

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

