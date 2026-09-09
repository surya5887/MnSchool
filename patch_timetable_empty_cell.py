import re

file_path = 'src/pages/Timetable.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add className="no-print" to the empty cell
content = content.replace(
    "<div></div> {/* Empty cell under the + Period button */}",
    "<div className=\"no-print\"></div> {/* Empty cell under the + Period button */}"
)

# Fix the holiday span for print. Since inline styles can't use media queries easily, 
# and it uses span periods.length + 1, which works for N+1 columns in print. 
# But let's add a no-print empty cell for holiday too if there's an issue. 
# Actually, the holiday div is the ONLY element in that row besides the day name.
# Day name takes 1 column. Holiday div takes `periods.length + 1` columns.
# Total columns = periods.length + 2 on screen!
# But in print, total columns = periods.length + 1. So `span periods.length + 1` will OVERFLOW the grid in print!
# If it overflows, it might wrap.
# Let's change the holiday span to just `span ${periods.length}` for print! Wait, inline styles take precedence.
# We can use a class `holiday-cell` and write a media query!

# Wait, `day.isHoliday` block:
old_holiday = r"<div style=\{\{ gridColumn: `span \$\{periods\.length \+ 1\}`, background: 'rgba\(255, 99, 132, 0\.05\)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var\(--danger\)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' \}\}>"
new_holiday = r"<div className=\"holiday-cell\" style={{ background: 'rgba(255, 99, 132, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>"

content = re.sub(old_holiday, new_holiday, content)

# Now inject the gridColumn logic into CSS
old_css = r"\.timetable-add-cell, \.assign-hint \{"
new_css = r"""          .holiday-cell {
              grid-column: span ${periods.length + 1};
          }
          @media print {
              .holiday-cell {
                  grid-column: span ${periods.length} !important;
              }
          }
          .timetable-add-cell, .assign-hint {"""

content = re.sub(old_css, new_css, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Timetable.tsx for empty cell and holiday span")
