import re
import os

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

print_style = """<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timetable-print-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 10mm; }
          .timetable-print-wrapper {
             position: absolute !important;
             left: 0 !important;
             top: 0 !important;
             width: 100vw !important;
             height: auto !important;
             background: white !important;
             padding: 20px !important;
             box-sizing: border-box !important;
             transform: scale(0.9);
             transform-origin: top left;
          }
          .timetable-print-wrapper, .timetable-print-wrapper * {
             visibility: visible !important;
          }
          .no-print {
             display: none !important;
          }
          .print-only {
             display: block !important;
          }
          .timetable-add-cell, .assign-hint {
             display: none !important;
          }
          /* Make print background colors work */
          .timetable-print-wrapper * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
          }
        }
      `}} />"""

content = re.sub(
    r'<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>',
    print_style,
    content
)

# Fix the header buttons
content = content.replace(
    '<div style={{ display: \'flex\', gap: \'16px\' }}>\n          <button className="btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print Routine</button>',
    '<div className="no-print" style={{ display: \'flex\', gap: \'16px\' }}>\n          <button className="btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print Routine</button>'
)

# Fix the class filter display
content = content.replace(
    '<div className="glass-panel" style={{ padding: \'20px\', marginBottom: \'24px\', display: \'flex\', gap: \'20px\', alignItems: \'center\' }}>',
    '<div className="glass-panel no-print" style={{ padding: \'20px\', marginBottom: \'24px\', display: \'flex\', gap: \'20px\', alignItems: \'center\' }}>\n              <h2 style={{ display: "none", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }} className="print-only">Routine For: {classFilter || "All Classes"}</h2>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched correctly 3")
