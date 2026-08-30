import React from 'react';
import type { StudentData } from '../services/studentService';
import type { TransactionData } from '../services/financeService';

interface FeeReceiptPrintViewProps {
  student: StudentData;
  transaction: TransactionData;
  classNameStr: string;
}

const numToWords = (amount: number): string => {
  // Very basic number to words for demonstration (in real app, use a dedicated library if needed, but for ? amounts this simple one works for common fees)
  // To keep it simple, we'll just say "Rupees {amount} Only" for now. A full Indian numbering converter can be added later.
  return `Rupees ${amount.toLocaleString('en-IN')} Only`;
};

const FeeReceiptPrintView: React.FC<FeeReceiptPrintViewProps> = ({ student, transaction, classNameStr }) => {
  return (
    <div className="fee-receipt-container" style={{
      width: '210mm',
      minHeight: '148mm', // A5 landscape or Half A4
      padding: '20px',
      margin: '0 auto',
      background: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 9999,
      boxSizing: 'border-box',
      border: '1px solid #ccc' // Useful for preview, hidden in print if we set border: none in @media
    }}>
      {/* School Header */}
      <div style={{ display: 'flex', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>LOGO</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase' }}>MN PUBLIC SCHOOL</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Affiliated to CBSE | ISO Certified 9001:2015</p>
          <p style={{ margin: 0, fontSize: '12px' }}>123 Education Road, City Name, State - 123456 | Ph: +91 9876543210</p>
        </div>
        <div style={{ width: '80px' }}></div> {/* Spacer for balance */}
      </div>

      <h2 style={{ textAlign: 'center', textDecoration: 'underline', margin: '0 0 20px 0', fontSize: '18px' }}>FEE RECEIPT</h2>

      {/* Receipt Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '14px' }}>
        <div>
          <p style={{ margin: '5px 0' }}><strong>Receipt No:</strong> {transaction.id?.substring(0, 8).toUpperCase()}</p>
          <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString('en-IN')}</p>
          <p style={{ margin: '5px 0' }}><strong>Student Name:</strong> {student.firstName} {student.lastName}</p>
          <p style={{ margin: '5px 0' }}><strong>Father's Name:</strong> {student.parentName || 'N/A'}</p>
        </div>
        <div>
          <p style={{ margin: '5px 0' }}><strong>Class:</strong> {classNameStr}</p>
          <p style={{ margin: '5px 0' }}><strong>Roll No:</strong> {student.rollNumber || 'N/A'}</p>
          <p style={{ margin: '5px 0' }}><strong>Admission No:</strong> {student.admissionNo || 'N/A'}</p>
          <p style={{ margin: '5px 0' }}><strong>Payment Mode:</strong> {transaction.paymentMethod || 'Cash'}</p>
        </div>
      </div>

      {/* Fee Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>S.No</th>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>Particulars</th>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>Amount (Rs)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>1</td>
            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>{transaction.description || 'Fee Payment'}</td>
            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>{transaction.amount.toLocaleString('en-IN')}.00</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total Received</td>
            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{transaction.amount.toLocaleString('en-IN')}.00</td>
          </tr>
        </tbody>
      </table>

      {/* Words and Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '14px' }}>
        <div>
          <p style={{ margin: '0 0 10px 0' }}><strong>Amount in words:</strong> {numToWords(transaction.amount)}</p>
          <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic' }}>* This is a computer generated receipt.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ margin: '0 0 30px 0' }}>_________________________</p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default FeeReceiptPrintView;
