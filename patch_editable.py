import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update formData initial state
    old_form_data = r"const \[formData, setFormData\] = useState\(\{(.*?)\}\);"
    
    # We need to extract the existing initial state and append the new fields
    def replacer(match):
        inner = match.group(1)
        # The variables student, className are already in scope above this.
        # But wait, in the file, `const name = ...` is defined BELOW the state!
        return """const [formData, setFormData] = useState({""" + inner + """,
    studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    fatherName: student.parentName || student.fatherName || '',
    motherName: student.motherName || '',
    className: className || '',
    dobNum: student.dateOfBirth ? student.dateOfBirth.split('-').reverse().join('-') : ''
  });"""
    
    content = re.sub(old_form_data, replacer, content, flags=re.DOTALL)

    # 2. Remove the old constant declarations to avoid shadowing
    content = re.sub(r"const dob = student\.dateOfBirth.*?;", "", content)
    content = re.sub(r"const name = `\$\{student\.firstName \|\| ''\}.*?\.trim\(\);", "", content)
    content = re.sub(r"const fatherName = student\.parentName.*?;\n", "", content)
    content = re.sub(r"const motherName = student\.motherName.*?;\n", "", content)

    # 3. Replace {name}, {fatherName}, {motherName}, {className}, {dob} with inputs
    # Note: textTransform is applied via CSS, but for input it only affects display. 
    # The user might type lowercase. It's fine.

    input_tpl = '<input name="{name}" value={{formData.{name}}} onChange={{handleChange}} size={{Math.max(String(formData.{name} || "").length, 4)}} style={{ border: "none", outline: "none", background: "transparent", fontWeight: "bold", fontFamily: "inherit", padding: 0, textAlign: "center", {extra_style} }} />'

    name_input = input_tpl.format(name="studentName", extra_style="color: '#b91c1c', textTransform: 'uppercase'")
    father_input = input_tpl.format(name="fatherName", extra_style="textTransform: 'uppercase', color: 'inherit'")
    mother_input = input_tpl.format(name="motherName", extra_style="textTransform: 'uppercase', color: 'inherit'")
    class_input = input_tpl.format(name="className", extra_style="color: 'inherit'")
    dob_input = input_tpl.format(name="dobNum", extra_style="fontSize: '22px', color: 'inherit'")

    # CC Replacements
    if "CharacterCertificate" in file_path:
        content = content.replace("<strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>", name_input)
        content = content.replace("<strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong>", father_input)
        content = content.replace("<strong style={{ textTransform: 'uppercase' }}>{motherName}</strong>", mother_input)
        content = content.replace("<strong style={{ margin: '0 6px' }}>{className}</strong>", f"<strong>{class_input}</strong>")
        content = content.replace("<strong style={{ fontSize: '22px' }}>{dob}</strong>", dob_input)

    # BC Replacements
    if "BirthCertificate" in file_path:
        content = content.replace("<strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>", name_input)
        content = content.replace("<strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong>", father_input)
        content = content.replace("<strong style={{ textTransform: 'uppercase' }}>{motherName}</strong>", mother_input)
        content = content.replace("<strong>{className}</strong>", f"<strong>{class_input}</strong>")
        content = content.replace("<strong style={{ fontSize: '22px' }}>{dob}</strong>", dob_input)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Made core fields editable without borders.")
