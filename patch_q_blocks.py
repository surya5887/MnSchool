import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = '''                            {q.blankSpace !== undefined && q.blankSpace > 0 && ('''

new_block = '''                            {q.blocks && q.blocks.length > 0 && (
                              <BlockPrintRenderer blocks={q.blocks} />
                            )}
                            {q.blankSpace !== undefined && q.blankSpace > 0 && ('''

code = code.replace(old_block, new_block)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
