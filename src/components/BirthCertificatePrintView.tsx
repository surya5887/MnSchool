import React, { useState } from 'react';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface BCProps {
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
    className="cert-editable"
    style={{
      background: 'transparent',
      border: 'none',
      borderBottom: '1.5px dotted #000',
      outline: 'none',
      width: width,
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      padding: '0 4px',
      fontFamily: 'inherit',
      display: 'inline-block'
    }}
  />
);

const BirthCertificatePrintView: React.FC<BCProps> = ({ student, className, onClose }) => {
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    admissionNumber: student.admissionNo || '',
    dobWords: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const fatherName = student.parentName || student.fatherName || '';
  const motherName = student.motherName || '';
  
  // Format DOB from YYYY-MM-DD to DD-MM-YYYY
  let dob = '___________';
  if (student.dob) {
     const p = student.dob.split('-');
     if (p.length === 3) {
       if (parseInt(p[0]) > 1000) dob = `${p[2]}-${p[1]}-${p[0]}`;
       else dob = student.dob;
     }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      {/* Action Bar (Hidden when printing) */}
      <div className="print-hide" style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '24px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Issue Date:</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Printer size={20} /> Print Certificate
          </button>
        </div>
      </div>

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
            body { background: white; margin: 0; padding: 0; }
            .certificate-container { margin: 0 auto !important; box-shadow: none !important; width: 100% !important; padding: 20px !important; }
            input.cert-editable { border-color: transparent !important; }
            input.cert-editable[value=""] { border-bottom: 1.5px dotted #000 !important; }
            @page { margin: 1cm; size: A4 portrait; }
          }
          .certificate-container {
            width: 210mm;
            min-height: 297mm;
            margin: 2rem auto;
            background: white;
            padding: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
            border: 8px solid #1e3a8a;
          }
          .cert-inner-border {
            border: 2px solid #b91c1c;
            padding: 40px 50px;
            height: calc(100% - 4px);
            box-sizing: border-box;
            position: relative;
          }
          .cert-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            width: 550px;
            height: 550px;
            background-image: url('/images/logo_circular.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            z-index: 1;
          }
          .cert-content {
            position: relative;
            z-index: 10;
          }
        `}
      </style>

      {/* A4 Print Area */}
      <div className="certificate-container">
        <div className="cert-inner-border">
          <div className="cert-watermark"></div>
          
          <div className="cert-content">
             {/* Header */}
             <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                   <img src="/images/logo_circular.png" style={{ width: '100px', height: '100px' }} alt="Logo Left" />
                   <div style={{ textAlign: 'center' }}>
                      <h1 style={{ margin: 0, color: '#b91c1c', fontSize: '42px', fontFamily: "'Arial Black', Impact, sans-serif", letterSpacing: '1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>M.N. PUBLIC SCHOOL</h1>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a' }}>HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#444' }}>Affiliated to CBSE, New Delhi</p>
                   </div>
                   <img src="/images/logo_circular.png" style={{ width: '100px', height: '100px' }} alt="Logo Right" />
                </div>
                <div style={{ background: '#1e3a8a', color: 'white', display: 'inline-block', padding: '10px 40px', borderRadius: '4px', marginTop: '30px', fontSize: '26px', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                   DATE OF BIRTH CERTIFICATE
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '15px', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Admission No: &nbsp;<InputLine name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} width="120px" /></div>
                <div>Date: {formData.issueDate.split('-').reverse().join('-')}</div>
             </div>

             <div style={{ fontSize: '20px', lineHeight: '2.5', textAlign: 'justify', marginTop: '20px', textIndent: '50px' }}>
                <p style={{ margin: '0 0 20px 0' }}>
                   This is to certify from the school records that <strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>, 
                   son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
                   Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this school.
                </p>
                <p style={{ margin: '0 0 20px 0', textIndent: '0' }}>
                   His/Her Date of Birth according to the Admission Register of the school is <strong style={{ fontSize: '22px' }}>{dob}</strong> 
                   <br/> (in words: <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" />).
                </p>
                <p style={{ margin: '0 0 20px 0', textIndent: '0' }}>
                   He/She is/was studying in Class <strong>{className}</strong> at the time of issuing this certificate.
                </p>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '120px', alignItems: 'flex-end', fontSize: '16px', fontWeight: 'bold' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                   <div style={{ borderBottom: '1.5px solid #000', height: '40px', marginBottom: '10px' }}></div>
                   <div style={{ fontSize: '16px' }}>Prepared By</div>
                </div>
                
                <div style={{ textAlign: 'center', width: '200px' }}>
                   <div style={{ borderBottom: '1.5px solid #000', height: '40px', marginBottom: '10px' }}></div>
                   <div style={{ fontSize: '16px' }}>Checked By</div>
                </div>

                <div style={{ textAlign: 'center', width: '250px' }}>
                   <div style={{ borderBottom: '1.5px solid #000', height: '40px', marginBottom: '10px' }}></div>
                   <div style={{ fontSize: '18px' }}>Signature of Principal</div>
                   <div style={{ fontSize: '13px', color: '#444' }}>(Seal / Stamp)</div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthCertificatePrintView;
