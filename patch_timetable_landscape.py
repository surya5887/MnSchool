import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change portrait to landscape
content = content.replace('@page { size: portrait; margin: 10mm; }', '@page { size: landscape; margin: 10mm; }')

# Override minWidth in print for the grid
old_grid_css = r"""          .timetable-grid \{
             grid-template-columns: 100px repeat\(\$\{periods\.length\}, 1fr\) !important;
          \}"""

new_grid_css = r"""          .timetable-grid {
             grid-template-columns: 100px repeat(${periods.length}, 1fr) !important;
             min-width: 0 !important;
             width: 100% !important;
          }"""
content = re.sub(old_grid_css, new_grid_css, content)

# Adjust transform scale to fit nicely in landscape
content = content.replace('transform: scale(0.9);', 'transform: scale(1); width: 100% !important;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Switched to landscape and fixed width")
