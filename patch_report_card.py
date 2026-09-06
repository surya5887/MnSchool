import re
import os

file_path = 'src/components/ReportCardPrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the REPORT CARD FOR CLASS line
# <div className="rc-report-title">REPORT CARD FOR CLASS {className.toUpperCase()}</div>
content = re.sub(r'<div className="rc-report-title">REPORT CARD FOR CLASS \{className\.toUpperCase\(\)\}</div>\s*', '', content)

# 2. Add Class and Section to the table
old_table_rows = r'(<tr><td className="label">Roll No\.</td><td className="val">\{student\.rollNumber \|\| \'-\'\}</td></tr>)'
new_table_rows = r'\1\n                      <tr><td className="label">Class</td><td className="val">{className}</td></tr>\n                      <tr><td className="label">Section</td><td className="val"><input className="editable-cell" value={meta.find(m => m.studentId === student.id)?.section || ""} onChange={(e) => handleMetaChange(student.id, "section", e.target.value)} style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", width: "100%", background: "transparent", border: "none", outline: "none" }} placeholder="A" /></td></tr>'

# Wait, `meta` might not have `section`. Let's just use an editable cell that saves to `meta`! 
# Does `meta` have `section` in ReportCardMetaData?
# Let's check `ReportCardMetaData` in `reportCardService.ts` before I do this, or just use student.section if I don't want to save it to meta. Or I can just use `<input type="text" defaultValue={student.section || ''} style={{...}} />` if it doesn't need to be saved in DB for the report card specifically! 

# Let's just do defaultValue so they can type it for print without strict syncing to meta if section is not in meta.
new_table_rows = r'\1\n                      <tr><td className="label">Class</td><td className="val">{className}</td></tr>\n                      <tr><td className="label">Section</td><td className="val"><input className="editable-cell" defaultValue={student.section || ""} style={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", width: "100%", background: "transparent", border: "none", outline: "none" }} placeholder="-" /></td></tr>'

content = re.sub(old_table_rows, new_table_rows, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Report Card Title and Profile Table.")
