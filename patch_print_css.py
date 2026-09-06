import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_print_css = """        @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
            body * { visibility: hidden; }
            
            .preview-overlay { position: static !important; background: white !important; padding: 0 !important; width: 100% !important; }
            .preview-overlay * { visibility: visible; }
            .preview-toolbar { display: none !important; }
            
            ${printMode === 'front' ? '.rc-back-page { display: none !important; }' : ''}
            ${printMode === 'back' ? '.rc-front-page { display: none !important; }' : ''}
            
            .report-card-page {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              page-break-after: always;
              height: auto !important;
              min-height: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            .rc-table, .rc-profile, .rc-footer-info, .rc-grading-scale table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
            }
            
            .rc-table th, .rc-table td.label, .rc-profile td.label, .rc-grading-scale th { 
              -webkit-print-color-adjust: exact; color-adjust: exact; 
            }
            
            /* Hide input styling when printing and fix width issues */
            input.editable-cell { 
              border: none !important; background: transparent !important; padding: 0 !important; outline: none !important; box-shadow: none !important; 
              min-width: 0 !important; width: 100% !important; -webkit-appearance: none; appearance: none;
            }
            input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          }"""

pattern = re.compile(r'@media print \{.*?\n          \}', re.DOTALL)
content = pattern.sub(new_print_css, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced @media print CSS.")
