import re

file_path = 'src/components/DateSheetPrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the style block
old_styles = """          {`
            @media print {
              .print-hide { display: none !important; }
              body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
              * { overflow: visible !important; }
              .print-wrapper { position: static !important; overflow: visible !important; background: white !important; display: block !important; }
              @page { margin: 10mm; size: A4 portrait; }
            }
            .sheet-container {
              width: 210mm;
              min-height: 297mm;
              margin: 2rem auto;
              background: white;
              padding: 40px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              position: relative;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            }"""

new_styles = """          {`
            @media print {
              .print-hide { display: none !important; }
              body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
              * { overflow: visible !important; }
              .print-wrapper { position: static !important; overflow: visible !important; background: white !important; display: block !important; }
              @page { margin: 10mm; size: A4 portrait; }
              
              .sheet-container {
                margin: 0 auto !important;
                padding: 40px !important;
                width: 800px !important;
                max-width: 800px !important;
                box-sizing: border-box !important;
                page-break-after: always !important;
                height: auto !important;
                min-height: 1130px !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
            
            @media screen {
              .sheet-container {
                width: 800px;
                max-width: 800px;
                min-height: 1130px;
                margin: 2rem auto;
                background: white;
                padding: 40px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                position: relative;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
              }
            }
            
            @media screen and (max-width: 768px) {
              .print-wrapper {
                overflow-x: auto;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .sheet-container {
                zoom: 0.45;
                -moz-transform: scale(0.45);
                -moz-transform-origin: top center;
                margin: 1rem auto;
              }
            }"""

content = content.replace(old_styles, new_styles)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DateSheetPrintView.tsx")
