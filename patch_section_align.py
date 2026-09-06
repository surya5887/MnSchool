import re
import os

file_path = 'src/components/ReportCardPrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix alignment of the section input
content = content.replace('style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", width: "100%", background: "transparent", border: "none", outline: "none" }}',
                          'style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", width: "100%", background: "transparent", border: "none", outline: "none", textAlign: "left", padding: 0 }}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed section input alignment.")
