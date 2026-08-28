import React from 'react';
import type { StudentData } from '../services/studentService';
import type { ExamMarkData } from '../services/examService';
import { ArrowLeft, Printer } from 'lucide-react';

interface ReportCardProps {
  students: StudentData[];
  marks: ExamMarkData[];
  term: string;
  className: string;
  section: string;
  maxMarks: number;
  onClose: () => void;
}

const ReportCardPrintView: React.FC<ReportCardProps> = ({ students, marks, term, className, section, maxMarks, onClose }) => {
  const maxTheory = Math.round(maxMarks * 0.8);
  const maxPractical = Math.round(maxMarks * 0.2);

  const calculateGrade = (total: number, max: number) => {
    const percent = (total / max) * 100;
    if (percent >= 91) return 'A1';
    if (percent >= 81) return 'A2';
    if (percent >= 71) return 'B1';
    if (percent >= 61) return 'B2';
    if (percent >= 51) return 'C1';
    if (percent >= 41) return 'C2';
    if (percent >= 33) return 'D';
    return 'E';
  };

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="report-card-container">
        {students.map((student, idx) => {
          const studentMarks = marks.filter(m => m.studentId === student.id && m.examTerm === term);
          let grandTotal = 0;
          const totalMax = studentMarks.length * maxMarks;
          
          return (
            <div key={student.id} className="report-card-page" style={{ 
              pageBreakAfter: idx === students.length - 1 ? 'auto' : 'always', 
              padding: '40px', 
              background: 'white', 
              color: 'black', 
              fontFamily: 'Arial, sans-serif',
              maxWidth: '800px',
              margin: '0 auto 32px auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              minHeight: '1100px'
            }}>
              {/* School Header */}
              <div style={{ textAlign: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e3a8a', textTransform: 'uppercase' }}>MN Public School</h1>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4b5563' }}>Affiliated to CBSE, New Delhi | An English Medium Co-Educational School</p>
                <h2 style={{ margin: '15px 0 0 0', fontSize: '20px', textDecoration: 'underline' }}>ACADEMIC PERFORMANCE REPORT ({term})</h2>
                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Session 2026-2027</p>
              </div>

              {/* Student Details */}
              <table style={{ width: '100%', marginBottom: '30px', fontSize: '16px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', width: '20%', fontWeight: 'bold' }}>Student Name:</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{student.firstName} {student.lastName}</td>
                    <td style={{ padding: '8px', width: '20%', fontWeight: 'bold' }}>Roll No:</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{student.rollNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Class & Section:</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{className} - {section || 'A'}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Adm No:</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{student.admissionNo || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Marks Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #000' }} className="print-marks-table">
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
                    <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'left' }}>Subject</th>
                    <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>Theory<br/><small>(Max: {maxTheory})</small></th>
                    <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>Practical<br/><small>(Max: {maxPractical})</small></th>
                    <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>Total<br/><small>(Max: {maxMarks})</small></th>
                    <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', border: '1px solid #000' }}>No marks entered for this term.</td></tr>
                  ) : (
                    studentMarks.map((mark, i) => {
                      const subjTotal = mark.theoryMarks + mark.practicalMarks;
                      grandTotal += subjTotal;
                      return (
                        <tr key={i}>
                          <td style={{ border: '1px solid #000', padding: '12px' }}>{mark.subject}</td>
                          <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>{mark.theoryMarks}</td>
                          <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>{mark.practicalMarks}</td>
                          <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{subjTotal}</td>
                          <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{calculateGrade(subjTotal, maxMarks)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {studentMarks.length > 0 && (
                  <tfoot>
                    <tr style={{ backgroundColor: '#f3f4f6', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
                      <th colSpan={3} style={{ border: '1px solid #000', padding: '12px', textAlign: 'right' }}>GRAND TOTAL</th>
                      <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', fontSize: '18px' }}>{grandTotal} / {totalMax}</th>
                      <th style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}></th>
                    </tr>
                  </tfoot>
                )}
              </table>

              {/* Result Summary */}
              {studentMarks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', border: '2px solid #1e3a8a', borderRadius: '8px', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact', backgroundColor: '#eff6ff' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Percentage: <span style={{ color: '#1e3a8a' }}>{((grandTotal / totalMax) * 100).toFixed(2)}%</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Overall Grade: <span style={{ color: '#1e3a8a' }}>{calculateGrade(grandTotal, totalMax)}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Result: <span style={{ color: ((grandTotal / totalMax) * 100) >= 33 ? 'green' : 'red' }}>{((grandTotal / totalMax) * 100) >= 33 ? 'PASS' : 'FAIL'}</span>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>Class Teacher Signature</div>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>Principal Signature</div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportCardPrintView;
