import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hide the default page title in print
content = content.replace(
    """<div>
          <h1 className="page-title"><Clock size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Class Timetable</h1>
          <p className="page-subtitle">Visually manage and print daily schedules for teachers and students.</p>
        </div>""",
    """<div className="no-print">
          <h1 className="page-title"><Clock size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Class Timetable</h1>
          <p className="page-subtitle">Visually manage and print daily schedules for teachers and students.</p>
        </div>"""
)

# 2. Add the custom School Name + Class Time Table header
old_header = '<h2 style={{ display: "none", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }} className="print-only">Routine For: {classFilter || "All Classes"}</h2>'

new_header = """<div style={{ display: "none", width: "100%", textAlign: "center", marginBottom: "20px" }} className="print-only">
                <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 8px 0", color: "#1e3a8a", textTransform: "uppercase" }}>M.N. PUBLIC SCHOOL</h1>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0, color: "#333", textTransform: "uppercase", borderBottom: "2px solid #ccc", display: "inline-block", paddingBottom: "4px" }}>Class {classFilter || "All"} - Time Table</h2>
              </div>"""

content = content.replace(old_header, new_header)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched headers")
