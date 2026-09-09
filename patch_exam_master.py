import re

file_path = 'src/pages/Examination.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_statement = "import DateSheetPrintView from '../components/DateSheetPrintView';\nimport MasterScheduleConfig from '../components/MasterScheduleConfig';"
content = content.replace("import DateSheetPrintView from '../components/DateSheetPrintView';", import_statement)

# Replace the button click in the "Combined" tab
old_click = """                      <button className="btn-primary" onClick={() => {
                        setScheduleData({ classId: 'MASTER', examTerm: examType, schedule: [] });
                        setView('schedule_config');
                        setShowPrintView(true);
                      }}>"""

new_click = """                      <button className="btn-primary" onClick={() => {
                        setView('master_schedule_config');
                      }}>"""

content = content.replace(old_click, new_click)

# Inject the view right after `if (view === 'schedule_config') { ... }` block
# We will just append it before `if (view === 'paper_config') {`

master_view = """  if (view === 'master_schedule_config') {
    return <MasterScheduleConfig 
      examTerm={examType} 
      allClasses={classes} 
      onBack={() => setView('main')} 
      onPreview={(data) => {
        setScheduleData(data);
        setShowPrintView(true);
      }} 
    />;
  }

  if (view === 'paper_config') {"""

content = content.replace("  if (view === 'paper_config') {", master_view)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Examination.tsx")
