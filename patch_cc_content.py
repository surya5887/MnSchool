import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add formData fields for dobWords and admissionNumber
content = content.replace("session: '2026-2027',", "session: '2026-2027',\n    dobWords: '',\n    admissionNumber: '',")

# Add dob variable
content = content.replace("const name = ", "const dob = student.dateOfBirth ? student.dateOfBirth.split('-').reverse().join('-') : '';\n  const name = ")

# Modify the top date area to include Admission No
old_date_area = r"<div style=\{\{\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*marginBottom:\s*'40px',\s*fontSize:\s*'15px',\s*fontWeight:\s*'bold'\s*\}\}>\s*<div></div>\s*<div>Date:\s*\{formData\.issueDate\.split\('-'\)\.reverse\(\)\.join\('-'\)\}</div>\s*</div>"
new_date_area = """<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '15px', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Admission No. <input name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className="tc-dotted-input" style={{ width: '120px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', textAlign: 'center', fontFamily: 'inherit', marginLeft: '10px' }} /></div>
                <div>Date: {formData.issueDate.split('-').reverse().join('-')}</div>
             </div>"""
content = re.sub(old_date_area, new_date_area, content)

# Expand the body paragraph
old_body = r"<div style=\{\{\s*fontSize:\s*'20px',\s*lineHeight:\s*'2\.5',\s*textAlign:\s*'justify',\s*marginTop:\s*'20px',\s*textIndent:\s*'50px'\s*\}\}>.*?<p style=\{\{\s*margin:\s*'0',\s*textAlign:\s*'center',\s*marginTop:\s*'40px',\s*fontStyle:\s*'italic',\s*fontWeight:\s*'bold',\s*color:\s*'#1e3a8a'\s*\}\}>\s*I wish him/her all success in his/her future endeavors\.\s*</p>\s*</div>"

new_body = """<div style={{ fontSize: '20px', lineHeight: '2.5', textAlign: 'justify', marginTop: '20px' }}>
                <p style={{ margin: '0 0 20px 0', textIndent: '50px' }}>
                   This is to certify that <strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>, 
                   son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
                   Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this institution.
                </p>
                <p style={{ margin: '0 0 20px 0' }}>
                   His/Her Date of Birth according to the Admission Register of the school is <strong style={{ fontSize: '22px' }}>{dob}</strong> 
                   <br/> (in words: <input name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" className="tc-dotted-input" style={{ width: '600px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', textAlign: 'left', fontFamily: 'inherit' }} />).
                </p>
                <p style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                   He/She has passed / is studying in Class <strong style={{ margin: '0 6px' }}>{className}</strong> during the academic session 
                   <input name="session" value={formData.session} onChange={handleChange} className="tc-dotted-input" style={{ width: '130px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '20px', padding: '0 4px', textAlign: 'center', fontFamily: 'inherit' }} />.
                </p>
                <p style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                   To the best of my knowledge and belief, he/she bears a 
                   <input name="character" value={formData.character} onChange={handleChange} className="tc-dotted-input" style={{ width: '150px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '20px', padding: '0 4px', textAlign: 'center', marginLeft: '8px', marginRight: '8px' }} /> moral character. He/She has not taken part in any activity subversive to the rules of the school.
                </p>
                <p style={{ margin: '0', textAlign: 'center', marginTop: '60px', fontStyle: 'italic', fontWeight: 'bold', color: '#1e3a8a', fontSize: '22px' }}>
                   I wish him/her all success in his/her future endeavors.
                </p>
             </div>"""

content = re.sub(old_body, new_body, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Expanded Character Certificate content.")
