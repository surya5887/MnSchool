import React, { useState } from 'react';
import type { StudentData } from '../services/studentService';
import { ArrowLeft, Printer } from 'lucide-react';

interface CCProps {
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

const CharacterCertificatePrintView: React.FC<CCProps> = ({ student, className, onClose }) => {
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    character: 'GOOD',
    session: '2026-2027'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const fatherName = student.fatherName || '';
  const motherName = student.motherName || '';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      {/* Action Bar (Hidden when printing) */}
      <div className="print-hide" style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn-secondary" onClick={onClose}>
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '24px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Issue Date:</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="glass-input" style={{ padding: '8px' }} />
          </div>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={20} /> Print Certificate
          </button>
        </div>
      </div>

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
            body { background: white; margin: 0; padding: 0; }
            @page { margin: 1cm; size: A4 portrait; }
          }
          .certificate-container {
            width: 210mm;
            min-height: 297mm;
            margin: 2rem auto;
            background: white;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
          }
          .cert-border {
            border: 4px double #1a365d;
            padding: 40px;
            height: 100%;
            box-sizing: border-box;
            position: relative;
          }
        `}
      </style>

      {/* A4 Print Area */}
      <div className="certificate-container">
        <div className="cert-border">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #1a365d', paddingBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#1a365d', textTransform: 'uppercase', letterSpacing: '2px' }}>
              M.N. PUBLIC SCHOOL
            </h1>
            <p style={{ margin: '8px 0', fontSize: '16px' }}>Affiliated to CBSE, New Delhi</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#4a5568' }}>School Code: 12345 | Affiliation No: 67890</p>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '28px', margin: '40px 0', textDecoration: 'underline', fontStyle: 'italic', color: '#2d3748' }}>
            CHARACTER CERTIFICATE
          </h2>

          <div style={{ fontSize: '18px', lineHeight: '2.4', textAlign: 'justify', marginTop: '40px' }}>
            <p>
              This is to certify that <strong style={{ textTransform: 'uppercase' }}>{name}</strong>, 
              son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
              Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this institution.
            </p>
            <p>
              He/She has passed / is studying in Class <strong>{className}</strong> during the academic session 
              <InputLine name="session" value={formData.session} onChange={handleChange} width="120px" />.
            </p>
            <p>
              To the best of my knowledge and belief, he/she bears a 
              <InputLine name="character" value={formData.character} onChange={handleChange} width="150px" /> moral character.
            </p>
            <p style={{ marginTop: '20px' }}>
              I wish him/her all success in his/her future endeavors.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '120px', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: '0 0 8px 0' }}>Date: <strong>{formData.issueDate.split('-').reverse().join('-')}</strong></p>
              <p style={{ margin: 0 }}>Place: _______________</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Principal's Signature</p>
              <p style={{ margin: 0, fontSize: '12px' }}>(with school seal)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCertificatePrintView;
