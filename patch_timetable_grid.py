import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the grid definition to add the class
old_grid = r"<div style=\{\{ display: 'grid', gridTemplateColumns: `100px repeat\(\$\{periods\.length\}, 1fr\) 60px`, gap: '8px', minWidth: '800px' \}\}>"
new_grid = r"<div className=\"timetable-grid\" style={{ display: 'grid', gridTemplateColumns: `100px repeat(${periods.length}, 1fr) 60px`, gap: '8px', minWidth: '800px' }}>"
content = re.sub(old_grid, new_grid, content)

# Inject the grid CSS into the print media query
old_css = r"\.timetable-add-cell, \.assign-hint \{"
new_css = r"""          .timetable-grid {
             grid-template-columns: 100px repeat(${periods.length}, 1fr) !important;
          }
          .timetable-add-cell, .assign-hint {"""
content = re.sub(old_css, new_css, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Timetable.tsx for grid")
