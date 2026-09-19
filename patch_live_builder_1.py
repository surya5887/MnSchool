import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I will just replace the CENTER: Live Canvas Area completely down to the RIGHT SIDEBAR.
start_str = "      {/* CENTER: Live Canvas Area */}"
end_str = "      {/* RIGHT SIDEBAR: Property Inspector */}"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_center = '''      {/* CENTER: Live Canvas Area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setSelectedItem(null)}>
        <div style={{ margin: '40px 20px', minWidth: '850px', maxWidth: '850px', background: 'white', minHeight: '1100px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '2px', position: 'relative' }}>
          <QuestionPaperPrintView 
            mode="inline" 
            paperData={paperData} 
            isEditor={true} 
            selectedItem={selectedItem} 
            onItemClick={setSelectedItem as any} 
          />
        </div>
      </div>

'''
    code = code[:start_idx] + new_center + code[end_idx:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched Center!")
else:
    print("Could not find center bounds!", start_idx, end_idx)
