import re
import os

file_path = 'src/components/DocumentBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the canvas styles using regex
content = re.sub(
    r"(width:\s*'794px',\s*height:\s*'1123px',\s*)",
    r"\1flexShrink: 0, ",
    content
)

# Replace the container logic
content = re.sub(
    r'(<div ref=\{containerRef\} className="builder-container no-print" style=\{\{ width: \'100%\', overflow: \'hidden\', display: \'flex\', background: \'#f1f5f9\', padding: \'20px\', borderRadius: \'12px\' \}\}>)\s*<div style=\{\{ width: \'100%\', display: \'flex\', justifyContent: \'center\' \}\}>\s*\{renderCanvasContent\(false\)\}\s*</div>\s*</div>',
    r'<div ref={containerRef} className="builder-container no-print" style={{ width: \'100%\', overflow: \'hidden\', display: \'flex\', background: \'#f1f5f9\', padding: \'20px\', borderRadius: \'12px\', justifyContent: \'center\' }}>\n            <div style={{ width: 794 * scale, height: 1123 * scale, position: \'relative\' }}>\n              {renderCanvasContent(false)}\n            </div>\n        </div>',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched with regex")
