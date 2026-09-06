import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change z-index to 0
content = content.replace("z-index: -1;\n              pointer-events: none;", "z-index: 0;\n              pointer-events: none;")

# Make sure the content above watermark is relative
content = content.replace(".rc-header-flex { display: flex;", ".rc-header-flex { position: relative; z-index: 1; display: flex;")
content = content.replace(".rc-title-section { text-align: center;", ".rc-title-section { position: relative; z-index: 1; text-align: center;")
content = content.replace(".rc-profile-wrapper { margin-top: 20px;", ".rc-profile-wrapper { position: relative; z-index: 1; margin-top: 20px;")
content = content.replace(".rc-table { width: 100%;", ".rc-table { position: relative; z-index: 1; width: 100%;")
content = content.replace(".rc-footer-info { width: 100%;", ".rc-footer-info { position: relative; z-index: 1; width: 100%;")
content = content.replace(".rc-grading-scale { margin-top: auto;", ".rc-grading-scale { position: relative; z-index: 1; margin-top: auto;")
content = content.replace(".rc-signatures { display: flex;", ".rc-signatures { position: relative; z-index: 1; display: flex;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed watermark z-index")
