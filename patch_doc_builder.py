import re
import os

file_path = 'src/pages/Examination.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for DocumentBuilder
if 'DocumentBuilder' not in content:
    content = content.replace("import ReportCardPrintView from '../components/ReportCardPrintView';", "import ReportCardPrintView from '../components/ReportCardPrintView';\nimport DocumentBuilder from '../components/DocumentBuilder';")

# 2. Add 'doc_builder' to activeTab type
content = content.replace("useState<'reports' | 'certificates' | 'schedules' | 'papers'>", "useState<'reports' | 'certificates' | 'schedules' | 'papers' | 'doc_builder'>")

# 3. Add the button in the tab bar
old_tab_bar = r"(<button className=\{activeTab === 'certificates' \? 'btn-primary' : 'btn-secondary'\} onClick=\{.*?\}><ShieldAlert size=\{18\} style=\{\{whiteSpace:'nowrap'\}\}/> Certificates</button>)"
new_tab_bar = r"\1\n          <button className={activeTab === 'doc_builder' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('doc_builder')}><FileText size={18} style={{whiteSpace:'nowrap'}}/> Custom Docs</button>"
content = re.sub(old_tab_bar, new_tab_bar, content)

# 4. Render DocumentBuilder when activeTab is 'doc_builder'
# We'll insert it right after the glass-panel containing the filters (or just before it so it replaces the student list)
# Wait, the best place is to render it conditionally INSTEAD of the filters/student list.
old_render = r"(<div className=\"glass-panel\" style=\{\{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' \}\}>)"
new_render = r"{activeTab === 'doc_builder' ? <DocumentBuilder /> : \1"
# And we need to close the ternary at the end! That's too risky with regex.

# Let's just append it before the `</div>` of the main container, wrapped in a condition.
# Actually, the entire rest of the page (filters, grid) can just be wrapped or we can just append DocumentBuilder at the end of the page when activeTab is doc_builder, and hide the rest.
# Let's hide the rest when activeTab === 'doc_builder'.
content = content.replace("<div className=\"glass-panel\" style={{ padding: '20px'", "{activeTab !== 'doc_builder' && (\n        <><div className=\"glass-panel\" style={{ padding: '20px'")
content = content.replace("</div>\n    </div>\n  );\n};", "</>\n      )}\n      {activeTab === 'doc_builder' && <DocumentBuilder />}\n    </div>\n  );\n};")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Custom Docs tab.")
