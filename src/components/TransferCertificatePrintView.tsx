import React, { useState } from 'react';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface TCProps {
  student: StudentData;
  className: string;
  section: string;
  onClose: () => void;
}

const TransferCertificatePrintView: React.FC<TCProps> = ({ student, className, onClose }) => {
  // State for all manual fields, pre-filled where possible
  const [formData, setFormData] = useState({
    bookNo: '',
    serialNo: '',
    udise: '0908050...', // Placeholder
    pen: '230476...', // Placeholder
    studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
    dobWords: '',
    dobNumbers: student.dob || '',
    motherName: '',
    fatherName: student.parentName || '',
    caste: '',
    address: '',
    tehsilDistrict: '',
    residenceUp: '???? ??',
    initialAdmissionDate: '',
    initialAdmissionNo: '',
    lastAdmissionDate: '',
    lastAdmissionNo: student.admissionNo || '',
    leavingDate: new Date().toISOString().split('T')[0].split('-').reverse().join('-'), // DD-MM-YYYY
    leavingReason: '',
    character: '?????',
    examPassed: '',
    classLeft: className,
    language: '??????',
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

  const InputLine = ({ name, value, width = '100%', placeholder = '' }: { name: string, value: string, width?: string, placeholder?: string }) => (
    <input 
      type="text" 
      name={name} 
      value={value} 
      onChange={handleChange} 
      placeholder={placeholder}
      className="tc-input"
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: '1.5px dotted #000',
        outline: 'none',
        width: width,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        padding: '0 8px',
        fontFamily: 'inherit',
        display: 'inline-block'
      }}
    />
  );

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
      
      {/* TOOLBAR */}
      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          You can click on the dotted lines to manually type and edit the details before printing.
        </div>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print Now
        </button>
      </div>

      {/* TC PAPER DOCUMENT */}
      <div className="report-card-container">
        <div className="report-card-page" style={{ 
          padding: '40px', 
          background: '#ebefc8', // Classic Yellowish-Green TC paper color
          color: '#000', 
          fontFamily: "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', Arial, sans-serif",
          maxWidth: '900px',
          margin: '0 auto 32px auto',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          minHeight: '1100px',
          WebkitPrintColorAdjust: 'exact',
          colorAdjust: 'exact'
        }}>
          
          {/* HEADER */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
               <div>??? ??? <InputLine name="bookNo" value={formData.bookNo} width="80px" /></div>
               <div>??????? <InputLine name="serialNo" value={formData.serialNo} width="80px" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '16px', fontWeight: 'bold', marginTop: '-10px' }}>
               <span>U-DISE <InputLine name="udise" value={formData.udise} width="150px" /></span>
               <span>PEN <InputLine name="pen" value={formData.pen} width="150px" /></span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '15px', fontWeight: 'bold' }}>
               ??? ??????- <InputLine name="schoolAddress" value={formData.schoolAddress} width="calc(100% - 85px)" placeholder="MN Public School..." />
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '10px 0', marginBottom: '30px' }}>
            <h1 style={{ margin: '0', fontSize: '32px', letterSpacing: '1px' }}>?????? ?????????? ????? ?????? ?????</h1>
          </div>

          {/* TWO COLUMN FORM GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '17px', lineHeight: '2' }}>
            
            {/* LEFT COLUMN */}
            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '25px' }}>1.</span>
                <div style={{ flex: 1 }}>??? ?????????? <InputLine name="studentName" value={formData.studentName} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '15px' }}>
                <span style={{ width: '25px' }}>2.</span>
                <span style={{ width: '75px' }}>???? ????</span>
                <div style={{ flex: 1, borderLeft: '2px solid #000', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '70px' }}>?????? ???</span> 
                    <InputLine name="dobWords" value={formData.dobWords} />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '70px' }}>????? ???</span> 
                    <InputLine name="dobNumbers" value={formData.dobNumbers} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '15px' }}>
                <span style={{ width: '25px' }}>3.</span>
                <div style={{ flex: 1 }}>???? ?? ??? <InputLine name="motherName" value={formData.motherName} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '25px' }}>4.</span>
                <div style={{ flex: 1 }}>???? ?? ??? <InputLine name="fatherName" value={formData.fatherName} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '25px' }}>5.</span>
                <div style={{ flex: 1 }}>???? (??? ?????? ?? ???? ????) <InputLine name="caste" value={formData.caste} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '25px' }}>6.</span>
                <div style={{ flex: 1 }}>????? ????? ??????? ???? <InputLine name="address" value={formData.address} /></div>
              </div>
              <div style={{ paddingLeft: '25px', display: 'flex' }}>
                ????? ? ???? <InputLine name="tehsilDistrict" value={formData.tehsilDistrict} />
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '25px' }}>7.</span>
                <div style={{ flex: 1 }}>????? ??.???? <InputLine name="residenceUp" value={formData.residenceUp} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '15px' }}>
                <span style={{ width: '25px' }}>8.</span>
                <div style={{ flex: 1, borderLeft: '2px solid #000', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '130px' }}>?????? ???? ??????????</span> 
                    <InputLine name="initialAdmissionDate" value={formData.initialAdmissionDate} />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '130px' }}>????? ?????? ????</span> 
                    <InputLine name="initialAdmissionNo" value={formData.initialAdmissionNo} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '15px' }}>
                <span style={{ width: '25px' }}>9.</span>
                <div style={{ flex: 1, borderLeft: '2px solid #000', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '130px' }}>?????? ?????? ????</span> 
                    <InputLine name="lastAdmissionDate" value={formData.lastAdmissionDate} />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ minWidth: '130px' }}>????? ?????? ???????</span> 
                    <InputLine name="lastAdmissionNo" value={formData.lastAdmissionNo} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '35px' }}>10.</span>
                <div style={{ flex: 1 }}>??? ???? ?? ???? <InputLine name="leavingDate" value={formData.leavingDate} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>11.</span>
                <div style={{ flex: 1 }}>??? ???? ?? ???? <InputLine name="leavingReason" value={formData.leavingReason} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>12.</span>
                <div style={{ flex: 1 }}>???-??? <InputLine name="character" value={formData.character} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>13.</span>
                <div style={{ flex: 1 }}>
                  ???-?? ???? ??????? ??? ?? <InputLine name="examPassed" value={formData.examPassed} />
                  ?? ???? ??? <InputLine name="examPassedDate" value="" />
                </div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>14.</span>
                <div style={{ flex: 1 }}>??? ????? ????? ????? ??? <InputLine name="classLeft" value={formData.classLeft} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>15.</span>
                <div style={{ flex: 1 }}>?????????? ?? ???? (?????? ?? ?????) <InputLine name="language" value={formData.language} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>16.</span>
                <div style={{ flex: 1 }}>???? <InputLine name="occupation" value={formData.occupation} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>17.</span>
                <div style={{ flex: 1 }}>???? <InputLine name="other" value={formData.other} /></div>
              </div>

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ width: '35px' }}>18.</span>
                <div style={{ flex: 1 }}>????? ?? ???? ??? <InputLine name="aadharNo" value={formData.aadharNo} /></div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '20px', fontSize: '17px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
               <div style={{ flex: 1 }}>????? ?? ???? <InputLine name="writingDate" value={formData.writingDate} width="40px" /> ??? <InputLine name="writingMonth" value={formData.writingMonth} width="40px" /> ??? 20 <InputLine name="writingYear" value={formData.writingYear.substring(2)} width="40px" /></div>
            </div>
            <div style={{ display: 'flex' }}>
               <div style={{ width: '130px' }}>??????? ???????</div>
               <div style={{ flex: 1 }}><InputLine name="schoolAddress2" value={formData.schoolAddress} /></div>
            </div>
          </div>

          {/* SIGNATURES & INSTRUCTIONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', fontSize: '15px' }}>
             
             <div style={{ flex: 1, lineHeight: '2.2' }}>
                (1) ???-??? ????????? ?????? ??? ????? ?????<br/>
                (2) ?????????? ?? ?? ?????? ?????? ??????? ?? ?????? ?? ?<br/>
                (3) ???? ??? 9 ???? ???? ?????? ????? ?? ??? ?????? ?
             </div>

             <div style={{ width: '250px', textAlign: 'center', alignSelf: 'flex-end' }}>
                <InputLine name="signature" value="" width="200px" /><br/>
                <span style={{ fontWeight: 'bold' }}>????????? ?????????????</span><br/>
                <InputLine name="headmasterName" value="" width="100%" placeholder="Seal / Stamp" />
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
