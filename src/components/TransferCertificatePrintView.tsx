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
              .tc-content-z, .cc-content-z, .bc-content-z { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
              input.tc-editable, input.cc-editable, input.bc-editable { border: none !important; background: transparent !important; }
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
              opacity: 0.06;
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
               margin-bottom: 8px;
            }
            
            .tc-label, .cc-label, .bc-label {
               font-weight: bold;
               white-space: nowrap;
               margin-right: 8px;
            }
          `}
        </style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print TC
        </button>
      </div>

      <div className="tc-container">
         <div className="tc-inner-border">
            <div className="tc-watermark" style={{ backgroundImage: `url('${settings?.logoUrl || "/images/logo_circular.png"}')` }}></div>
            
            <div className="tc-content-z">
               {/* TOP HEADERS */}
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Book No <InputLine name="bookNo" value={formData.bookNo} onChange={handleChange} width="80px" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>U-DISE <InputLine name="udise" value={formData.udise} onChange={handleChange} width="120px" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>Recognition No <InputLine name="recognitionNo" value={formData.recognitionNo} onChange={handleChange} width="120px" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>T.C. No <InputLine name="tcNo" value={formData.tcNo} onChange={handleChange} width="80px" /></div>
               </div>

               {/* MAIN TITLE & LOGOS */}
               <div style={{ textAlign: 'center', marginTop: '0px', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                     <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: '100px', height: '100px' }} alt="Logo Left" />
                     <div style={{ textAlign: 'center', flex: 1 }}>
                        <h1 style={{ margin: 0, color: '#b91c1c', fontSize: '28px', fontFamily: "'Arial Black', Impact, sans-serif", letterSpacing: '1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '16px', color: '#1e3a8a' }}>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                     </div>
                     
                  </div>
                  <div style={{ background: '#1e3a8a', color: 'white', display: 'inline-block', padding: '8px 35px', borderRadius: '4px', marginTop: '15px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                     LEAVING CERTIFICATE (BASIC SHIKSHA PARISHAD)
                  </div>
               </div>

               {/* 2 COLUMN GRID */}
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  
                  {/* LEFT COLUMN */}
                  <div style={{ width: "48%" }}>
                     <div className="tc-field"><div className="tc-label">PEN No.</div> <InputLine name="pen" value={formData.pen} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">1. Name of Student</div> <InputLine name="studentName" value={formData.studentName} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '8px' }}>
                        <div className="tc-label">2. Date of Birth</div>
                        <div className="tc-field" style={{ paddingLeft: '20px' }}><div className="tc-label" style={{ minWidth: '90px' }}>In Words</div> <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '90px' }}>In Figures</div> <InputLine name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">3. Mother's Name (Smt.)</div> <InputLine name="motherName" value={formData.motherName} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">4. Father's Name (Shri)</div> <InputLine name="fatherName" value={formData.fatherName} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">5. Caste / Religion</div> <InputLine name="casteReligion" value={formData.casteReligion} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '8px' }}>
                        <div className="tc-field"><div className="tc-label">6. Residence / Vill. / Post</div> <InputLine name="residenceMohalla" value={formData.residenceMohalla} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '120px' }}>Tehsil & District</div> <InputLine name="tehsilDistrict" value={formData.tehsilDistrict} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">7. Duration of Residence in U.P.</div> <InputLine name="residenceUp" value={formData.residenceUp} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '8px' }}>
                        <div className="tc-field"><div className="tc-label">8. Date of First Admission</div> <InputLine name="firstAdmissionDate" value={formData.firstAdmissionDate} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '150px' }}>Admission Register No.</div> <InputLine name="admissionRegisterNo" value={formData.admissionRegisterNo} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">9. Date of Leaving School</div> <InputLine name="dateOfLeaving" value={formData.dateOfLeaving} onChange={handleChange} /></div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div style={{ width: "48%" }}>
                     <div className="tc-field"><div className="tc-label">APAAR ID</div> <InputLine name="apaarId" value={formData.apaarId} onChange={handleChange} /></div>
                     
                     <div className="tc-field"><div className="tc-label">10. Date of Striking Off</div> <InputLine name="dateOfStrikingOff" value={formData.dateOfStrikingOff} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">11. Reason for Striking Off</div> <InputLine name="reasonForStrikingOff" value={formData.reasonForStrikingOff} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">12. Character</div> <InputLine name="character" value={formData.character} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '8px' }}>
                        <div className="tc-field"><div className="tc-label">13. Higher Exam Passed</div> <InputLine name="higherExamPassed" value={formData.higherExamPassed} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '90px' }}>& Date</div> <InputLine name="higherExamDate" value={formData.higherExamDate} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">14. Class Removed From</div> <InputLine name="classRemovedFrom" value={formData.classRemovedFrom} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">15. Language (Hindi/Urdu)</div> <InputLine name="studentLanguage" value={formData.studentLanguage} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">16. Occupation</div> <InputLine name="occupation" value={formData.occupation} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">17. Student's Aadhaar No.</div> <InputLine name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">18. Status According to Class</div> <InputLine name="statusByClass" value={formData.statusByClass} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">19. Number of School Days</div> <InputLine name="schoolOpenDays" value={formData.schoolOpenDays} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">20. Number of Days Present</div> <InputLine name="presentDays" value={formData.presentDays} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">21. Any Other Remarks</div> <InputLine name="other" value={formData.other} onChange={handleChange} /></div>
                  </div>

               </div>

               {/* FOOTER */}
               <div style={{ marginTop: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '15px' }}>
                        <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>Date of Issue</div> 
                        <InputLine name="writingDate" value={formData.writingDate} onChange={handleChange} width="40px" /> 
                        <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>Month</div> 
                        <InputLine name="writingMonth" value={formData.writingMonth} onChange={handleChange} width="40px" /> 
                        <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>Year: 20</div> 
                        <InputLine name="writingYear" value={formData.writingYear} onChange={handleChange} width="40px" />
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                        <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>School Mohalla / Location</div> 
                        <InputLine name="schoolMohalla" value={formData.schoolMohalla} onChange={handleChange} width="220px" />
                     </div>
                  </div>

                  <div style={{ textAlign: 'center', width: '250px' }}>
                     <div style={{ borderBottom: '1.5px solid #000', height: '40px', marginBottom: '10px' }}></div>
                     <div style={{ fontWeight: 'bold', fontSize: '17px' }}>Signature of Principal</div>
                     <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                  </div>
               </div>
               
            </div>
         </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
