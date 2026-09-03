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
  const fatherName = student.fatherName || '';
  const motherName = student.motherName || '';
  const dob = student.dateOfBirth ? student.dateOfBirth.split('-').reverse().join('-') : '___________';

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
            border: 4px solid #1a365d;
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
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#1a365d', textTransform: 'uppercase', letterSpacing: '2px' }}>
              M.N. PUBLIC SCHOOL
            </h1>
            <p style={{ margin: '8px 0', fontSize: '16px' }}>Affiliated to CBSE, New Delhi</p>
            <div style={{ borderBottom: '2px solid #1a365d', margin: '20px auto', width: '80%' }}></div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '24px', margin: '30px 0', textDecoration: 'underline', color: '#2d3748' }}>
            DATE OF BIRTH CERTIFICATE
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>Admission No: <strong><InputLine name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} width="100px" /></strong></p>
            <p style={{ margin: 0, fontSize: '16px' }}>Date: <strong>{formData.issueDate.split('-').reverse().join('-')}</strong></p>
          </div>

          <div style={{ fontSize: '18px', lineHeight: '2.4', textAlign: 'justify' }}>
            <p>
              This is to certify from the school records that <strong style={{ textTransform: 'uppercase' }}>{name}</strong>, 
              son/daughter of Shri <strong style={{ textTransform: 'uppercase' }}>{fatherName}</strong> and 
              Smt. <strong style={{ textTransform: 'uppercase' }}>{motherName}</strong> is/was a bonafide student of this school.
            </p>
            <p>
              His/Her Date of Birth according to the Admission Register of the school is <strong>{dob}</strong> 
              <br/> (in words: <InputLine name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" />).
            </p>
            <p>
              He/She is/was studying in Class <strong>{className}</strong> at the time of issuing this certificate.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '150px', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Prepared By</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Checked By</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Principal's Signature</p>
              <p style={{ margin: 0, fontSize: '12px' }}>(with seal)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthCertificatePrintView;
