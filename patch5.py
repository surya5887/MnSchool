import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement2 = '''--- End of Question Paper ---
          </div>
        </>
      )}
      </div>'''

code = re.sub(r'--- End of Question Paper ---\n\s*<\/div>\n\s*<\/div>\n\n\s*\{paperData\.includeOMR', replacement2 + '\\n\\n      {paperData.includeOMR', code)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
