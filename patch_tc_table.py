import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Top headers row alignment
content = content.replace("<div style={{ display: 'flex', flexDirection: 'column', fontSize: '16px', fontWeight: 'bold' }}>\n                    <div style={{ display: 'flex', alignItems: 'center' }}>Book No", 
                          "<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>\n                    <div style={{ display: 'flex', alignItems: 'center' }}>Book No")

# 2. Watermark img tag
content = re.sub(r'<div className="tc-watermark" style=\{\{\s*backgroundImage: `url\(\'\$\{settings\?\.logoUrl \|\| "/images/logo_circular\.png"\}\'\)`\s*\}\}></div>',
                 r'<img className="tc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="Watermark" style={{ objectFit: "contain" }} />', content)

# 3. Add table CSS
css_table = """
            .tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            .tc-details-table td { border: 1px solid #000; padding: 4px 8px; vertical-align: middle; }
            .tc-details-table td.label-col { font-weight: bold; width: 40%; }
            .tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 14px; font-family: inherit; font-weight: bold; }
"""
if '.tc-details-table' not in content:
    content = content.replace(".tc-label, .cc-label, .bc-label {", css_table + "\n            .tc-label, .cc-label, .bc-label {")

# 4. Replace the 1-column flex details with a table
# We need to find everything from {/* 2 COLUMN GRID */} or {/* LEFT COLUMN */} down to {/* FOOTER */}
table_html = """
                 <table className="tc-details-table">
                    <tbody>
                       <tr><td className="label-col">PEN No.</td><td><input name="pen" value={formData.pen} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">1. Name of Student</td><td><input name="studentName" value={formData.studentName} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">2. Date of Birth (In Words)</td><td><input name="dobWords" value={formData.dobWords} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">&nbsp;&nbsp;&nbsp;&nbsp;(In Figures)</td><td><input name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">3. Mother's Name (Smt.)</td><td><input name="motherName" value={formData.motherName} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">4. Father's Name (Shri)</td><td><input name="fatherName" value={formData.fatherName} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">5. Caste / Religion</td><td><input name="casteReligion" value={formData.casteReligion} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">6. Residence / Vill. / Post</td><td><input name="residenceMohalla" value={formData.residenceMohalla} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">&nbsp;&nbsp;&nbsp;&nbsp;Tehsil & District</td><td><input name="tehsilDistrict" value={formData.tehsilDistrict} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">7. Duration of Residence in U.P.</td><td><input name="residenceUp" value={formData.residenceUp} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">8. Date of First Admission</td><td><input name="firstAdmissionDate" value={formData.firstAdmissionDate} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">&nbsp;&nbsp;&nbsp;&nbsp;Admission Register No.</td><td><input name="admissionRegisterNo" value={formData.admissionRegisterNo} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">9. Date of Leaving School</td><td><input name="dateOfLeaving" value={formData.dateOfLeaving} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">APAAR ID</td><td><input name="apaarId" value={formData.apaarId} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">10. Date of Striking Off</td><td><input name="dateOfStrikingOff" value={formData.dateOfStrikingOff} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">11. Reason for Striking Off</td><td><input name="reasonForStrikingOff" value={formData.reasonForStrikingOff} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">12. Character</td><td><input name="character" value={formData.character} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">13. Higher Exam Passed</td><td><input name="higherExamPassed" value={formData.higherExamPassed} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">&nbsp;&nbsp;&nbsp;&nbsp;& Date</td><td><input name="higherExamDate" value={formData.higherExamDate} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">14. Class Removed From</td><td><input name="classRemovedFrom" value={formData.classRemovedFrom} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">15. Language (Hindi/Urdu)</td><td><input name="studentLanguage" value={formData.studentLanguage} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">16. Occupation</td><td><input name="occupation" value={formData.occupation} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">17. Student's Aadhaar No.</td><td><input name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">18. Status According to Class</td><td><input name="statusByClass" value={formData.statusByClass} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">19. Number of School Days</td><td><input name="schoolOpenDays" value={formData.schoolOpenDays} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">20. Number of Days Present</td><td><input name="presentDays" value={formData.presentDays} onChange={handleChange} /></td></tr>
                       <tr><td className="label-col">21. Any Other Remarks</td><td><input name="other" value={formData.other} onChange={handleChange} /></td></tr>
                    </tbody>
                 </table>
"""

# Regex replace from {/* 2 COLUMN GRID */} (or whatever it's called now) to {/* FOOTER */}
# Actually it might not be called 2 COLUMN GRID anymore. Let's just match from `<div style={{ display: 'flex', flexDirection: 'column', fontSize: '16px' }}>` to `{/* FOOTER */}`
content = re.sub(r'<div style=\{\{\s*display:\s*\'flex\',\s*flexDirection:\s*\'column\',\s*fontSize:\s*\'16px\'\s*\}\}>.*?(?=\{/\*\s*FOOTER\s*\*/\})', table_html + "\n                 ", content, flags=re.DOTALL)

# Ensure the replace worked, if not, fallback to a broader regex
if '<table className="tc-details-table">' not in content:
    # Try finding the LEFT COLUMN marker
    content = re.sub(r'\{/\*\s*LEFT COLUMN\s*\*/\}.*?(?=\{/\*\s*FOOTER\s*\*/\})', table_html + "\n                 ", content, flags=re.DOTALL)
    # And remove the wrapping div
    content = re.sub(r'<div style=\{\{\s*display:\s*\'flex\',\s*flexDirection:\s*\'column\',\s*fontSize:\s*\'16px\'\s*\}\}>\s*<table', '<table', content)
    content = re.sub(r'</table>\s*</div>\s*<div style=\{\{\s*marginTop:\s*\'50px\'', '</table>\n                 <div style={{ marginTop: \'50px\'', content)

# 5. Fix watermark CSS to work with img
content = content.replace("opacity: 0.06;", "opacity: 0.12; pointer-events: none;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Table layout to TC.")
