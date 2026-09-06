import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add .tc-dotted-input to print CSS
print_css_target = r'input\.tc-editable, input\.cc-editable, input\.bc-editable \{ border: none !important; background: transparent !important; \}'
content = re.sub(print_css_target, r'input.tc-editable, input.cc-editable, input.bc-editable { border: none !important; background: transparent !important; }\n              .tc-dotted-input { border-bottom: 1.5px dotted #000 !important; }', content)

# 2. Change className="tc-editable" to className="tc-dotted-input" for top header and footer
# Top header
content = content.replace('className="tc-editable" style={{ flex: 1, border: \'none\', borderBottom: \'1.5px dotted #000\'',
                          'className="tc-dotted-input" style={{ flex: 1, border: \'none\', borderBottom: \'1.5px dotted #000\'')
# Footer
content = content.replace('className="tc-editable" style={{ width: \'50px\', border: \'none\', borderBottom: \'1.5px dotted #000\'',
                          'className="tc-dotted-input" style={{ width: \'50px\', border: \'none\', borderBottom: \'1.5px dotted #000\'')
content = content.replace('className="tc-editable" style={{ flex: 1, maxWidth: \'300px\', border: \'none\', borderBottom: \'1.5px dotted #000\'',
                          'className="tc-dotted-input" style={{ flex: 1, maxWidth: \'300px\', border: \'none\', borderBottom: \'1.5px dotted #000\'')

# 3. Shrink padding and font size in table to fit A4
content = content.replace('padding: 6px 12px', 'padding: 3px 8px')
content = content.replace('.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px; }',
                          '.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13.5px; }')
content = content.replace('.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 15px; font-family: inherit; font-weight: bold; color: #000; }',
                          '.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 13.5px; font-family: inherit; font-weight: bold; color: #000; }')

# 4. Shrink logo and title margin slightly
content = content.replace("style={{ width: '100px', height: '100px' }} alt=\"Logo\"", "style={{ width: '80px', height: '80px' }} alt=\"Logo\"")
content = content.replace("fontSize: '28px'", "fontSize: '24px'")
content = content.replace("fontSize: '16px', color: '#1e3a8a'", "fontSize: '14px', color: '#1e3a8a'")
content = content.replace("padding: '8px 35px', borderRadius: '4px', marginTop: '15px', fontSize: '20px'", 
                          "padding: '6px 25px', borderRadius: '4px', marginTop: '10px', fontSize: '17px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied scale-down and dotted line fixes.")
