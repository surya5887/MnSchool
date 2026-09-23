const fs = require('fs');

function fixFile(filepath) {
  let text = fs.readFileSync(filepath, 'utf8');
  const start = text.indexOf('<style dangerouslySetInnerHTML={{');
  const end = text.indexOf('<div style={{ display: \'flex\', justifyContent: \'space-between\'', start);
  
  const replacement = `        <style dangerouslySetInnerHTML={{
          __html: \`
          @media print {
            @page { size: landscape; margin: 5mm; }
            html, body {
               height: 100vh !important;
               width: 100vw !important;
               overflow: hidden !important;
               margin: 0 !important;
               padding: 0 !important;
            }
            .timetable-print-wrapper {
               position: absolute !important;
               left: 0 !important;
               top: 0 !important;
               width: 100vw !important;
               height: 100vh !important;
               background: white !important;
               padding: 5mm !important;
               box-sizing: border-box !important;
               display: flex !important;
               flex-direction: column !important;
               overflow: hidden !important;
            }
            .timetable-print-wrapper, .timetable-print-wrapper * {
               visibility: visible !important;
            }
            .no-print {
               display: none !important;
            }
            .print-only {
               display: block !important;
            }
            .glass-panel {
               flex: 1 !important;
               padding: 0 !important;
               margin: 0 !important;
               border: none !important;
               box-shadow: none !important;
               background: none !important;
               display: flex !important;
               flex-direction: column !important;
               overflow: hidden !important;
            }
            .timetable-grid {
               flex: 1 !important;
               grid-template-columns: 100px repeat(\${periods.length}, 1fr) !important;
               grid-auto-rows: minmax(0, 1fr) !important;
               height: 100% !important;
               min-width: 0 !important;
               width: 100% !important;
               gap: 4px !important;
            }
            .timetable-cell {
               padding: 2px !important;
               display: flex !important;
               flex-direction: column !important;
               justify-content: center !important;
            }
            .holiday-cell {
                grid-column: span \${periods.length} !important;
            }
            .timetable-add-cell, .assign-hint {
               display: none !important;
            }
            .timetable-print-wrapper * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
          }
        \`}} />
        `;
  
  text = text.slice(0, start) + replacement + text.slice(end);
  fs.writeFileSync(filepath, text);
}

fixFile('C:/Users/AneesChaudhary/Desktop/MN_Public_School/frontend/src/pages/Timetable.tsx');
fixFile('C:/Users/AneesChaudhary/Desktop/Rahimya_Model_School/frontend/src/pages/Timetable.tsx');
console.log('Fixed');
