import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'--- End of Question Paper ---\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\n\s*\{paperData\.includeOMR', '--- End of Question Paper ---\\n          </div>\\n          </>\\n        )}\\n      </div>\\n\\n      {paperData.includeOMR', code)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
