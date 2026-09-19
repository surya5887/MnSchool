import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add the font loading logic before the return statement.
start_str = "    const content = ("
start_idx = code.find(start_str)

if start_idx != -1:
    logic = '''    // Find all unique fonts used in the paper
    const usedFonts = new Set<string>();
    paperData.sections?.forEach(s => {
      s.questions?.forEach(q => {
        if (q.fontFamily && q.fontFamily !== 'inherit' && q.fontFamily !== 'Arial' && q.fontFamily !== 'Helvetica' && q.fontFamily !== 'Times New Roman' && q.fontFamily !== 'Courier New' && q.fontFamily !== 'Verdana' && q.fontFamily !== 'Georgia' && q.fontFamily !== 'Palatino' && q.fontFamily !== 'Garamond' && q.fontFamily !== 'Bookman' && q.fontFamily !== 'Comic Sans MS' && q.fontFamily !== 'Trebuchet MS' && q.fontFamily !== 'Arial Black' && q.fontFamily !== 'Impact') {
          usedFonts.add(q.fontFamily);
        }
      });
    });
    
    const fontImports = Array.from(usedFonts).map(font => @import url('https://fonts.googleapis.com/css2?family=:wght@400;700&display=swap');).join('\\n');

    const content = (
'''
    code = code[:start_idx] + logic + code[start_idx + len(start_str):]
    
    # inject the fontImports into the <style> block
    style_start = code.find("<style>")
    if style_start != -1:
        new_style = '''<style>
          {
            
            
            @media print {'''
        code = code.replace("<style>\n          {\n            @media print {", new_style)
        
    with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched PrintView")
else:
    print("Could not find start_idx")
