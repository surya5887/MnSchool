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

# Also fix the header buttons if they weren't matched
content = re.sub(
    r'<div style=\{\{ display: \'flex\', gap: \'16px\' \}\}>\s*<button className="btn-secondary" onClick=\{\(\) => window\.print\(\)\}',
    r'<div className="no-print" style={{ display: \'flex\', gap: \'16px\' }}>\n          <button className="btn-secondary" onClick={() => window.print()}',
    content
)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched correctly")
