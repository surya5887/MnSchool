import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_img = "                                        <img src={img.url} alt=\"\" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />"
new_img = "                                        <img src={img.url} alt=\"\" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block', border: img.borderWidth ? ${img.borderWidth}px solid  : 'none' }} />"

code = code.replace(old_img, new_img)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
