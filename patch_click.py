import re

file_path = 'src/pages/Examination.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_click = """                    <button className="btn-primary" onClick={() => {
                      setScheduleData({ classId: 'MASTER', examTerm: examType, schedule: [] });
                      setShowPrintView(true);
                    }}>"""

new_click = """                    <button className="btn-primary" onClick={() => {
                      setScheduleData({ classId: 'MASTER', examTerm: examType, schedule: [] });
                      setView('schedule_config');
                      setShowPrintView(true);
                    }}>"""

content = content.replace(old_click, new_click)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added setView")
