import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove it from the current location
old_wrong_header = """<div className="glass-panel no-print" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: "none", width: "100%", textAlign: "center", marginBottom: "20px" }} className="print-only">
                <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 8px 0", color: "#1e3a8a", textTransform: "uppercase" }}>M.N. PUBLIC SCHOOL</h1>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0, color: "#333", textTransform: "uppercase", borderBottom: "2px solid #ccc", display: "inline-block", paddingBottom: "4px" }}>Class {classFilter || "All"} - Time Table</h2>
              </div>"""

clean_no_print = """<div className="glass-panel no-print" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>"""

content = content.replace(old_wrong_header, clean_no_print)

# 2. Add it right before the timetable block
# Notice that the closing brace `)}` is attached to `<div className="glass-panel"`
old_timetable_div = """)}<div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>"""

new_header = """)}
        <div style={{ display: "none", width: "100%", textAlign: "center", marginBottom: "20px" }} className="print-only">
          <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 8px 0", color: "#1e3a8a", textTransform: "uppercase" }}>M.N. PUBLIC SCHOOL</h1>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0, color: "#333", textTransform: "uppercase", borderBottom: "2px solid #ccc", display: "inline-block", paddingBottom: "4px" }}>Class {classFilter || "All"} - Time Table</h2>
        </div>
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>"""

content = content.replace(old_timetable_div, new_header)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved header successfully")
