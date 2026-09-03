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
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .preview-overlay {
            position: absolute !important;
            left: 0;
            top: 0;
            background: white !important;
            padding: 0 !important;
            width: 100%;
          }
          .preview-overlay * {
            visibility: visible;
          }
          .preview-toolbar {
            display: none !important;
          }
          .report-card-page {
            margin: 0 auto !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-after: always;
            padding: 20px !important;
          }
          /* To ensure colors print correctly in Chrome/Safari */
          .rc-table th, .rc-table td.label, .rc-profile td.label, .rc-grading-scale th {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        .rc-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #0f172a;
        }
        .rc-header {
          text-align: center;
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .rc-header h1 {
          font-size: 26px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0 0 5px 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .rc-header h3 {
          font-size: 15px;
          margin: 0 0 8px 0;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
        }
        .rc-header h2 {
          font-size: 16px;
          margin: 10px auto 10px auto;
          background: #e2e8f0;
          color: #0f172a;
          display: inline-block;
          padding: 6px 20px;
          border-radius: 4px;
          text-transform: uppercase;
          border: 1px solid #94a3b8;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .rc-header p {
          font-size: 12px;
          margin: 4px 0 0 0;
          color: #475569;
          font-weight: 500;
        }
        
        .rc-profile {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          border: 1px solid #64748b;
        }
        .rc-profile td {
          padding: 6px 12px;
          border: 1px solid #64748b;
          font-size: 13px;
        }
        .rc-profile td.label {
          background-color: #f8fafc;
          font-weight: 700;
          width: 20%;
          color: #1e293b;
        }
        .rc-profile td.val {
          font-weight: 600;
          color: #0f172a;
          text-transform: uppercase;
        }
        
        .rc-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          border: 2px solid #334155;
        }
        .rc-table th, .rc-table td {
          border: 1px solid #64748b;
          padding: 8px 10px;
          text-align: center;
          font-size: 13px;
        }
        .rc-table th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
        }
        .rc-table td.subj {
          text-align: left;
          font-weight: 700;
          color: #1e293b;
        }
        .rc-table tr.total-row td {
          font-weight: 800;
          background-color: #f8fafc;
        }
        .rc-table tr.perc-row td {
          font-weight: 800;
        }
        
        .rc-footer-info {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          border: 1px solid #64748b;
        }
        .rc-footer-info td {
          padding: 8px 12px;
          border: 1px solid #64748b;
          font-size: 13px;
          font-weight: 600;
        }
        .rc-footer-info td.label {
          width: 30%;
          background-color: #f8fafc;
        }
        
        .rc-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          padding: 0 20px;
          align-items: flex-end;
        }
        .rc-sig-block {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }
        .rc-sig-line {
          border-top: 1px solid #334155;
          width: 160px;
          margin-bottom: 8px;
        }
        
        .rc-grading-scale {
          margin-top: 40px;
          font-size: 11px;
          color: #475569;
        }
        .rc-grading-scale p {
          margin: 0 0 8px 0;
          font-weight: 600;
        }
        .rc-grading-scale table {
          width: 100%;
          border-collapse: collapse;
        }
        .rc-grading-scale th, .rc-grading-scale td {
          border: 1px solid #cbd5e1;
          padding: 4px;
          text-align: center;
        }
        .rc-grading-scale th {
          background-color: #f8fafc;
          font-weight: 700;
        }
      `}</style>

      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#1e3a8a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="report-card-container">
        {students.map((student, idx) => {
          const studentMarks = marks.filter(m => m.studentId === student.id && m.examTerm === term);
          let grandTotal = 0;
          const totalMax = studentMarks.length * maxMarks;
          const percentage = totalMax > 0 ? ((grandTotal / totalMax) * 100).toFixed(2) : '0.00';
          const overallGrade = calculateGrade(grandTotal, totalMax);
          const isPass = parseFloat(percentage) >= 33;
          
          return (
            <div key={student.id} className="report-card-page rc-container" style={{ 
              pageBreakAfter: idx === students.length - 1 ? 'auto' : 'always', 
              padding: '40px', 
              background: 'white', 
              maxWidth: '850px',
              margin: '0 auto 32px auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              minHeight: '1100px',
              position: 'relative'
            }}>
              {/* Header */}
              <div className="rc-header">
                <h1>MN PUBLIC SCHOOL</h1>
                <h3>Affiliated to CBSE | English Medium Co-Educational</h3>
                <p>Email - info@mnpublicschool.com &nbsp;&nbsp;|&nbsp;&nbsp; Mobile No. - +91 9999999999</p>
                <h2>REPORT CARD FOR CLASS {className.toUpperCase()}</h2>
                <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '10px' }}>ACADEMIC SESSION 2026-27</div>
              </div>

              {/* Student Profile */}
              <div style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '8px', fontSize: '14px' }}>Student Profile:</div>
              <table className="rc-profile">
                <tbody>
                  <tr>
                    <td className="label">Roll No.</td>
                    <td className="val" colSpan={2}>{student.rollNumber || '-'}</td>
                  </tr>
                  <tr>
                    <td className="label">Student's Name</td>
                    <td className="val" colSpan={2}>{student.firstName} {student.lastName}</td>
                  </tr>
                  <tr>
                    <td className="label">Father's Name</td>
                    <td className="val" colSpan={2}>{student.parentName || '-'}</td>
                  </tr>
                  <tr>
                    <td className="label">Mother's Name</td>
                    <td className="val" colSpan={2}>-</td>
                  </tr>
                  <tr>
                    <td className="label">Date of Birth</td>
                    <td className="val" colSpan={2}>{student.dob || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Scholastic Areas Table */}
              <table className="rc-table">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ textAlign: 'left', width: '25%' }}>Scholastic Areas</th>
                    <th colSpan={4}>Academic Year ({maxMarks} Marks)</th>
                  </tr>
                  <tr>
                    <th style={{ width: '15%' }}>Periodic Test ({maxPractical})</th>
                    <th style={{ width: '20%' }}>{term} ({maxTheory})</th>
                    <th style={{ width: '20%' }}>Marks Obtained ({maxMarks})</th>
                    <th style={{ width: '15%' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No marks entered for this term.</td></tr>
                  ) : (
                    studentMarks.map((mark, i) => {
                      const subjTotal = mark.theoryMarks + mark.practicalMarks;
                      grandTotal += subjTotal;
                      return (
                        <tr key={i}>
                          <td className="subj">{mark.subject}</td>
                          <td>{mark.practicalMarks}</td>
                          <td>{mark.theoryMarks}</td>
                          <td style={{ fontWeight: 700 }}>{subjTotal}</td>
                          <td style={{ fontWeight: 700 }}>{calculateGrade(subjTotal, maxMarks)}</td>
                        </tr>
                      );
                    })
                  )}
                  {studentMarks.length > 0 && (
                    <>
                      <tr className="total-row">
                        <td className="subj" style={{ textAlign: 'center' }}>Total</td>
                        <td colSpan={2}></td>
                        <td>{grandTotal}</td>
                        <td></td>
                      </tr>
                      <tr className="perc-row">
                        <td className="subj" style={{ textAlign: 'center' }}>Percentage</td>
                        <td colSpan={2}></td>
                        <td>{((grandTotal / totalMax) * 100).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Co-Scholastic Areas */}
              <table className="rc-table" style={{ marginBottom: '30px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Co-Scholastic Areas: [on a five point (A-E) grading scale]</th>
                    <th style={{ width: '15%' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="subj">Work Education</td>
                    <td style={{ fontWeight: 700 }}>A</td>
                  </tr>
                  <tr>
                    <td className="subj">Art Education</td>
                    <td style={{ fontWeight: 700 }}>A</td>
                  </tr>
                  <tr>
                    <td className="subj">Health & Physical Education</td>
                    <td style={{ fontWeight: 700 }}>A</td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Info */}
              <table className="rc-footer-info">
                <tbody>
                  <tr>
                    <td className="label">Class Teacher's Remarks</td>
                    <td>{isPass ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}</td>
                  </tr>
                  <tr>
                    <td className="label">Attendance</td>
                    <td>________ / ________</td>
                  </tr>
                  <tr>
                    <td className="label">Result</td>
                    <td>{isPass ? 'Pass' : 'Fail'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="rc-signatures">
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '5px' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
                </div>
                <div className="rc-sig-block">
                  <div className="rc-sig-line"></div>
                  <div>Signature of<br/>Class Teacher</div>
                </div>
                <div className="rc-sig-block">
                  <div className="rc-sig-line"></div>
                  <div>Principal<br/>MN Public School</div>
                </div>
              </div>

              {/* Grading Scale Instruction */}
              <div className="rc-grading-scale">
                <p>Instruction: Grading scale for scholastic areas: Grading are awarded on a 8-point grading scale as follows-</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <table style={{ flex: 1 }}>
                    <thead>
                      <tr>
                        <th>Marks Range</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>91-100</td><td>A1</td></tr>
                      <tr><td>81-90</td><td>A2</td></tr>
                      <tr><td>71-80</td><td>B1</td></tr>
                      <tr><td>61-70</td><td>B2</td></tr>
                    </tbody>
                  </table>
                  <table style={{ flex: 1 }}>
                    <thead>
                      <tr>
                        <th>Marks Range</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>51-60</td><td>C1</td></tr>
                      <tr><td>41-50</td><td>C2</td></tr>
                      <tr><td>33-40</td><td>D</td></tr>
                      <tr><td>32 & Below</td><td>E (Failed)</td></tr>
                    </tbody>
                  </table>
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
