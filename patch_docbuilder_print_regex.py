import re

file_path = 'src/components/DocumentBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the print visibility issue caused by global CSS using regex
new_css = """          @media print {
              body > :not(.print-portal) { display: none !important; }
              body { margin: 0; padding: 0; background: white; }
              .print-portal { 
                  position: absolute !important; 
                  left: 0 !important; 
                  top: 0 !important; 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
              }
              .print-portal, .print-portal * { visibility: visible !important; }
              @page { size: A4 portrait; margin: 0; }
          }"""

content = re.sub(
    r'@media print \{\s*body > :not\(\.print-portal\) \{ display: none !important; \}\s*body \{ margin: 0; padding: 0; background: white; \}\s*@page \{ size: A4 portrait; margin: 0; \}\s*\}',
    new_css,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched DocumentBuilder.tsx with regex")
