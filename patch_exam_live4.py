import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the imports
if "LivePaperBuilder" not in code:
    code = code.replace("import KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';", "import KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';\nimport LivePaperBuilder from '../components/LivePaperBuilder';")

# Replace "Regular Exam Builder (6th-12th)"
code = code.replace("Regular Exam Builder (6th-12th)", "Live Paper Builder (6th-12th)")

# Find the start of the <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
start_str = "            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>"
end_str = "          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = '''            <div style={{ marginTop: '24px' }}>
              <LivePaperBuilder paperData={paperData!} setPaperData={setPaperData as any} />
            </div>
          )}

'''
    code = code[:start_idx] + new_content + code[end_idx:]
    with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully patched!")
else:
    print("Could not find blocks!", start_idx, end_idx)

