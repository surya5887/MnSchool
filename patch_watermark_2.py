import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .rc-watermark CSS to use img
css_to_add = """
          img.rc-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            object-fit: contain;
            opacity: 0.15;
            z-index: 0;
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
"""
content = re.sub(r'\.rc-watermark\s*\{[^}]+\}', css_to_add, content)

# 2. Update .rc-front-page, .rc-back-page normal CSS to have position: relative
content = content.replace(".rc-front-page, .rc-back-page {\n            background: white;", ".rc-front-page, .rc-back-page {\n            position: relative; z-index: 1;\n            background: white;")

# 3. Update the JSX tags
content = content.replace('<div className="rc-watermark" style={{ backgroundImage: `url(\'${settings?.logoUrl || "/images/logo_circular.png"}\')` }}></div>', '<img className="rc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="watermark" />')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed watermark rendering")
