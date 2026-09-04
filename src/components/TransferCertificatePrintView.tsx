import React, { useState } from 'react';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface TCProps {
  student: StudentData;
  className: string;
  onClose: () => void;
}

const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
  <input 
    type="text" 
    name={name} 
    value={value} 
    onChange={onChange} 
    placeholder={placeholder}
    className="tc-editable"
    style={{
      background: 'transparent',
      border: 'none',
      borderBottom: '1.5px dotted #000',
      outline: 'none',
      width: width,
      fontSize: '15px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      padding: '0 4px',
      fontFamily: 'inherit',
      display: 'inline-block'
    }}
  />
);

const TransferCertificatePrintView: React.FC<TCProps> = ({ student, className, onClose }) => {
  const [formData, setFormData] = useState({
    bookNo: '',
    tcNo: '',
    udise: '09020302404',
    pen: '',
    recognitionNo: '',
    studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
    dobWords: '',
    dobNumbers: student.dob || '',
    motherName: '',
    fatherName: student.parentName || '',
    casteReligion: '',
    residenceMohalla: '',
    tehsilDistrict: '',
    residenceUp: 'जन्म से',
    firstAdmissionDate: '',
    admissionRegisterNo: student.admissionNo || '',
    dateOfLeaving: '',
    apaarId: '',
    dateOfStrikingOff: '',
    reasonForStrikingOff: '',
    character: 'अच्छा',
    higherExamPassed: '',
    higherExamDate: '',
    classRemovedFrom: className || '',
    studentLanguage: 'हिन्दी',
    occupation: '',
    other: '',
    aadhaarNo: student.aadharNumber || '',
    statusByClass: '',
    schoolOpenDays: '',
    presentDays: '',
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
            .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100%; height: 100%; }
            .preview-overlay * { visibility: visible; }
            .no-print { display: none !important; }
            .tc-container { box-shadow: none !important; margin: 0 auto !important; width: 100% !important; padding: 20px !important; }
            input.tc-editable { border-color: transparent !important; } /* Hide dots when printing */
            input.tc-editable[value=""] { border-bottom: 1.5px dotted #000 !important; } /* Keep line if empty */
          }
          
          .tc-container {
            font-family: 'Arial', sans-serif;
            background: white;
            max-width: 950px;
            margin: 0 auto;
            position: relative;
            color: #000;
            border: 8px solid #1e3a8a; /* Royal Blue */
            padding: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          
          .tc-inner-border {
             border: 2px solid #b91c1c; /* Deep Red */
             padding: 40px;
             height: 100%;
             position: relative;
          }
          
          .tc-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.06;
            width: 550px;
            height: 550px;
            background-image: url('/images/logo_circular.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            z-index: 1;
          }
          
          .tc-content-z {
            position: relative;
            z-index: 10;
          }

          .tc-label {
             white-space: nowrap;
             min-width: 180px;
             font-weight: bold;
             color: #111;
          }
          
          .tc-field {
             display: flex;
             align-items: flex-end;
             margin-bottom: 12px;
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
            <div className="tc-watermark"></div>
            
            <div className="tc-content-z">
               {/* TOP HEADERS */}
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>बुक नं० (Book No.) <InputLine name="bookNo" value={formData.bookNo} onChange={handleChange} width="80px" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>U-DISE <InputLine name="udise" value={formData.udise} onChange={handleChange} width="140px" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>PEN <InputLine name="pen" value={formData.pen} onChange={handleChange} width="140px" /></div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '10px' }}>
                  <div></div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '6px' }}>Recognition Number: <InputLine name="recognitionNo" value={formData.recognitionNo} onChange={handleChange} width="100px" /></div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>क्रमांक टी.सी. (TC No.): <InputLine name="tcNo" value={formData.tcNo} onChange={handleChange} width="100px" /></div>
                  </div>
               </div>

               {/* MAIN TITLE & LOGO */}
               <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                     <img src="/images/logo_circular.png" style={{ width: '90px', height: '90px' }} alt="Logo" />
                     <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#444' }}>नाम संस्था:</div>
                        <h1 style={{ margin: 0, color: '#b91c1c', fontSize: '38px', fontFamily: "'Arial Black', Impact, sans-serif", letterSpacing: '1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>M.N. PUBLIC SCHOOL</h1>
                        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14.5px', color: '#1e3a8a' }}>HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA</p>
                     </div>
                  </div>
                  <div style={{ background: '#1e3a8a', color: 'white', display: 'inline-block', padding: '8px 35px', borderRadius: '4px', marginTop: '25px', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                     लीविंग सर्टिफिकेट बेसिक शिक्षा परिषद
                  </div>
               </div>

               {/* 2 COLUMN GRID */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '15px' }}>
                  
                  {/* LEFT COLUMN */}
                  <div>
                     <div className="tc-field"><div className="tc-label">विद्यार्थी का पेन नं० [PEN No]:</div> <InputLine name="pen" value={formData.pen} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">1. नाम विद्यार्थी:</div> <InputLine name="studentName" value={formData.studentName} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '12px' }}>
                        <div className="tc-label">2. जन्म तिथि:</div>
                        <div className="tc-field" style={{ paddingLeft: '20px' }}><div className="tc-label" style={{ minWidth: '90px' }}>शब्दों में:</div> <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '90px' }}>अंकों में:</div> <InputLine name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">3. माता का नाम श्रीमती:</div> <InputLine name="motherName" value={formData.motherName} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">4. पिता का नाम श्री:</div> <InputLine name="fatherName" value={formData.fatherName} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">5. जाति / धर्म:</div> <InputLine name="casteReligion" value={formData.casteReligion} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '12px' }}>
                        <div className="tc-field"><div className="tc-label">6. निवास मोहल्ला ग्राम० पोस्ट:</div> <InputLine name="residenceMohalla" value={formData.residenceMohalla} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '90px' }}>तहसील व जिला:</div> <InputLine name="tehsilDistrict" value={formData.tehsilDistrict} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">7. उ० प्र० में रहने का समय:</div> <InputLine name="residenceUp" value={formData.residenceUp} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '12px' }}>
                        <div className="tc-field"><div className="tc-label">8. स्कूल में प्रथम प्रवेश तिथि:</div> <InputLine name="firstAdmissionDate" value={formData.firstAdmissionDate} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '135px' }}>नम्बर प्रवेश रजिस्टर:</div> <InputLine name="admissionRegisterNo" value={formData.admissionRegisterNo} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">9. स्कूल छोड़ने की तिथि:</div> <InputLine name="dateOfLeaving" value={formData.dateOfLeaving} onChange={handleChange} /></div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div>
                     <div className="tc-field"><div className="tc-label">अपार आई डी - :</div> <InputLine name="apaarId" value={formData.apaarId} onChange={handleChange} /></div>
                     
                     <div className="tc-field"><div className="tc-label">10. नाम कटने की तिथि:</div> <InputLine name="dateOfStrikingOff" value={formData.dateOfStrikingOff} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">11. नाम कटने का कारण:</div> <InputLine name="reasonForStrikingOff" value={formData.reasonForStrikingOff} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">12. चाल-चलन:</div> <InputLine name="character" value={formData.character} onChange={handleChange} /></div>
                     
                     <div style={{ marginBottom: '12px' }}>
                        <div className="tc-field"><div className="tc-label">13. कौन-सी उच्च परीक्षा पास की:</div> <InputLine name="higherExamPassed" value={formData.higherExamPassed} onChange={handleChange} /></div>
                        <div className="tc-field" style={{ paddingLeft: '20px', marginBottom: '0' }}><div className="tc-label" style={{ minWidth: '90px' }}>व तिथि:</div> <InputLine name="higherExamDate" value={formData.higherExamDate} onChange={handleChange} /></div>
                     </div>

                     <div className="tc-field"><div className="tc-label">14. नाम कक्षा जिससे खारिज:</div> <InputLine name="classRemovedFrom" value={formData.classRemovedFrom} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">15. विद्यार्थी की भाषा (हिन्दी/उर्दू):</div> <InputLine name="studentLanguage" value={formData.studentLanguage} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">16. पेशा:</div> <InputLine name="occupation" value={formData.occupation} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">17. अन्य:</div> <InputLine name="other" value={formData.other} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">18. छात्र का आधार नं०:</div> <InputLine name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">19. कक्षा के अनुसार स्थिति:</div> <InputLine name="statusByClass" value={formData.statusByClass} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">20. स्कूल कितने दिन खुला:</div> <InputLine name="schoolOpenDays" value={formData.schoolOpenDays} onChange={handleChange} /></div>
                     <div className="tc-field"><div className="tc-label">21. उपस्थिति के दिन:</div> <InputLine name="presentDays" value={formData.presentDays} onChange={handleChange} /></div>
                  </div>

               </div>

               {/* FOOTER */}
               <div style={{ marginTop: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '15px' }}>
                        <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>लिखने की तिथि</div> 
                        <InputLine name="writingDate" value={formData.writingDate} onChange={handleChange} width="40px" /> 
                        <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>माह</div> 
                        <InputLine name="writingMonth" value={formData.writingMonth} onChange={handleChange} width="40px" /> 
                        <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>सन् 20</div> 
                        <InputLine name="writingYear" value={formData.writingYear} onChange={handleChange} width="40px" />
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
                        <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>पाठशाला मोहल्ला</div> 
                        <InputLine name="schoolMohalla" value={formData.schoolMohalla} onChange={handleChange} width="220px" />
                     </div>

                     <div style={{ border: '2px solid #000', padding: '15px', marginTop: '40px', fontSize: '13px', lineHeight: '1.6', width: '380px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
                        <strong>(1)</strong> चाल-चलन संक्षिप्त शब्दों में लिखना चाहिए<br/>
                        <strong>(2)</strong> सर्टिफिकेट की सब पूर्ति प्रवेश रजिस्टर के अनुसार हो ।
                     </div>
                  </div>

                  <div style={{ textAlign: 'center', width: '250px' }}>
                     <div style={{ borderBottom: '1.5px solid #000', height: '40px', marginBottom: '10px' }}></div>
                     <div style={{ fontWeight: 'bold', fontSize: '18px' }}>हस्ताक्षर प्रधानाध्यापक</div>
                     <div style={{ fontSize: '13px', color: '#444' }}>(Seal / Stamp)</div>
                  </div>
               </div>
               
            </div>
         </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
