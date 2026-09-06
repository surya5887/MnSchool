import re
import os

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

clean_style = """<style>
          {`
            @media print {
              body * { visibility: hidden; }
              body, html { margin: 0 !important; padding: 0 !important; height: 100% !important; background: white !important; }
              @page { size: A4 portrait; margin: 0; }
              .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; }
              .preview-overlay * { visibility: visible; }
              .no-print { display: none !important; }
              .tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important; max-width: none !important; padding: 0 !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; }
              .tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 15px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
              .tc-content-z, .cc-content-z, .bc-content-z { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
              input.tc-editable, input.cc-editable, input.bc-editable { border: none !important; background: transparent !important; }
            }
            
            .tc-container, .cc-container, .bc-container {
              font-family: 'Arial', sans-serif;
              background: white;
              max-width: 950px;
              margin: 0 auto;
              position: relative;
              color: #000;
              border: 8px solid #1e3a8a;
              padding: 8px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            .tc-inner-border, .cc-inner-border, .bc-inner-border {
               border: 2px solid #b91c1c;
               padding: 40px;
               height: 100%;
               position: relative;
            }
            
            .tc-watermark, .cc-watermark, .bc-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.06;
              width: 550px;
              height: 550px;
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              z-index: 1;
            }
            
            .tc-content-z, .cc-content-z, .bc-content-z {
              position: relative;
              z-index: 10;
            }
            
            .tc-field, .cc-field, .bc-field {
               display: flex;
               align-items: flex-end;
               margin-bottom: 8px;
            }
            
            .tc-label, .cc-label, .bc-label {
               font-weight: bold;
               white-space: nowrap;
               margin-right: 8px;
            }
          `}
        </style>"""

input_line_code = """const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end' }}>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="tc-editable"
        size={value ? max(len_hack(value), 1) : 1}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '15px',
          fontWeight: 'bold',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          minWidth: '20px',
          maxWidth: '100%'
        }}
      />
      <div style={{ flex: 1, borderBottom: '1.5px dotted #000', marginBottom: '4px', minWidth: '20px' }}></div>
    </div>
  );"""

def len_hack(val):
    return len(str(val))

# Let's fix the above input line code to be valid react TSX
input_line_code_react = """const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end' }}>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="tc-editable"
        size={value ? Math.max(String(value).length, 1) : 1}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          minWidth: '20px',
          maxWidth: '100%'
        }}
      />
      <div style={{ flex: 1, borderBottom: '1.5px dotted #000', marginBottom: '4px', minWidth: '20px' }}></div>
    </div>
  );"""


for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace entire <style>...</style>
    content = re.sub(r'<style>.*?</style>', clean_style, content, flags=re.DOTALL)
    
    # 2. Replace InputLine definition
    content = re.sub(r'const InputLine = \(\{.*?\)\s*=>\s*\(\s*<input.*?/>\s*\);', input_line_code_react, content, flags=re.DOTALL)
    
    # Wait, my previous InputLine might not match that exact regex because it was already modified or had multiple lines.
    # Let's just find `const InputLine =` and replace everything up to `);`
    content = re.sub(r'const InputLine =.*?=>\s*\(.*?\);', input_line_code_react, content, flags=re.DOTALL)
    
    # 3. Remove all Colons (:) from labels
    content = re.sub(r'<div className="[tcb]c-label">(.*?):</div>', r'<div className="tc-label">\1</div>', content)
    # Also handle some edge cases if needed, but mostly they are like `<div className="tc-label">PEN No.:</div>`
    
    # 4. Center Logo and Name
    # From:
    # <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '24px' }}>
    # To:
    # <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
    content = content.replace("justifyContent: 'flex-start', gap: '24px'", "flexDirection: 'column', justifyContent: 'center', gap: '8px'")
    content = content.replace("textAlign: 'left', flex: 1, paddingLeft: '20px'", "textAlign: 'center', flex: 1")
    
    # 5. Increase font sizes
    content = content.replace("fontSize: '13.8px'", "fontSize: '16px'")
    content = content.replace("fontSize: '13.5px'", "fontSize: '16px'")
    content = content.replace("fontSize: '14px'", "fontSize: '16px'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Comprehensive fixes applied.")
