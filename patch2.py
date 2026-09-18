import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the JSX closing
code = code.replace(
'''--- End of Question Paper ---
          </div>
      </div>
      </div>

      {paperData.includeOMR && (''',
'''--- End of Question Paper ---
          </div>
        </>
      )}
      </div>

      {paperData.includeOMR && (''')

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
