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
    serialNo: '',
    udise: '',
    pen: '',
    studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
    dobWords: '',
    dobNumbers: student.dob || '',
    motherName: '',
    fatherName: student.parentName || '',
    caste: '',
    address: '',
    tehsilDistrict: '',
    residenceUp: 'जन्म से',
    initialAdmissionDate: '',
    initialAdmissionNo: '',
    lastAdmissionDate: '',
    lastAdmissionNo: student.admissionNo || '',
    leavingDate: new Date().toISOString().split('T')[0].split('-').reverse().join('-'),
    leavingReason: '',
    character: 'अच्छा',
    examPassed: '',
    classLeft: className,
    language: 'हिन्दी',
    occupation: '',
    other: '',
    aadharNo: student.nationalIdNumber || '',
    writingDate: new Date().getDate().toString().padStart(2, '0'),
    writingMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    writingYear: new Date().getFullYear().toString(),
    schoolAddress: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '16px' }}>
      
      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto 16px auto', background: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
          Type manually or leave blank for pen fill.
        </div>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print Now
        </button>
      </div>

      <div className="report-card-container">
        <div className="report-card-page" style={{ 
          padding: '24px 32px', 
          background: '#ebefc8', 
          color: '#000', 
          fontFamily: "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', Arial, sans-serif",
          maxWidth: '800px',
          margin: '0 auto 24px auto',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          WebkitPrintColorAdjust: 'exact',
          colorAdjust: 'exact'
        }}>
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
               <div>बुक नं० <InputLine name="bookNo" value={formData.bookNo} onChange={handleChange} width="80px" /></div>
               <div>क्रमांक <InputLine name="serialNo" value={formData.serialNo} onChange={handleChange} width="80px" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '15px', fontWeight: 'bold', marginTop: '-4px' }}>
               <span>U-DISE <InputLine name="udise" value={formData.udise} onChange={handleChange} width="130px" /></span>
               <span>PEN <InputLine name="pen" value={formData.pen} onChange={handleChange} width="130px" /></span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 'bold' }}>
               नाम संस्था- <InputLine name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} width="calc(100% - 85px)" />
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '6px 0', marginBottom: '24px' }}>
            <h1 style={{ margin: '0', fontSize: '26px', letterSpacing: '0.5px' }}>लीविंग सर्टीफिकेट बेसिक शिक्षा परिषद</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', fontSize: '15px', lineHeight: '1.7' }}>
            
            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '22px' }}>1.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>नाम विद्यार्थी</span> <InputLine name="studentName" value={formData.studentName} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>2.</span>
                <span style={{ width: '68px' }}>जन्म तिथि</span>
                <div style={{ flex: 1, paddingLeft: '8px', borderLeft: '1.5px solid #000' }}>
                  <div style={{ display: 'flex' }}><span style={{ minWidth: '60px' }}>शब्दों में</span> <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} /></div>
                  <div style={{ display: 'flex', marginTop: '6px' }}><span style={{ minWidth: '60px' }}>अंकों में</span> <InputLine name="dobNumbers" value={formData.dobNumbers} onChange={handleChange} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>3.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>माता का नाम</span> <InputLine name="motherName" value={formData.motherName} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>4.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>पिता का नाम</span> <InputLine name="fatherName" value={formData.fatherName} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>5.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>जाति (धर्म)</span> <InputLine name="caste" value={formData.caste} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
                <span style={{ width: '22px' }}>6.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>निवास मोहल्ला</span> <InputLine name="address" value={formData.address} onChange={handleChange} /></div>
              </div>
              <div style={{ paddingLeft: '22px', display: 'flex' }}>
                <span style={{ whiteSpace: 'nowrap' }}>तहसील व जिला</span> <InputLine name="tehsilDistrict" value={formData.tehsilDistrict} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>7.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>निवास उ०.प्र०</span> <InputLine name="residenceUp" value={formData.residenceUp} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>8.</span>
                <div style={{ flex: 1, paddingLeft: '8px', borderLeft: '1.5px solid #000' }}>
                  <div style={{ display: 'flex' }}><span style={{ minWidth: '135px' }}>प्रवेश तिथि प्रारम्भिक</span> <InputLine name="initialAdmissionDate" value={formData.initialAdmissionDate} onChange={handleChange} /></div>
                  <div style={{ display: 'flex', marginTop: '6px' }}><span style={{ minWidth: '135px' }}>नम्बर प्रवेश तिथि</span> <InputLine name="initialAdmissionNo" value={formData.initialAdmissionNo} onChange={handleChange} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '22px' }}>9.</span>
                <div style={{ flex: 1, paddingLeft: '8px', borderLeft: '1.5px solid #000' }}>
                  <div style={{ display: 'flex' }}><span style={{ minWidth: '135px' }}>अन्तिम प्रवेश तिथि</span> <InputLine name="lastAdmissionDate" value={formData.lastAdmissionDate} onChange={handleChange} /></div>
                  <div style={{ display: 'flex', marginTop: '6px' }}><span style={{ minWidth: '135px' }}>नम्बर प्रवेश रजिस्टर</span> <InputLine name="lastAdmissionNo" value={formData.lastAdmissionNo} onChange={handleChange} /></div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '28px' }}>10.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>नाम कटने की तिथि</span> <InputLine name="leavingDate" value={formData.leavingDate} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>11.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>नाम कटने का कारण</span> <InputLine name="leavingReason" value={formData.leavingReason} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>12.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>चाल-चलन</span> <InputLine name="character" value={formData.character} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>13.</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>कौन-सी उच्च परीक्षा पास की</span> <InputLine name="examPassed" value={formData.examPassed} onChange={handleChange} /></div>
                  <div style={{ display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>मय तिथि सन्</span> <InputLine name="examPassedDate" value={''} onChange={()=>{}} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>14.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>नाम कक्षा जिससे खारिज</span> <InputLine name="classLeft" value={formData.classLeft} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>15.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>विद्यार्थी की भाषा (हिन्दी/उर्दू)</span> <InputLine name="language" value={formData.language} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>16.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>पेशा</span> <InputLine name="occupation" value={formData.occupation} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>17.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>अन्य</span> <InputLine name="other" value={formData.other} onChange={handleChange} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '28px' }}>18.</span>
                <div style={{ flex: 1, display: 'flex' }}><span style={{ whiteSpace: 'nowrap' }}>छात्र का आधार नं०</span> <InputLine name="aadharNo" value={formData.aadharNo} onChange={handleChange} /></div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '28px', borderTop: '2px solid #000', paddingTop: '16px', fontSize: '15px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
               <div style={{ flex: 1, display: 'flex' }}>लिखने की तिथि <InputLine name="writingDate" value={formData.writingDate} onChange={handleChange} width="40px" /> माह <InputLine name="writingMonth" value={formData.writingMonth} onChange={handleChange} width="40px" /> सन् 20 <InputLine name="writingYear" value={formData.writingYear.substring(2)} onChange={handleChange} width="40px" /></div>
            </div>
            <div style={{ display: 'flex' }}>
               <div style={{ whiteSpace: 'nowrap' }}>पाठशाला मौहल्ला</div>
               <InputLine name="schoolAddress2" value={formData.schoolAddress} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '14px' }}>
             
             <div style={{ flex: 1, lineHeight: '2' }}>
                (1) चाल-चलन संक्षिप्त शब्दों में लिखना चाहिए<br/>
                (2) सर्टीफिकेट की सब पूर्ति प्रवेश रजिस्टर के अनुसार हो ।<br/>
                (3) खाना नं० 9 केवल पुनः प्रवेश छात्र का भरा जायेगा ।
             </div>

             <div style={{ width: '220px', textAlign: 'center', alignSelf: 'flex-end' }}>
                <InputLine name="signature" value={''} onChange={()=>{}} width="100%" /><br/>
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>हस्ताक्षर प्रधानाध्यापक</span><br/>
                <span style={{ color: '#666', fontSize: '11px' }}>(Seal / Stamp)</span>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;