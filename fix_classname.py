import sys

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = f.read()

    old_text = 'Class: {classFilter || "All"} - Time Table'
    new_text = 'Class: {(() => { const c = classes.find(cls => cls.id === classFilter); return c ? (c.className + (c.sections?.[0] ? " - " + c.sections[0] : "")) : (authUser.assignedClass || "All"); })()} - Time Table'

    data = data.replace(old_text, new_text)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(data)

fix_file(r'C:\Users\AneesChaudhary\Desktop\MN_Public_School\frontend\src\pages\Timetable.tsx')
fix_file(r'C:\Users\AneesChaudhary\Desktop\Rahimya_Model_School\frontend\src\pages\Timetable.tsx')
print("Fixed")
