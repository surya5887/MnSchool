import sys

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = f.read()

    # Find the start of the style block
    start_idx = data.find('<style dangerouslySetInnerHTML={{')
    # Find the end of the style block
    end_idx = data.find('`}} />', start_idx) + 6

    if start_idx == -1 or end_idx == 5:
        print(f"Could not find style block in {filepath}")
        return

    replacement = '''<style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: landscape; margin: 5mm; }
            html, body {
               height: 100vh !important;
               width: 100vw !important;
               overflow: hidden !important;
               margin: 0 !important;
               padding: 0 !important;
               background: white !important;
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
               z-index: 9999 !important;
            }
            .timetable-print-wrapper, .timetable-print-wrapper * {
               visibility: visible !important;
            }
            .no-print, .no-print * {
               display: none !important;
               visibility: hidden !important;
               height: 0 !important;
               opacity: 0 !important;
            }
            .print-only {
               display: block !important;
            }
            /* Only target the specific wrapper for the grid */
            .print-grid-wrapper {
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
               grid-template-columns: 100px repeat(${periods.length}, 1fr) !important;
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
                grid-column: span ${periods.length} !important;
            }
            .break-cell {
                writing-mode: horizontal-tb !important;
                transform: none !important;
                font-size: 0.8rem !important;
            }
            .timetable-add-cell, .assign-hint {
               display: none !important;
            }
            .timetable-print-wrapper * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
          }
        `}} />'''

    # Add the .print-grid-wrapper class to the glass-panel that wraps the timetable-grid
    # The current string is: <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
    
    data = data[:start_idx] + replacement + data[end_idx:]
    data = data.replace('<div className="glass-panel" style={{ padding: \'24px\', overflowX: \'auto\' }}>', '<div className="glass-panel print-grid-wrapper" style={{ padding: \'24px\', overflowX: \'auto\' }}>')
    
    # Let's also hide the Teacher header if we are in print view. It is currently NOT marked .no-print
    # It starts with: <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient
    data = data.replace('<div className="glass-panel" style={{ padding: \'24px\', marginBottom: \'24px\', background: \'linear-gradient', '<div className="glass-panel no-print" style={{ padding: \'24px\', marginBottom: \'24px\', background: \'linear-gradient')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(data)

fix_file(r'C:\Users\AneesChaudhary\Desktop\MN_Public_School\frontend\src\pages\Timetable.tsx')
fix_file(r'C:\Users\AneesChaudhary\Desktop\Rahimya_Model_School\frontend\src\pages\Timetable.tsx')
print("Fixed")
