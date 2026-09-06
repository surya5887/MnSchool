import re
import os

file_path = 'src/components/BirthCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Top Header (Admission and Date)
old_top = r"<div style=\{\{\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*marginBottom:\s*'40px',\s*fontSize:\s*'15px',\s*fontWeight:\s*'bold'\s*\}\}>\s*<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center'\s*\}\}>Admission No:\s*&nbsp;<input name=\"admissionNumber\".*?/></div>\s*<div>Date:\s*\{formData\.issueDate\.split\('-'\)\.reverse\(\)\.join\('-'\)\}</div>\s*</div>"

new_top = """<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '15px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Admission No. <input name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className="tc-dotted-input" style={{ width: '120px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', textAlign: 'center', fontFamily: 'inherit', marginLeft: '10px' }} /></div>
                  <div>Date: {formData.issueDate.split('-').reverse().join('-')}</div>
               </div>"""
content = re.sub(old_top, new_top, content)

# 2. Rewrite the Body
old_body = r"<div style=\{\{\s*fontSize:\s*'20px',\s*lineHeight:\s*'2\.5',\s*textAlign:\s*'justify',\s*marginTop:\s*'20px',\s*textIndent:\s*'50px'\s*\}\}>.*?<p style=\{\{\s*margin:\s*'0 0 20px 0',\s*textIndent:\s*'0'\s*\}\}>\s*He/She is/was studying in Class <strong>\{className\}</strong> at the time of issuing this certificate\.\s*</p>\s*</div>"

new_body = """<div style={{ fontSize: '20px', lineHeight: '1.8', textAlign: 'justify', marginTop: '10px' }}>
                  <p style={{ margin: '0 0 15px 0', textIndent: '50px' }}>
                     This is to certify from the school records that <strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>, 
                     son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
                     Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this institution.
                  </p>
                  <p style={{ margin: '0 0 15px 0', textIndent: '0' }}>
                     His/Her Date of Birth according to the Admission Register maintained in the school is recorded as <strong style={{ fontSize: '22px' }}>{dob}</strong> 
                     (in words: <input name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" className="tc-dotted-input" style={{ width: '500px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', textAlign: 'left', fontFamily: 'inherit' }} />).
                  </p>
                  <p style={{ margin: '0 0 15px 0', textIndent: '0' }}>
                     He/She is/was studying in Class <strong>{className}</strong> at the time of issuing this certificate.
                  </p>
                  <p style={{ margin: '0 0 15px 0', textIndent: '0' }}>
                     This certificate is being issued on the request of the parent/guardian for their personal records.
                  </p>
               </div>"""
content = re.sub(old_body, new_body, content, flags=re.DOTALL)


# 3. Rewrite the Footer
old_footer = r"<div style=\{\{\s*display:\s*'flex',\s*flexDirection:\s*'row',\s*justifyContent:\s*'space-between',\s*marginTop:\s*'120px',\s*alignItems:\s*'flex-end',\s*fontSize:\s*'16px',\s*fontWeight:\s*'bold'\s*\}\}>.*?</div>\s*</div>\s*</div>"

new_footer = """<div style={{ marginTop: '100px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                     <div style={{ width: '200px', borderBottom: '1.5px solid #000' }}></div>
                     <div style={{ width: '200px', borderBottom: '1.5px solid #000' }}></div>
                     <div style={{ width: '250px', borderBottom: '1.5px solid #000' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div style={{ textAlign: 'center', width: '200px', fontSize: '16px', marginTop: '4px' }}>Prepared By</div>
                     <div style={{ textAlign: 'center', width: '200px', fontSize: '16px', marginTop: '4px' }}>Checked By</div>
                     <div style={{ textAlign: 'center', width: '250px' }}>
                        <div style={{ fontSize: '18px', marginTop: '4px' }}>Signature of Principal</div>
                        <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                     </div>
                  </div>
               </div>"""
content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("BC layout fully aligned and expanded.")
