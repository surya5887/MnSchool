import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface TCProps {
  student: StudentData;
  className: string;
  onClose: () => void;
}

const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end' }}>
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
          fontWeight: 'bold',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          minWidth: '20px',
          maxWidth: '100%'
        }}
      />
      <div style={{ flex: 1, borderBottom: '1.5px dotted #000', marginBottom: '4px', minWidth: '20px' }}></div>
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
    bookNo: '',
    tcNo: '',
    udise: '09020302404',
    recognitionNo: '',
    pen: '',
    studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
    dobWords: '',
    dobNumbers: student.dob || '',
    motherName: '',
    fatherName: student.parentName || '',
    casteReligion: '',
    residenceMohalla: '',
    tehsilDistrict: '',
    residenceUp: 'Since Birth',
    firstAdmissionDate: '',
    admissionRegisterNo: student.admissionNo || '',
    dateOfLeaving: '',
    apaarId: '',
    dateOfStrikingOff: '',
    reasonForStrikingOff: '',
    character: 'Good',
    higherExamPassed: '',
    higherExamDate: '',
    classRemovedFrom: className || '',
    studentLanguage: 'Hindi',
    occupation: '',
    aadhaarNo: student.aadharNumber || '',
    statusByClass: '',
    schoolOpenDays: '',
    presentDays: '',
    other: '',
    writingDate: new Date().toLocaleDateString('en-GB').split('/')[0],
    writingMonth: new Date().toLocaleDateString('en-GB').split('/')[1],
    writingYear: new Date().toLocaleDateString('en-GB').split('/')[2].slice(-2),
    schoolMohalla: 'HARSOLI'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

    let finalWritingDate = formData.writingDate || '';
  if (finalWritingDate.length > 0 && finalWritingDate.length <= 2 && formData.writingMonth) {
      let yr = formData.writingYear || String(new Date().getFullYear());
      if (yr.length === 2) yr = '20' + yr;
      finalWritingDate = `${finalWritingDate}-${formData.writingMonth}-${yr}`;
  }
  if (!finalWritingDate) {
      const today = new Date();
      finalWritingDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  }

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
      <style>
          {`
            @media print {
              body * { visibility: hidden; }
              body, html { margin: 0 !important; padding: 0 !important; height: 100% !important; background: white !important; }
              @page { size: A4 portrait; margin: 0; }
              .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; }
              .preview-overlay * { visibility: visible; }
              .no-print { display: none !important; }
              .tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important; max-width: none !important; padding: 0 !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; }
              .tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 15px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
              .tc-content-z, .cc-content-z, .bc-content-z { flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 15px; }
              input.tc-editable, input.cc-editable, input.bc-editable { border: none !important; background: transparent !important; }
              .tc-dotted-input { border-bottom: 1.5px dotted #000 !important; }
            }
            
            .tc-container, .cc-container, .bc-container {
              font-family: 'Arial', sans-serif;
              background: white;
              max-width: 950px;
              margin: 0 auto;
              position: relative;
              color: #000;
              border: 8px solid #1e3a8a;
              padding: 8px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            .tc-inner-border, .cc-inner-border, .bc-inner-border {
               border: 2px solid #b91c1c;
               padding: 40px;
               height: 100%;
               position: relative;
            }
            
            .tc-watermark, .cc-watermark, .bc-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.12; pointer-events: none;
              width: 550px;
              height: 550px;
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              z-index: 1;
            }
            
            .tc-content-z, .cc-content-z, .bc-content-z {
              position: relative;
              z-index: 10;
            }
            
            .tc-field, .cc-field, .bc-field {
               display: flex;
               align-items: flex-end;
               margin-bottom: 6px;
            }
            
            
            .tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14.5px; }
              .tc-details-table td { border: 1.5px solid #444; padding: 5px 8px; vertical-align: middle; }
              .tc-details-table td.label-col { font-weight: bold; width: 40%; background-color: rgba(0, 0, 0, 0.03); }
              .tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 14.5px; font-family: inherit; font-weight: bold; color: #000; }

            .tc-label, .cc-label, .bc-label {
               font-weight: bold;
               white-space: nowrap;
               margin-right: 8px;
            }
          `}
        </style>

      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print TC
        </button>
      </div>

      <div className="tc-container">
         <div className="tc-inner-border">
            <img className="tc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="Watermark" style={{ objectFit: "contain" }} />
            
            <div className="tc-content-z">
               {/* TOP HEADERS */}
               <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Book No</span>
                       <input name="bookNo" value={formData.bookNo} onChange={handleChange} className="tc-dotted-input" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1.2, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>U-DISE</span>
                       <input name="udise" value={formData.udise} onChange={handleChange} className="tc-dotted-input" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1.4, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Recognition No</span>
                       <input name="recognitionNo" value={formData.recognitionNo} onChange={handleChange} className="tc-dotted-input" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1 }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>T.C. No</span>
                       <input name="tcNo" value={formData.tcNo} onChange={handleChange} className="tc-dotted-input" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                 </div>

               {/* MAIN TITLE & LOGOS */}
               <div style={{ textAlign: 'center', marginTop: '0px', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                       <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: '90px', height: '90px' }} alt="Logo" />
                       <div style={{ textAlign: 'left' }}>
                        <h1 style={{ margin: 0, color: '#b91c1c', fontSize: '26px', fontFamily: "'Arial Black', Impact, sans-serif", letterSpacing: '1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a' }}>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                     </div>
                     
                  </div>
                  <div style={{ background: '#1e3a8a', color: 'white', display: 'inline-block', padding: '6px 30px', borderRadius: '4px', marginTop: '12px', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                     LEAVING CERTIFICATE (BASIC SHIKSHA PARISHAD)
                  </div>
               </div>

               {/* 2 COLUMN GRID */}
               
                 <table className="tc-details-table">
                    <tbody>
                       <tr><td className="label-col">PEN No.</td><td><input name="pen" value={formData.pen} onChange={handleChange} /></td></tr>
                         <tr><td className="label-col">APAAR ID</td><td><input name="apaarId" value={formData.apaarId} onChange={handleChange} /></td></tr>
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

                 {/* FOOTER */}
                 <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                       <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '15px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>Date of Issue</div> 
                          <input name="writingDate" value={finalWritingDate} onChange={handleChange} placeholder="DD-MM-YYYY" className="tc-dotted-input" style={{ width: '110px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px', textAlign: 'center' }} /> 
                       </div>
                       <div style={{ width: '250px', borderBottom: '1.5px solid #000' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '15px', marginTop: '10px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>School Mohalla / Location</div> 
                          <input name="schoolMohalla" value={formData.schoolMohalla} onChange={handleChange} className="tc-dotted-input" style={{ width: '180px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px' }} />
                       </div>
                       <div style={{ textAlign: 'center', width: '250px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '17px', marginTop: '4px' }}>Signature of Principal</div>
                          <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                       </div>
                    </div>
                 </div>
               
            </div>
         </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
