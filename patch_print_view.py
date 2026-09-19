import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Apply fontFamily to instruction tr
code = code.replace("                            <tr key={qIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>", "                            <tr key={qIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', fontFamily: q.fontFamily || 'inherit' }}>")

# Apply fontFamily to normal question tr
code = code.replace("                          <tr key={qIdx} style={{ pageBreakInside: \"avoid\", breakInside: \"avoid\" }}>", "                          <tr key={qIdx} style={{ pageBreakInside: \"avoid\", breakInside: \"avoid\", fontFamily: q.fontFamily || 'inherit' }}>")

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

