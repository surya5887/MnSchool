import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface CCProps {
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

const CharacterCertificatePrintView: React.FC<CCProps> = ({ student, className, onClose }) => {
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  useEffect(() => {
    getSchoolSettings().then(set => {
      if(set) setSettings(set);
    });
  }, []);

  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    character: 'GOOD',
    session: '2026-2027',
    dobWords: '',
    admissionNumber: '',
    place: 'HARSOLI'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const dob = student.dateOfBirth ? student.dateOfBirth.split('-').reverse().join('-') : '';
  const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const fatherName = student.parentName || student.fatherName || '';
  const motherName = student.motherName || '';

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      {/* Action Bar */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: '950px', margin: '20px auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Issue Date:</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Printer size={18} /> Print Certificate
          </button>
        </div>
      </div>

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
              .tc-inner-border { padding: 15px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
              .cc-inner-border, .bc-inner-border { padding: 50px 40px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
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
               margin-bottom: 6px;
            }
            
            .tc-label, .cc-label, .bc-label {
               font-weight: bold;
               white-space: nowrap;
               margin-right: 8px;
            }
          `}
        </style>

      {/* A4 Print Area */}
      <div className="cc-container">
        <div className="cc-inner-border">
          <img className="cc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="Watermark" style={{ objectFit: "contain" }} />
          
          <div className="cc-content-z">
             {/* Header */}
             <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                       <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: '90px', height: '90px' }} alt="Logo" />
                       <div style={{ textAlign: 'left' }}>
                      <h1 style={{ margin: 0, color: '#b91c1c', fontSize: '26px', fontFamily: "'Arial Black', Impact, sans-serif", letterSpacing: '1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a' }}>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#444' }}>Affiliated to CBSE, New Delhi</p>
                   </div>
                   
                </div>
                <div style={{ background: '#1e3a8a', color: 'white', display: 'inline-block', padding: '10px 40px', borderRadius: '4px', marginTop: '15px', fontSize: '26px', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
                   CHARACTER CERTIFICATE
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '15px', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Admission No. <input name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className="tc-dotted-input" style={{ width: '120px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', textAlign: 'center', fontFamily: 'inherit', marginLeft: '10px' }} /></div>
                <div>Date: {formData.issueDate.split('-').reverse().join('-')}</div>
             </div>

             <div style={{ fontSize: '20px', lineHeight: '2.5', textAlign: 'justify', marginTop: '20px' }}>
                <p style={{ margin: '0 0 20px 0', textIndent: '0' }}>
                   This is to certify that <strong style={{ textTransform: 'uppercase', color: '#b91c1c' }}>{name}</strong>, 
                   son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
                   Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this institution.
                </p>
                <p style={{ margin: '0 0 20px 0' }}>
                   His/Her Date of Birth according to the Admission Register of the school is <strong style={{ fontSize: '22px' }}>{dob}</strong> 
                   (in words: <input name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" className="tc-dotted-input" style={{ width: '450px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', textAlign: 'left', fontFamily: 'inherit' }} />).
                </p>
                <p style={{ margin: '0 0 20px 0', textIndent: '0' }}>
                   He/She has passed / is studying in Class <strong style={{ margin: '0 6px' }}>{className}</strong> during the academic session 
                   <input name="session" value={formData.session} onChange={handleChange} className="tc-dotted-input" style={{ width: '130px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '20px', padding: '0 4px', textAlign: 'center', fontFamily: 'inherit' }} />.
                </p>
                <p style={{ margin: '0 0 20px 0', textIndent: '0' }}>
                   To the best of my knowledge and belief, he/she bears a 
                   <input name="character" value={formData.character} onChange={handleChange} className="tc-dotted-input" style={{ width: '150px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '20px', padding: '0 4px', textAlign: 'center', marginLeft: '8px', marginRight: '8px' }} /> moral character. He/She has not taken part in any activity subversive to the rules of the school.
                </p>
                <p style={{ margin: '0', textAlign: 'center', marginTop: '60px', fontStyle: 'italic', fontWeight: 'bold', color: '#1e3a8a', fontSize: '22px' }}>
                   I wish him/her all success in his/her future endeavors.
                </p>
             </div>

             <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '16px', fontWeight: 'bold' }}>
                      <div style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>Place:</div> 
                      <input name="place" value={formData.place} onChange={handleChange} className="tc-dotted-input" style={{ width: '200px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', textAlign: 'left', fontFamily: 'inherit' }} placeholder="City/Town" /> 
                   </div>
                   <div style={{ width: '250px', borderBottom: '1.5px solid #000' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
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

export default CharacterCertificatePrintView;
