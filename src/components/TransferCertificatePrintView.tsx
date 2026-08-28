import React, { useEffect } from 'react';
import type { StudentData } from '../services/studentService';

interface TCProps {
  student: StudentData;
  className: string;
  section: string;
  onClose: () => void;
}

const TransferCertificatePrintView: React.FC<TCProps> = ({ student, className, section, onClose }) => {

  useEffect(() => {
    setTimeout(() => {
      window.print();
      onClose();
    }, 500);
  }, [onClose]);

  return (
    <div className="report-card-container">
      <div className="report-card-page" style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
        
        {/* School Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e3a8a', textTransform: 'uppercase' }}>MN Public School</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4b5563' }}>Affiliated to CBSE, New Delhi | An English Medium Co-Educational School</p>
          <h2 style={{ margin: '20px 0 0 0', fontSize: '24px', textDecoration: 'underline' }}>TRANSFER CERTIFICATE</h2>
        </div>

        {/* TC Content */}
        <div style={{ lineHeight: '2.5', fontSize: '18px' }}>
          <p>
            This is to certify that Master/Miss <strong>{student.firstName} {student.lastName}</strong>, 
            Admission No. <strong>{student.admissionNo || '_______'}</strong>, 
            son/daughter of <strong>{student.parentName || '__________________'}</strong> 
            was reading in Class <strong>{className} {section}</strong> of this school.
          </p>
          <p>
            Date of Birth (as per register): <strong>{student.dob || '__________________'}</strong>
          </p>
          <p>
            He/She leaves the school on <strong>{new Date().toLocaleDateString()}</strong>.
          </p>
          <p>
            All dues towards the school have been cleared. We wish him/her all the best for future endeavors.
          </p>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '120px' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>Clerk Signature</div>
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>Principal Signature</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransferCertificatePrintView;
