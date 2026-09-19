import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("style={{ fontFamily: \\\"'", "style={{ fontFamily: '")
code = code.replace("', sans-serif\\\" }}", "', sans-serif' }}")
code = code.replace("style={{ fontFamily: '\"'", "style={{ fontFamily: '")
code = code.replace("'\", sans-serif' }}", "', sans-serif' }}")

# Let's be thorough with regex
code = re.sub(r'style=\{\{ fontFamily: \\"\'(.*?)\', sans-serif\\" \}\}', r"style={{ fontFamily: '\1, sans-serif' }}", code)

with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

