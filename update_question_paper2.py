import sys
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = f.read()

    new_fields = '''          {/* Fillable Fields */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", margin: "15px 0", fontSize: "14px", fontWeight: "bold", textAlign: "left", color: "#000" }}>
            <div style={{ width: "31%", marginBottom: "15px", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>Name:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
            <div style={{ width: "31%", marginBottom: "15px", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>Roll No.:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
            <div style={{ width: "31%", marginBottom: "15px", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>F. Name:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
            <div style={{ width: "31%", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>Date of Exam:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
            <div style={{ width: "31%", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>Examiner:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
            <div style={{ width: "31%", display: "flex", alignItems: "flex-end" }}>
              <span style={{ whiteSpace: "nowrap", marginRight: "5px" }}>Invigilator:</span>
              <span style={{ borderBottom: "1px solid #000", flex: 1 }}></span>
            </div>
          </div>'''

    # Since I already added it to MN repo, I should replace the OLD new_fields block.
    # For Rahimya, I added it but haven't pushed, but the file HAS it.
    
    # We will use regex to find the Fillable Fields block and replace it
    pattern = r'\{\/\* Fillable Fields \*\/\}.*?</div>'
    # Actually wait, the `</div>` will just match the first closing div of the wrapper!
    
    # Let's match from `{/* Fillable Fields */}` to the `</div>` that precedes `<hr`
    pattern = r'\{\/\* Fillable Fields \*\/\}.*?(?=<hr)'
    
    data, count = re.subn(pattern, new_fields + '\n\n          ', data, flags=re.DOTALL)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(data)
        print(f"Updated {filepath}")
    else:
        print(f"Block not found in {filepath}")

update_file(r'C:\Users\AneesChaudhary\Desktop\MN_Public_School\frontend\src\components\QuestionPaperPrintView.tsx')
update_file(r'C:\Users\AneesChaudhary\Desktop\Rahimya_Model_School\frontend\src\components\QuestionPaperPrintView.tsx')
