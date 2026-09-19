import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove WordDocumentCanvas import
code = re.sub(r"import WordDocumentCanvas from '\.\./components/BlockCanvas/WordDocumentCanvas';\n?", "", code)

# Remove MS Word Mode button
code = re.sub(r"<\s*button[^>]*>\s*MS Word Mode \(Freeform\)\s*</button>", "", code)

# Remove WordDocumentCanvas rendering
code = re.sub(r"\{paperData\?\.wordContent !== undefined \? \(\s*<WordDocumentCanvas[^>]*/>\s*\)\s*:\s*(paperData\?\.blocks)", r"{\1", code)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove wordContent rendering from PrintView
code = re.sub(r"\{paperData\.wordContent !== undefined \? \(\s*<div[^>]*dangerouslySetInnerHTML=\{\{ __html: paperData\.wordContent \}\}\s*/>\s*\)\s*:\s*\(", "(", code)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
