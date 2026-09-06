import re

file_path = 'src/pages/Examination.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                {activeTab === 'reports' && filteredStudents.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <button className="btn-primary" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={async () => {
                      const allMarks = await getAllExamMarksForTerm(examType);
                      setPrintMarks(allMarks);
                      setView('bulk_report_config');
                    }}>
                      <Award size={20} style={{ marginRight: '8px' }} /> Generate Report Cards for All Students
                    </button>
                  </div>
                )}'''

if target in content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.replace(target, ''))
    print("Successfully removed the button.")
else:
    print("Target not found. Will try regex.")
    
    # Try Regex
    pattern = re.compile(r'\{activeTab === \'reports\' && filteredStudents\.length > 0 && \(\s*<div style={{ marginBottom: \'24px\' }}>.*?</div>\s*\)\}', re.DOTALL)
    new_content = pattern.sub('', content)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully removed the button via regex.")
    else:
        print("Still not found.")
