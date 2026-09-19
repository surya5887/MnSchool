import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_style = code.find('      {/* Font Previews for Dropdown */}')
end_style = code.find('      {/* CENTER: Live Canvas Area */}')

if start_style != -1 and end_style != -1:
    code = code[:start_style] + "      {/* CENTER: Live Canvas Area */}" + code[end_style + 38:]
    
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Removed bad style block")
else:
    print("Could not find style block")
