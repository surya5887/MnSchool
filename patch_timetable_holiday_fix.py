import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the broken .holiday-cell from the CSS string
bad_css = r"""          .holiday-cell \{
              grid-column: span \$\{periods\.length \+ 1\};
          \}
          @media print \{
              \.holiday-cell \{
                  grid-column: span \$\{periods\.length\} !important;
              \}
          \}"""

# Replace it with just the print override
good_css = r"""          .holiday-cell {
              grid-column: span ${periods.length} !important;
          }"""

content = re.sub(bad_css, good_css, content)

# 2. Add back the inline gridColumn to the holiday cell JSX
old_jsx = r'<div className="holiday-cell" style=\{\{ background: \'rgba\(255, 99, 132, 0\.05\)\', borderRadius: \'8px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', color: \'var\(--danger\)\', fontWeight: 600, letterSpacing: \'2px\', textTransform: \'uppercase\' \}\}>'
new_jsx = r'<div className="holiday-cell" style={{ gridColumn: `span ${periods.length + 1}`, background: \'rgba(255, 99, 132, 0.05)\', borderRadius: \'8px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', color: \'var(--danger)\', fontWeight: 600, letterSpacing: \'2px\', textTransform: \'uppercase\' }}>'

content = re.sub(old_jsx, new_jsx, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed holiday cell")
