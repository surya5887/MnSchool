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

    # 1. Edge to Edge Borders
    # Find the @page and replace
    content = re.sub(r'@page\s*\{\s*size:\s*A4\s*portrait;\s*margin:\s*10mm;\s*\}', r'@page { size: A4 portrait; margin: 0; }', content)
    
    # Update container sizes for edge-to-edge
    old_container = r"\.tc-container, \.cc-container, \.bc-container \{ box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; min-height: 277mm !important; max-width: none !important; padding: 8px !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; \}"
    new_container = ".tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important; max-width: none !important; padding: 0 !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; }"
    content = re.sub(old_container, new_container, content, flags=re.IGNORECASE)
    
    # Update inner border to give space from the outer border
    # Since outer padding is 0, we can add a tiny bit of margin to inner-border or keep it as is
    # .tc-inner-border padding is currently 15px. We'll make it padding: 15px, margin: 4px.
    content = re.sub(r'(\.tc-inner-border, \.cc-inner-border, \.bc-inner-border\s*\{.*?)(height: 100% !important;)', r'\1 margin: 4px !important; height: calc(100vh - 24px) !important;', content)
    
    # 2. Dotted Lines everywhere
    # Replace the input rules
    content = re.sub(r'input\.[tcb]c-editable,\s*input\.[tcb]c-editable,\s*input\.[tcb]c-editable\s*\{\s*border-color:\s*transparent\s*!important;\s*background:\s*transparent\s*!important;\s*\}', 
                     'input.tc-editable, input.cc-editable, input.bc-editable { border: none !important; border-bottom: 1.5px dotted #000 !important; background: transparent !important; }', content)
    # Remove the value="" rule entirely
    content = re.sub(r'input\.[tcb]c-editable\[value=""\],\s*input\.[tcb]c-editable\[value=""\],\s*input\.[tcb]c-editable\[value=""\]\s*\{\s*border-bottom:\s*1.5px\s*dotted\s*#000\s*!important;\s*\}', '', content)
    
    # 3. Logo and Title Margin
    content = content.replace("marginTop: '5px', marginBottom: '10px'", "marginTop: '0px', marginBottom: '5px'")
    content = content.replace("marginTop: '10px', marginBottom: '15px'", "marginTop: '0px', marginBottom: '10px'")
    
    # 4. Make sure inputs aren't clipping text
    # We can reduce font size of input just a tiny bit to fit long names
    # Or make the labels slightly smaller. Let's make labels normal weight if they are bold? No, user wants good design.
    # We can just change fontSize: 14.5px back to 13.5px for the inputs, but keep labels at 14.5px? 
    # Let's change the overall fontSize from 14.5px to 14px in the grid.
    content = content.replace("fontSize: '14.5px'", "fontSize: '13.8px'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Edge to edge applied, dotted lines fixed.")
