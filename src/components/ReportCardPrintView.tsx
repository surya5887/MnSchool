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

  const getCurrentSession = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 3) return `${year}-${(year + 1).toString().slice(-2)}`;
    return `${year - 1}-${year.toString().slice(-2)}`;
  };

  const formatDOB = (dobStr?: string) => {
    if (!dobStr) return '-';
    const parts = dobStr.split('-');
    if (parts.length === 3 && parseInt(parts[0], 10) > 1000) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dobStr.replace(/-/g, '/');
  };

  const dobToWords = (dobStr?: string) => {
    if (!dobStr) return '-';
    let year = 0, month = 0, day = 0;
    const parts = dobStr.split('-');
    
    if (parts.length === 3) {
      if (parseInt(parts[0], 10) > 1000) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    } else if (dobStr.includes('/')) {
      const p2 = dobStr.split('/');
      if (p2.length === 3) {
        day = parseInt(p2[0], 10);
        month = parseInt(p2[1], 10);
        year = parseInt(p2[2], 10);
      }
    }

    if (!year || !month || !day) return dobStr;

    const days = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
      'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
      'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirty', 'Thirty First'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const units = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
    const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty'];
    
    let yearStr = '';
    if (year >= 2000 && year < 2100) {
      yearStr = 'Two Thousand ';
      const lastTwo = year % 100;
      if (lastTwo > 0 && lastTwo < 10) yearStr += units[lastTwo];
      else if (lastTwo >= 10 && lastTwo < 20) yearStr += teens[lastTwo - 10];
      else if (lastTwo >= 20) {
        yearStr += tens[Math.floor(lastTwo / 10)] + (lastTwo % 10 !== 0 ? ' ' + units[lastTwo % 10] : '');
      }
    } else {
      yearStr = year.toString();
    }
    
    const dayStr = (day >= 1 && day <= 31) ? days[day - 1] : day.toString();
    const monthStr = (month >= 1 && month <= 12) ? months[month - 1] : month.toString();
    
    return `${dayStr} ${monthStr} ${yearStr.trim()}`;
  };

  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100%; }
          .preview-overlay * { visibility: visible; }
          .preview-toolbar { display: none !important; }
          .report-card-page {
            margin: 0 auto !important; box-shadow: none !important;
            width: 100% !important; max-width: 100% !important;
            page-break-after: always; padding: 30px !important;
            height: 100vh !important;
            display: flex; flex-direction: column;
          }
          .rc-table th, .rc-table td.label, .rc-profile td.label, .rc-grading-scale th {
            -webkit-print-color-adjust: exact; color-adjust: exact;
          }
        }
        
        .rc-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
        }
        
        /* FRONT PAGE SPECIFIC */
        .rc-front-page {
          background: white; max-width: 850px; margin: 0 auto 32px auto;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          min-height: 1100px; padding: 50px;
          display: flex; flex-direction: column;
        }
        .rc-header-flex {
          display: flex; align-items: center; justify-content: center;
          border-bottom: 4px solid #b91c1c; padding-bottom: 20px; margin-bottom: 40px;
        }
        .rc-logo-box { flex: 0 0 160px; text-align: center; }
        .rc-logo-box img { width: 160px; height: 160px; object-fit: contain; }
        .rc-header-text { flex: 1; text-align: center; padding: 0 10px; }
        .rc-header-text h1 {
          font-size: 42px; font-weight: 900; color: #b91c1c; 
          margin: 0 0 10px 0; font-family: 'Arial Black', Impact, sans-serif;
          letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .rc-header-text h3 { font-size: 16px; color: #1e3a8a; margin: 0 0 8px 0; font-weight: bold; font-family: 'Arial', sans-serif;}
        .rc-header-text p { font-size: 15px; margin: 5px 0; font-weight: bold; color: #000; font-family: 'Arial', sans-serif;}
      
        .rc-title-section { text-align: center; margin-bottom: 40px; }
        .rc-session {
          font-size: 18px; font-weight: bold; background: #e2e8f0; border: 2px solid #b91c1c;
          display: inline-block; padding: 6px 30px; border-radius: 30px; margin-bottom: 15px;
          font-family: 'Arial', sans-serif;
        }
        .rc-report-title {
          font-size: 24px; font-weight: bold; color: #1e3a8a; text-decoration: underline; text-underline-offset: 6px;
          font-family: 'Arial', sans-serif; text-transform: uppercase;
        }
      
        .rc-profile-wrapper { margin-top: 20px; flex-grow: 1; }
        .rc-profile-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; text-decoration: underline; }
        .rc-profile { width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: 'Arial', sans-serif; }
        .rc-profile td { padding: 14px 16px; border: 1px solid #000; font-size: 16px; }
        .rc-profile td.label { font-weight: bold; width: 35%; background-color: #f8fafc; }
        .rc-profile td.val { font-weight: bold; text-transform: uppercase; }
      
        /* SIGNATURES */
        .rc-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px; font-family: 'Arial', sans-serif; margin-top: 50px;}
        .rc-sig-block { text-align: center; font-size: 16px; font-weight: bold; }
        .rc-sig-line { border-top: 1px solid #000; width: 220px; margin-bottom: 8px; }
      
        /* BACK PAGE SPECIFIC */
        .rc-back-page {
          background: white; max-width: 850px; margin: 0 auto 32px auto;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          min-height: 1100px; padding: 50px;
          display: flex; flex-direction: column;
        }
        .rc-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 2px solid #000; font-family: 'Arial', sans-serif; }
        .rc-table th, .rc-table td { border: 1px solid #000; padding: 12px; text-align: center; font-size: 15px; }
        .rc-table th { background-color: #f1f5f9; font-weight: bold; }
        .rc-table td.subj { text-align: left; font-weight: bold; }
        .rc-table tr.total-row td, .rc-table tr.perc-row td { font-weight: bold; background-color: #f8fafc; }
      
        .rc-footer-info { width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 2px solid #000; font-family: 'Arial', sans-serif;}
        .rc-footer-info td { padding: 12px 15px; border: 1px solid #000; font-size: 15px; font-weight: bold; }
        .rc-footer-info td.label { width: 40%; background-color: #f8fafc; }
      
        .rc-grading-scale { margin-top: auto; font-size: 13px; font-family: 'Arial', sans-serif;}
        .rc-grading-scale p { margin: 0 0 10px 0; font-weight: bold; }
        .rc-grading-scale table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
        .rc-grading-scale th, .rc-grading-scale td { border: 1px solid #000; padding: 8px; text-align: center; }
        .rc-grading-scale th { background-color: #f8fafc; font-weight: bold; }
      `}</style>

      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '850px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#1e3a8a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Printer size={18} /> Print All
        </button>
      </div>

      <div className="report-card-container">
        {students.map((student) => {
          const studentMarks = marks.filter(m => m.studentId === student.id && m.examTerm === term);
          let grandTotal = 0;
          const totalMax = studentMarks.length * maxMarks;
          const percentage = totalMax > 0 ? ((grandTotal / totalMax) * 100).toFixed(2) : '0.00';
          const overallGrade = calculateGrade(grandTotal, totalMax);
          const isPass = parseFloat(percentage) >= 33;
          
          return (
            <React.Fragment key={student.id}>
              {/* PAGE 1: FRONT PAGE */}
              <div className="report-card-page rc-container rc-front-page">
                {/* Header */}
                <div className="rc-header-flex">
                  <div className="rc-logo-box">
                    <img src="/images/logo_circular.png" alt="School Logo" />
                  </div>
                  <div className="rc-header-text">
                    <h1>M.N. PUBLIC SCHOOL</h1>
                    <h3>Recognition from UP Board (CBSE Pattern for English Medium)</h3>
                    <p>Email: info@mnpublicschool.com &nbsp;&nbsp;|&nbsp;&nbsp; Mobile No.: 9997125152, 8430707174</p>
                    <p>Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India</p>
                  </div>
                </div>

                {/* Session & Title */}
                <div className="rc-title-section">
                  <div className="rc-session">ACADEMIC SESSION {getCurrentSession()}</div>
                  <div className="rc-report-title">REPORT CARD FOR CLASS {className.toUpperCase()}</div>
                </div>

                {/* Student Profile */}
                <div className="rc-profile-wrapper">
                  <div className="rc-profile-title">Student Profile:</div>
                  <table className="rc-profile">
                    <tbody>
                      <tr>
                        <td className="label">Admission No.</td>
                        <td className="val">{student.admissionNo || '-'}</td>
                      </tr>
                      <tr>
                        <td className="label">Roll No.</td>
                        <td className="val">{student.rollNumber || '-'}</td>
                      </tr>
                      <tr>
                        <td className="label">Student's Name</td>
                        <td className="val">{student.firstName} {student.lastName}</td>
                      </tr>
                      <tr>
                        <td className="label">Father's Name</td>
                        <td className="val">{student.parentName || '-'}</td>
                      </tr>
                      <tr>
                        <td className="label">Mother's Name</td>
                        <td className="val">-</td>
                      </tr>
                      <tr>
                        <td className="label">Date of Birth (Numeric)</td>
                        <td className="val">{formatDOB(student.dob)}</td>
                      </tr>
                      <tr>
                        <td className="label">Date of Birth (In Words)</td>
                        <td className="val">{dobToWords(student.dob)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ flexGrow: 1 }}></div>

                {/* Signatures on Front Page */}
                <div className="rc-signatures">
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
                  <div className="rc-sig-block">
                    <div className="rc-sig-line"></div>
                    <div>Signature of<br/>Class Teacher</div>
                  </div>
                  <div className="rc-sig-block">
                    <div className="rc-sig-line"></div>
                    <div>Principal<br/>M.N. Public School</div>
                  </div>
                </div>
              </div>

              {/* PAGE 2: BACK PAGE */}
              <div className="report-card-page rc-container rc-back-page">
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
                <table className="rc-table" style={{ marginBottom: '40px' }}>
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

                <div style={{ flexGrow: 1 }}></div>

                {/* Grading Scale Instruction */}
                <div className="rc-grading-scale">
                  <p>Instruction: Grading scale for scholastic areas: Grading are awarded on an 8-point grading scale as follows-</p>
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
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ReportCardPrintView;
