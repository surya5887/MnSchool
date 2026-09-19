import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_str = "{q.optionImages && q.optionImages[optIdx] && ("
start_idx = code.find(start_str)

if start_idx != -1:
    old_block = '''                                        {q.optionImages && q.optionImages[optIdx] && (
                                          <img src={q.optionImages[optIdx]} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                        )}'''
    new_block = '''                                        {q.optionImages && q.optionImages[optIdx] && (
                                          <img src={q.optionImages[optIdx]} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                        )}
                                        {q.optionShapes && q.optionShapes[optIdx] && (
                                          <div style={{ width: '40px', height: '40px' }}>
                                            {renderShape({ ...q.optionShapes[optIdx], rotation: 0, flipX: false, flipY: false })}
                                          </div>
                                        )}'''
    code = code.replace(old_block, new_block)
    with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Injected optionShapes into PrintView!")
else:
    print("Could not find start_idx")
