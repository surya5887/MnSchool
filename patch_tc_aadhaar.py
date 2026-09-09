import re

file_path = 'src/components/TransferCertificatePrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The current list of elements to be replaced:
old_content = """                    <div className="tc-row">
                        <span className="tc-label">4. Father's/Guardian's Name:</span>
                        <InputLine name="fatherName" value={formData.fatherName} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">5. Date of Admission in the School:</span>
                        <InputLine name="admissionDate" value={formData.admissionDate} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row" style={{ marginBottom: '8px' }}>
                        <span className="tc-label">6. Date of Birth</span>
                        <InputLine name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} />
                    </div>
                    <div className="tc-row" style={{ paddingLeft: '20px' }}>
                        <span className="tc-label">(In Words):</span>
                        <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">7. Class in which the pupil last studied:</span>
                        <InputLine name="lastClass" value={formData.lastClass} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">8. School/Board Annual Examination last taken with result:</span>
                        <InputLine name="annualExam" value={formData.annualExam} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">9. Subjects Studied:</span>
                        <InputLine name="subjects" value={formData.subjects} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">10. Whether qualified for promotion to the higher class:</span>
                        <InputLine name="qualifiedPromotion" value={formData.qualifiedPromotion} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">11. Result:</span>
                        <InputLine name="result" value={formData.result} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">12. General conduct:</span>
                        <InputLine name="conduct" value={formData.conduct} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">13. Date of issue of certificate:</span>
                        <InputLine name="issueDate" value={formData.issueDate} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">14. Reasons for leaving the school:</span>
                        <InputLine name="reasonLeaving" value={formData.reasonLeaving} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">15. Any other remarks:</span>
                        <InputLine name="remarks" value={formData.remarks} onChange={handleChange} />
                    </div>

                    <div className="tc-row">
                        <span className="tc-label">16. Aadhaar No:</span>
                        <InputLine name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} />
                    </div>"""

new_content = """                    <div className="tc-row">
                        <span className="tc-label">4. Father's/Guardian's Name:</span>
                        <InputLine name="fatherName" value={formData.fatherName} onChange={handleChange} />
                    </div>

                    <div className="tc-row">
                        <span className="tc-label">5. Aadhaar No:</span>
                        <InputLine name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">6. Date of Admission in the School:</span>
                        <InputLine name="admissionDate" value={formData.admissionDate} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row" style={{ marginBottom: '8px' }}>
                        <span className="tc-label">7. Date of Birth</span>
                        <InputLine name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} />
                    </div>
                    <div className="tc-row" style={{ paddingLeft: '20px' }}>
                        <span className="tc-label">(In Words):</span>
                        <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">8. Class in which the pupil last studied:</span>
                        <InputLine name="lastClass" value={formData.lastClass} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">9. School/Board Annual Examination last taken with result:</span>
                        <InputLine name="annualExam" value={formData.annualExam} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">10. Subjects Studied:</span>
                        <InputLine name="subjects" value={formData.subjects} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">11. Whether qualified for promotion to the higher class:</span>
                        <InputLine name="qualifiedPromotion" value={formData.qualifiedPromotion} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">12. Result:</span>
                        <InputLine name="result" value={formData.result} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">13. General conduct:</span>
                        <InputLine name="conduct" value={formData.conduct} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">14. Date of issue of certificate:</span>
                        <InputLine name="issueDate" value={formData.issueDate} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">15. Reasons for leaving the school:</span>
                        <InputLine name="reasonLeaving" value={formData.reasonLeaving} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">16. Any other remarks:</span>
                        <InputLine name="remarks" value={formData.remarks} onChange={handleChange} />
                    </div>"""

if old_content in content:
    content = content.replace(old_content, new_content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully moved Aadhaar No and renumbered.")
else:
    print("Could not find the exact block to replace. Please check the code.")
