import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS
css_to_add = """
          .rc-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60%;
            height: 60%;
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            opacity: 0.10;
            z-index: -1;
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
"""
if '.rc-watermark' not in content:
    content = content.replace(".rc-container { font-family: 'Times New Roman', Times, serif; color: #000; }", ".rc-container { font-family: 'Times New Roman', Times, serif; color: #000; }\n" + css_to_add)

# 2. Add position relative to report-card-page
if 'position: relative;' not in content.split('.report-card-page {')[1].split('}')[0]:
    content = content.replace(".report-card-page {\n                margin: 0 !important;", ".report-card-page {\n                position: relative; z-index: 1;\n                margin: 0 !important;")

# 3. Add watermark divs
front_div = """<div className="report-card-page rc-container rc-front-page">
                  <div className="rc-watermark" style={{ backgroundImage: `url('${settings?.logoUrl || "/images/logo_circular.png"}')` }}></div>"""
back_div = """<div className="report-card-page rc-container rc-back-page">
                  <div className="rc-watermark" style={{ backgroundImage: `url('${settings?.logoUrl || "/images/logo_circular.png"}')` }}></div>"""

content = content.replace('<div className="report-card-page rc-container rc-front-page">', front_div)
content = content.replace('<div className="report-card-page rc-container rc-back-page">', back_div)

# 4. Also need to ensure background colors of table cells are slightly transparent or white
# Actually if opacity is 0.1, the table text will sit over it. But if table has solid white background, it will block the watermark.
# Currently table cells don't have a background color by default, except `.rc-profile td.label` which has `#f8fafc`.
# Let's make `#f8fafc` slightly transparent so watermark shows through faintly.
content = content.replace("background-color: #f8fafc;", "background-color: rgba(248, 250, 252, 0.7);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched watermark")
