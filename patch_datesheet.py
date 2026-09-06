import re

file_path = 'src/components/DateSheetPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports and State
if 'getSchoolSettings' not in content:
    content = content.replace(
        "import React from 'react';", 
        "import React, { useState, useEffect } from 'react';\nimport { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';"
    )

if 'const [settings, setSettings]' not in content:
    state_injection = """
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [instructions, setInstructions] = useState("Students must report to the examination hall 15 minutes before the commencement of the exam.\\nUse of unfair means will result in strict disciplinary action.\\nMobile phones, smartwatches, or any electronic gadgets are strictly prohibited.\\nBring your own stationery items. Borrowing is not allowed during the exam.");

  useEffect(() => {
    getSchoolSettings().then(set => {
      if (set) setSettings(set);
    });
  }, []);
"""
    content = content.replace("const DateSheetPrintView: React.FC<DateSheetProps> = ({ scheduleData, onClose }) => {", "const DateSheetPrintView: React.FC<DateSheetProps> = ({ scheduleData, onClose }) => {" + state_injection)

# 2. Print CSS fix
old_print_css = """          @media print {
            .print-hide { display: none !important; }
            body { background: white; margin: 0; padding: 0; }
            @page { margin: 1cm; size: A4 portrait; }
          }"""
new_print_css = """          @media print {
            .print-hide { display: none !important; }
            body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
            * { overflow: visible !important; }
            .print-wrapper { position: static !important; overflow: visible !important; background: white !important; display: block !important; }
            @page { margin: 10mm; size: A4 portrait; }
          }"""
content = content.replace(old_print_css, new_print_css)

# Add print-wrapper class
content = content.replace("div style={{ position: 'fixed'", "div className=\"print-wrapper\" style={{ position: 'fixed'")

# 3. Dynamic header and color
content = content.replace(
    "<h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e3a8a', textTransform: 'uppercase' }}>MN Public School</h1>",
    "<h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#b91c1c', textTransform: 'uppercase', fontFamily: \"'Arial Black', Impact, sans-serif\" }}>{settings?.schoolName || 'MN Public School'}</h1>"
)
content = content.replace(
    "<p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4b5563' }}>Affiliated to CBSE, New Delhi</p>",
    "<p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e3a8a', fontWeight: 'bold' }}>{settings?.recognitionText || 'Affiliated to CBSE, New Delhi'}</p>"
)

# 4. Editable Instructions
old_instructions = """          <ul style={{ paddingLeft: '20px' }}>
            <li>Students must report to the examination hall 15 minutes before the commencement of the exam.</li>
            <li>Use of unfair means will result in strict disciplinary action.</li>
            <li>Mobile phones, smartwatches, or any electronic gadgets are strictly prohibited.</li>
            <li>Bring your own stationery items. Borrowing is not allowed during the exam.</li>
          </ul>"""

new_instructions = """          <textarea 
            style={{ width: '100%', minHeight: '120px', border: '1px dashed #ccc', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', marginTop: '10px' }} 
            className="editable-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <style>{`
            @media print {
               .editable-instructions { border: none !important; resize: none !important; overflow: hidden !important; background: transparent !important; }
            }
          `}</style>"""

content = content.replace(old_instructions, new_instructions)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched DateSheetPrintView.tsx")
