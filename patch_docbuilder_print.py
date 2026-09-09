import re

file_path = 'src/components/DocumentBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the background transparency issue on print
content = content.replace(
    "background: bgImage ? (printing ? 'transparent' : `url(${bgImage}) center/cover no-repeat`) : 'white',",
    "background: bgImage ? `url(${bgImage}) center/cover no-repeat` : 'white',"
)

# 2. Fix the print visibility issue caused by global CSS
old_style = """      <style dangerouslySetInnerHTML={{__html: `
          @media print {
              body > :not(.print-portal) { display: none !important; }
              body { margin: 0; padding: 0; background: white; }
              @page { size: A4 portrait; margin: 0; }
          }
        `}} />"""

new_style = """      <style dangerouslySetInnerHTML={{__html: `
          @media print {
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
          }
        `}} />"""

content = content.replace(old_style, new_style)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched DocumentBuilder.tsx")
