import re
import os

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix InputLine to stretch properly in flex containers
    # Currently it is:
    # const InputLine = ({ name, value, onChange, width = '100%', type = 'text', style = {} }) => (
    #   <input ... style={{ width, ... }} />
    # )
    # We want to add `flex: width === '100%' ? 1 : 'none'` to the style
    if "flex: width === '100%' ? 1 : 'none'" not in content:
        content = content.replace("width,\n      border: 'none',", "width,\n      flex: width === '100%' ? 1 : 'none',\n      border: 'none',")

    # 2. Fix CSS for borders and sizes in @media print
    content = content.replace(".tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; min-height: 277mm !important; max-width: none !important; padding: 5px !important; box-sizing: border-box !important; }", 
                              ".tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; min-height: 277mm !important; max-width: none !important; padding: 8px !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; }")
    
    content = content.replace(".tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 25px !important; border-width: 2px !important; height: 100% !important; box-sizing: border-box !important; display: flex; flex-direction: column; }",
                              ".tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 15px !important; border: 2px solid #b91c1c !important; height: 100% !important; box-sizing: border-box !important; display: flex; flex-direction: column; }")

    # 3. Adjust top margin of logo area
    content = content.replace("marginTop: '15px', marginBottom: '15px'", "marginTop: '5px', marginBottom: '10px'")
    content = content.replace("marginTop: '30px', marginBottom: '30px'", "marginTop: '10px', marginBottom: '15px'") # In case it's still 30px
    
    # 4. Make field text sizes larger
    content = content.replace("fontSize: '13.5px'", "fontSize: '14.5px'")
    content = content.replace("fontSize: '13px'", "fontSize: '14px'") # Top header row

    # 5. Fix the spacing of LEAVING CERTIFICATE label
    content = content.replace("marginTop: '10px'", "marginTop: '15px'") # To give a little space below address before the blue label
    # Wait, replace might hit other things. Let's use regex for the label margin
    content = re.sub(r'padding: \'8px 35px\',\s*borderRadius: \'4px\',\s*marginTop: \'10px\'', r"padding: '8px 35px', borderRadius: '4px', marginTop: '15px'", content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Design polished.")
