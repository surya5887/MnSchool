import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

content = """import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface TCProps {
  student: StudentData;
  className: string;
  onClose: () => void;
}

const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end', marginLeft: '8px' }}>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="tc-editable"
        size={value ? Math.max(String(value).length, 1) : 1}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          minWidth: '50px',
          maxWidth: '100%'
        }}
      />
      <div style={{ flex: 1, borderBottom: '1px solid #000', marginBottom: '4px', minWidth: '20px' }}></div>
    </div>
  );

const TransferCertificatePrintView: React.FC<TCProps> = ({ student, className, onClose }) => {
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  useEffect(() => {
    getSchoolSettings().then(set => {
      if(set) setSettings(set);
    });
  }, []);

  const [formData, setFormData] = useState({
    admissionNo: student.admissionNo || '',
    studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
    motherName: '',
    fatherName: student.parentName || '',
    admissionDate: '',
    dobNumbers: student.dob || '',
    dobWords: '',
    lastClass: className || '',
    annualExam: `${className || ''} PASS`,
    subjects: 'ENGLISH, MATHS, SCIENCE, S.S.T., HINDI',
    qualifiedPromotion: 'YES',
    result: 'PASS',
    conduct: 'GOOD',
    issueDate: new Date().toLocaleDateString('en-GB').replace(/\\//g, '-'),
    reasonLeaving: 'NA',
    remarks: student.pen ? `PEN : ${student.pen}` : '',
    aadhaarNo: student.aadharNumber || '',
    preparedBy: '',
    checkedBy: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#f1f5f9' }}>
      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center no-print">
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Transfer Certificate Preview</h2>
         </div>
         <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <Printer size={20} /> Print TC
         </button>
      </div>

      <div className="p-8 flex justify-center pb-24">
         <div className="bg-white shadow-xl paper-container" style={{ width: '210mm', minHeight: '297mm', background: 'white', position: 'relative' }}>
            <style dangerouslySetInnerHTML={{__html: `
               @media print {
                  body { margin: 0; padding: 0; background: white; }
                  body * { visibility: hidden; }
                  .paper-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 15mm !important; box-shadow: none !important; }
                  .paper-container * { visibility: visible !important; }
                  .no-print { display: none !important; }
                  @page { size: A4 portrait; margin: 0; }
               }
               @media screen and (max-width: 768px) {
                  .paper-container {
                      zoom: 0.45;
                  }
               }
               .tc-row { display: flex; align-items: flex-end; margin-bottom: 24px; font-size: 16px; color: #333; }
               .tc-label { white-space: nowrap; }
               input.tc-editable { font-family: 'Times New Roman', serif; font-size: 17px !important; text-transform: uppercase; }
            `}} />
            
            <div style={{ padding: '20px' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #ccc', paddingBottom: '16px', gap: '20px', marginBottom: '30px' }}>
                     {settings?.logo && (
                        <img src={settings.logo} alt="School Logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                     )}
                     <div style={{ textAlign: 'center' }}>
                         <h1 style={{ margin: '0', fontSize: '28px', color: '#111', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{settings?.name || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#444' }}>{settings?.address ? settings.address : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#444' }}>Contact: {settings?.phone || '8447537369 / 9873872786'}</p>
                          {settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#444', fontWeight: 'bold' }}>{settings.recognitionText}</p>}
                     </div>
                </div>

                {/* TITLE */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px' }}>TRANSFER CERTIFICATE</h2>
                </div>

                {/* CONTENT */}
                <div style={{ padding: '0 20px', fontFamily: 'Arial, sans-serif' }}>
                    <div className="tc-row">
                        <span className="tc-label">1. Admission No:</span>
                        <InputLine name="admissionNo" value={formData.admissionNo} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">2. Name of Pupil:</span>
                        <InputLine name="studentName" value={formData.studentName} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
                        <span className="tc-label">3. Mother's Name:</span>
                        <InputLine name="motherName" value={formData.motherName} onChange={handleChange} />
                    </div>
                    
                    <div className="tc-row">
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
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ marginTop: '60px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#333' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ marginRight: '8px' }}>Prepared by:</span>
                        <input type="text" name="preparedBy" value={formData.preparedBy} onChange={handleChange} style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', outline: 'none', background: 'transparent', textAlign: 'center', fontSize: '16px', fontFamily: 'inherit' }} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ marginRight: '8px' }}>Checked by:</span>
                        <input type="text" name="checkedBy" value={formData.checkedBy} onChange={handleChange} style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', outline: 'none', background: 'transparent', textAlign: 'center', fontSize: '16px', fontFamily: 'inherit' }} />
                    </div>
                </div>

                <div style={{ marginTop: '40px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#333' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ marginRight: '8px' }}>Principal's Signature with Seal:</span>
                        <div style={{ width: '200px', borderBottom: '1px solid #000' }}></div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced TC code")
