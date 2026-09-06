import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'<span style=\{\{\s*fontWeight:\s*\'bold\'\s*\}\}>Date:</span>\s*<input type="text" className="editable-cell" style=\{\{width:\s*\'150px\',\s*marginLeft:\s*\'10px\',\s*textAlign:\s*\'center\',\s*borderBottom:\s*\'1px solid #000\',\s*background:\s*\'transparent\'\}\} value=\{metaData\.date\} onChange=\{e => setLocalMeta\(\{\.\.\.localMeta, \[student\.id!\]: \{\.\.\.metaData, date: e\.target\.value\}\}\)\} />'
)

new_date = """<span style={{ fontWeight: 'bold', fontSize: '15px' }}>Date:</span> 
                        <div style={{ width: '150px', marginLeft: '10px', borderBottom: '1px solid #000' }}>
                          <input type="text" className="editable-cell" style={{width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 'bold'}} value={metaData.date} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, date: e.target.value}})} />
                        </div>"""

content = pattern.sub(new_date, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced date field.")
