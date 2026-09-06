import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import type { StudentData } from '../services/studentService';
import { getAllExamMarks, saveExamMark, type ExamMarkData } from '../services/examService';
import { getAllReportCardMeta, saveReportCardMeta, type ReportCardMetaData } from '../services/reportCardService';
import { getAllAttendanceForClass } from '../services/attendanceService';
import type { ClassData } from '../services/classService';
import { ArrowLeft, Printer, Save, Loader } from 'lucide-react';

interface ReportCardProps {
  students: StudentData[];
  classes: ClassData[];
  className: string;
  maxMarks: number;
  onClose: () => void;
}

const ReportCardPrintView: React.FC<ReportCardProps> = ({ students, classes, className, maxMarks, onClose }) => {
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [marks, setMarks] = useState<ExamMarkData[]>([]);
  const [meta, setMeta] = useState<ReportCardMetaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState<'both' | 'front' | 'back'>('both');

  const maxTheory = Math.round(maxMarks * 0.8);
  const maxPractical = Math.round(maxMarks * 0.2);

  const getCurrentSession = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 3) return `${year}-${(year + 1).toString().slice(-2)}`;
    return `${year - 1}-${year.toString().slice(-2)}`;
  };
  const session = getCurrentSession();

  const [localMarks, setLocalMarks] = useState<Record<string, { halfYearlyTerm: number, halfYearlyPeriodic: number, annualTerm: number, annualPeriodic: number }>>({});
  const [localMeta, setLocalMeta] = useState<Record<string, { work: string, art: string, health: string, remarks: string, date: string, attendance: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
      const set = await getSchoolSettings();
      if(set) setSettings(set);

    try {
      const allMarks = await getAllExamMarks();
      const allMeta = await getAllReportCardMeta(session);
      
      const uniqueClassSections = Array.from(new Set(students.map(s => `${s.classId}_${s.sectionId}`)));
      let allAtt: any[] = [];
      for (const cs of uniqueClassSections) {
        const [cId, sId] = cs.split('_');
        const recs = await getAllAttendanceForClass(cId, sId, session);
        allAtt = [...allAtt, ...recs];
      }
      
      setMarks(allMarks);
      setMeta(allMeta);

      const newLocalMarks: typeof localMarks = {};
      const newLocalMeta: typeof localMeta = {};

      students.forEach(student => {
        // Fix for synced subjects: Match by className rather than ID, just like Examination.tsx does
        const studentClass = classes.find(c => c.className === className);
        let subjects = studentClass?.subjects || [];
        if (subjects.length === 0) {
          subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
        }
        
        subjects.forEach(subj => {
          const key = `${student.id}_${subj}`;
          const hy = allMarks.find(m => m.studentId === student.id && m.examTerm === 'Half Yearly Exam' && m.subject === subj);
          const an = allMarks.find(m => m.studentId === student.id && m.examTerm === 'Annual Exam' && m.subject === subj);
          newLocalMarks[key] = {
            halfYearlyTerm: hy?.theoryMarks || 0,
            halfYearlyPeriodic: hy?.practicalMarks || 0,
            annualTerm: an?.theoryMarks || 0,
            annualPeriodic: an?.practicalMarks || 0
          };
        });

        const m = allMeta.find(x => x.studentId === student.id);
        const todayStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
        
        // Auto Attendance logic
        const studentAtt = allAtt.filter(r => r.classId === student.classId && r.sectionId === student.sectionId && r.records[student.id!] !== undefined);
        const totalDays = studentAtt.length;
        const presentDays = studentAtt.filter(r => r.records[student.id!] === 'Present').length;
        const autoAttendance = totalDays > 0 ? `${presentDays}/${totalDays}` : '';
        
        newLocalMeta[student.id!] = {
          work: m?.workEducation || 'A',
          art: m?.artEducation || 'A',
          health: m?.healthEducation || 'A',
          remarks: m?.teacherRemarks || '', // We will auto-fill in render if empty
          date: m?.issueDate || todayStr,
          attendance: m?.attendance || autoAttendance
        };
      });

      setLocalMarks(newLocalMarks);
      setLocalMeta(newLocalMeta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (total: number, max: number) => {
    if(max === 0) return '';
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

  const handleSaveAndPrint = async (mode: 'both' | 'front' | 'back') => {
    setPrintMode(mode);
    setSaving(true);
    try {
      const promises: Promise<any>[] = [];
      for (const student of students) {
        const studentClass = classes.find(c => c.className === className);
        let subjects = studentClass?.subjects || [];
        if (subjects.length === 0) {
          subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
        }
        
        for (const subj of subjects) {
          const key = `${student.id}_${subj}`;
          const m = localMarks[key];
          if (m) {
            promises.push(saveExamMark({
              studentId: student.id as string,
              examTerm: 'Half Yearly Exam',
              subject: subj,
              theoryMarks: m.halfYearlyTerm,
              practicalMarks: m.halfYearlyPeriodic
            }));
            promises.push(saveExamMark({
              studentId: student.id as string,
              examTerm: 'Annual Exam',
              subject: subj,
              theoryMarks: m.annualTerm,
              practicalMarks: m.annualPeriodic
            }));
          }
        }

        const mt = localMeta[student.id!];
        if (mt) {
          let finalRemarks = mt.remarks;
          if (!finalRemarks) {
             let grandTotal = 0;
             let possibleTotal = 0;
             subjects.forEach(subj => {
                const k = `${student.id}_${subj}`;
                const mk = localMarks[k];
                if(mk) {
                  grandTotal += mk.halfYearlyPeriodic + mk.halfYearlyTerm + mk.annualPeriodic + mk.annualTerm;
                  possibleTotal += 200;
                }
             });
             const isPass = possibleTotal > 0 && ((grandTotal/possibleTotal)*100) >= 33;
             finalRemarks = isPass ? 'EXCELLENT' : 'NEEDS IMPROVEMENT';
          }
          promises.push(saveReportCardMeta({
            studentId: student.id as string,
            session,
            workEducation: mt.work,
            artEducation: mt.art,
            healthEducation: mt.health,
            teacherRemarks: finalRemarks,
            issueDate: mt.date,
            attendance: mt.attendance
          }));
        }
      }
      
      await Promise.all(promises);
      
      // Extremely short timeout just to allow React state to commit printMode class
      setTimeout(() => {
        window.print();
        setSaving(false);
      }, 50);

    } catch (err) {
      console.error(err);
      alert('Error saving data.');
      setSaving(false);
    }
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
      if (parseInt(parts[0], 10) > 1000) { year = parseInt(parts[0], 10); month = parseInt(parts[1], 10); day = parseInt(parts[2], 10); }
      else { day = parseInt(parts[0], 10); month = parseInt(parts[1], 10); year = parseInt(parts[2], 10); }
    } else if (dobStr.includes('/')) {
      const p2 = dobStr.split('/');
      if (p2.length === 3) { day = parseInt(p2[0], 10); month = parseInt(p2[1], 10); year = parseInt(p2[2], 10); }
    }
    if (!year || !month || !day) return dobStr;
    const days = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirty', 'Thirty First'];
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
      else if (lastTwo >= 20) yearStr += tens[Math.floor(lastTwo / 10)] + (lastTwo % 10 !== 0 ? ' ' + units[lastTwo % 10] : '');
    } else { yearStr = year.toString(); }
    const dayStr = (day >= 1 && day <= 31) ? days[day - 1] : day.toString();
    const monthStr = (month >= 1 && month <= 12) ? months[month - 1] : month.toString();
    return `${dayStr} ${monthStr} ${yearStr.trim()}`;
  };

  if (loading) return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(229, 231, 235, 0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px 60px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minWidth: '350px' }}>
         <img src={settings?.logoUrl || "/images/logo_circular.png"} alt="Logo" style={{ width: '80px', height: '80px', animation: 'pulse-slow 2s infinite' }} />
         <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e3a8a', letterSpacing: '0.5px' }}>Generating Report Card...</div>
         <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #1e3a8a, #b91c1c)', borderRadius: '10px', animation: 'loading-slide 1.5s infinite ease-in-out' }}></div>
         </div>
         <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>Fetching student records & attendance</div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
  return (
    <div className="preview-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 9999, overflowY: 'auto', padding: '24px' }}>
      <style>{`
        @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
            body * { visibility: hidden; }
            
            .preview-overlay { position: static !important; background: white !important; padding: 0 !important; width: 100% !important; }
            .preview-overlay * { visibility: visible; }
            .preview-toolbar { display: none !important; }
            
            ${printMode === 'front' ? '.rc-back-page { display: none !important; }' : ''}
            ${printMode === 'back' ? '.rc-front-page { display: none !important; }' : ''}
            
            .report-card-page {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              page-break-after: always;
              height: auto !important;
              min-height: 275mm !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            .rc-table, .rc-profile, .rc-footer-info, .rc-grading-scale table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
            }
            
            .rc-table th, .rc-table td.label, .rc-profile td.label, .rc-grading-scale th { 
              -webkit-print-color-adjust: exact; color-adjust: exact; 
            }
            
            /* Hide input styling when printing and fix width issues */
            input.editable-cell { 
              border: none !important; background: transparent !important; padding: 0 !important; outline: none !important; box-shadow: none !important; 
              min-width: 0 !important; width: 100% !important; font-size: 13px !important; font-weight: bold !important; color: #000 !important; -webkit-appearance: none; appearance: none;
            }
            input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          }
        
        .rc-container { font-family: 'Times New Roman', Times, serif; color: #000; }

          
          img.rc-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            object-fit: contain;
            opacity: 0.15;
            z-index: 0;
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }


        .editable-cell {
          width: 100%; height: 100%; border: 1px solid transparent; text-align: center; font-size: 12px; font-weight: bold; background: #f8fafc; font-family: 'Arial', sans-serif; transition: 0.2s;
        }
        .editable-cell:hover, .editable-cell:focus { border-color: #3b82f6; background: #fff; outline: none; }
        
        .rc-front-page, .rc-back-page {
          position: relative; z-index: 1; overflow: hidden; background: white; max-width: 1000px; margin: 0 auto 32px auto; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); min-height: 1200px; padding: 50px; display: flex; flex-direction: column;
        }
        .rc-header-flex { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; border-bottom: 4px solid #b91c1c; padding-bottom: 20px; margin-bottom: 40px; }
        .rc-logo-box { flex: 0 0 160px; text-align: center; }
        .rc-logo-box img { width: 160px; height: 160px; object-fit: contain; }
        .rc-header-text { flex: 1; text-align: left; padding: 0 10px 0 30px; }
        .rc-header-text h1 { font-size: 38px; font-weight: 900;  color: #b91c1c; margin: 0 0 10px 0; font-family: 'Arial Black', Impact, sans-serif; letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        .rc-header-text h3 { font-size: 16px; color: #1e3a8a; margin: 0 0 8px 0; font-weight: bold; font-family: 'Arial', sans-serif;}
        .rc-header-text p { font-size: 13px; margin: 5px 0; font-weight: bold; color: #000; font-family: 'Arial', sans-serif;}
      
        .rc-title-section { position: relative; z-index: 1; text-align: center; margin-bottom: 40px; }
        .rc-session { font-size: 18px; font-weight: bold; background: #e2e8f0; border: 2px solid #b91c1c; display: inline-block; padding: 6px 30px; border-radius: 30px; margin-bottom: 15px; font-family: 'Arial', sans-serif; }
        .rc-report-title { font-size: 24px; font-weight: bold; color: #1e3a8a; text-decoration: underline; text-underline-offset: 6px; font-family: 'Arial', sans-serif; text-transform: uppercase; }
      
        .rc-profile-wrapper { position: relative; z-index: 1; margin-top: 20px; flex-grow: 1; }
        .rc-profile-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; text-decoration: underline; }
        .rc-profile { width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: 'Arial', sans-serif; table-layout: fixed; }
        .rc-profile td { padding: 14px 16px; border: 1px solid #000; font-size: 16px; }
        .rc-profile td.label { font-weight: bold; width: 35%; background-color: rgba(248, 250, 252, 0.7); }
        .rc-profile td.val { font-weight: bold; text-transform: uppercase; }
      
        .rc-signatures { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; padding: 0; font-family: 'Arial', sans-serif; margin-top: 50px;}
        .rc-sig-block { text-align: center; font-size: 14px; font-weight: bold; max-width: 220px; word-wrap: break-word; line-height: 1.3; }
        .rc-sig-line { border-top: 1px solid #000; width: 220px; margin: 18px auto 8px auto; }
      
        .rc-table { position: relative; z-index: 1; width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 2px solid #000; font-family: 'Arial', sans-serif; table-layout: fixed; }
        .rc-table th, .rc-table td { border: 1px solid #000; padding: 6px 4px; text-align: center; font-size: 12px; }
        .rc-table th { background-color: #f1f5f9; font-weight: bold; }
        .rc-table td.subj { text-align: left; font-weight: bold; padding-left: 10px; }
        .rc-table tr.total-row td, .rc-table tr.perc-row td { font-weight: bold; background-color: rgba(248, 250, 252, 0.7); }
      
        .rc-footer-info { position: relative; z-index: 1; width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 2px solid #000; font-family: 'Arial', sans-serif; table-layout: fixed;}
        .rc-footer-info td { padding: 8px 15px; border: 1px solid #000; font-size: 13px; font-weight: bold; }
        .rc-footer-info td.label { width: 40%; background-color: rgba(248, 250, 252, 0.7); }
      
        .rc-grading-scale { position: relative; z-index: 1; margin-top: auto; font-size: 12px; font-family: 'Arial', sans-serif;}
        .rc-grading-scale p { margin: 0 0 10px 0; font-weight: bold; }
        .rc-grading-scale table { width: 100%; border-collapse: collapse; border: 2px solid #000; table-layout: fixed; }
        .rc-grading-scale th, .rc-grading-scale td { border: 1px solid #000; padding: 8px; text-align: center; }
        .rc-grading-scale th { background-color: rgba(248, 250, 252, 0.7); font-weight: bold; }
        
        .pass-text { color: #16a34a; font-weight: 900; }
        .fail-text { color: #dc2626; font-weight: 900; }
      `}</style>

      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1000px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleSaveAndPrint('front')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Front</>}
            </button>
            <button onClick={() => handleSaveAndPrint('back')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#f59e0b', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Back</>}
            </button>
          </div>
      </div>

      <div className="report-card-container">
        {students.map((student) => {
          const studentClass = classes.find(c => c.className === className);
          let subjects = studentClass?.subjects || [];
          if (subjects.length === 0) {
            subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
          }
          
          let grandTotal = 0;
          let possibleTotal = 0;

          const metaData = localMeta[student.id!] || { work: '', art: '', health: '', remarks: '', date: '', attendance: '' };

          // Pre-calculate pass/fail for remark auto-generation
          let tempGrandTotal = 0;
          let tempPossibleTotal = 0;
          subjects.forEach(subj => {
             const k = `${student.id}_${subj}`;
             const mk = localMarks[k];
             if(mk) {
                tempGrandTotal += mk.halfYearlyPeriodic + mk.halfYearlyTerm + mk.annualPeriodic + mk.annualTerm;
                tempPossibleTotal += 200;
             } else {
                tempPossibleTotal += 200; // Even if 0 marks entered
             }
          });
          const isPass = tempPossibleTotal > 0 && ((tempGrandTotal/tempPossibleTotal)*100) >= 33;
          const autoRemark = isPass ? 'EXCELLENT' : 'NEEDS IMPROVEMENT';
          const displayRemark = metaData.remarks || autoRemark;

          return (
            <React.Fragment key={student.id}>
              {/* PAGE 1: FRONT PAGE */}
              <div className="report-card-page rc-container rc-front-page">
                  <img className="rc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="watermark" />
                <div className="rc-header-flex">
                  <div className="rc-logo-box"><img src={settings?.logoUrl || "/images/logo_circular.png"} alt="School Logo" /></div>
                  <div className="rc-header-text">
                    <h1>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                      <h3>{settings?.recognitionText || 'Recognition from UP Board (CBSE Pattern for English Medium)'}</h3>
                      <p>Email: {settings?.email || 'info@mnpublicschool.com'} &nbsp;&nbsp;|&nbsp;&nbsp; Mobile No.: {settings?.phone || '9997125152, 8430707174'}</p>
                      <p>{settings?.address || 'Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India'}</p>
                  </div>
                </div>

                <div className="rc-title-section">
                  <div className="rc-session">ACADEMIC SESSION {session}</div>
                  <div className="rc-report-title">REPORT CARD FOR CLASS {className.toUpperCase()}</div>
                </div>

                <div className="rc-profile-wrapper">
                  <div className="rc-profile-title">Student Profile:</div>
                  <table className="rc-profile">
                    <tbody>
                      <tr><td className="label">Admission No.</td><td className="val">{student.admissionNo || '-'}</td></tr>
                      <tr><td className="label">Roll No.</td><td className="val">{student.rollNumber || '-'}</td></tr>
                      <tr><td className="label">Student's Name</td><td className="val">{student.firstName} {student.lastName}</td></tr>
                      <tr><td className="label">Father's Name</td><td className="val">{student.parentName || '-'}</td></tr>
                      <tr><td className="label">Mother's Name</td><td className="val">-</td></tr>
                      <tr><td className="label">Date of Birth (Numeric)</td><td className="val">{formatDOB(student.dob)}</td></tr>
                      <tr><td className="label">Date of Birth (In Words)</td><td className="val">{dobToWords(student.dob)}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ flexGrow: 1 }}></div>

                <div className="rc-signatures">
                  <div className="rc-sig-block" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Date:</span> 
                        <div style={{ width: '150px', marginLeft: '10px', borderBottom: '1px solid #000' }}>
                          <input type="text" className="editable-cell" style={{width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 'bold'}} value={metaData.date} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, date: e.target.value}})} />
                        </div>
                    </div>
                    <div style={{ visibility: 'hidden' }}>Line 1<br/>Line 2</div>
                  </div>
                  <div className="rc-sig-block"><div className="rc-sig-line"></div><div>Signature of<br/>Class Teacher</div></div>
                  <div className="rc-sig-block"><div className="rc-sig-line"></div><div>Principal<br/>{settings?.schoolName || "M.N. Public School"}</div></div>
                </div>
              </div>

              {/* PAGE 2: BACK PAGE */}
              <div className="report-card-page rc-container rc-back-page">
                  <img className="rc-watermark" src={settings?.logoUrl || "/images/logo_circular.png"} alt="watermark" />
                <table className="rc-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ textAlign: 'left', width: '20%' }}>Scholastic Areas</th>
                      <th colSpan={3} style={{ width: '30%' }}>Half Yearly Examination</th>
                      <th colSpan={3} style={{ width: '30%' }}>Annual Examination</th>
                      <th rowSpan={2} style={{ width: '10%' }}>Total<br/>(200)</th>
                      <th rowSpan={2} style={{ width: '10%' }}>Grade</th>
                    </tr>
                    <tr>
                      <th >Periodic<br/>(20)</th>
                      <th >Half Yr.<br/>(80)</th>
                      <th >Obtained<br/>(100)</th>
                      <th >Periodic<br/>(20)</th>
                      <th >Annual<br/>(80)</th>
                      <th >Obtained<br/>(100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subj) => {
                      const key = `${student.id}_${subj}`;
                      const m = localMarks[key] || { halfYearlyPeriodic: 0, halfYearlyTerm: 0, annualPeriodic: 0, annualTerm: 0 };
                      
                      const hyTotal = Number(m.halfYearlyPeriodic) + Number(m.halfYearlyTerm);
                      const anTotal = Number(m.annualPeriodic) + Number(m.annualTerm);
                      const rowTotal = hyTotal + anTotal;
                      
                      grandTotal += rowTotal;
                      possibleTotal += 200;

                      return (
                        <tr key={subj}>
                          <td className="subj">{subj}</td>
                          <td><input type="number" min={0} max={20} className="editable-cell" value={m.halfYearlyPeriodic || ''} onChange={e => setLocalMarks({...localMarks, [key]: {...m, halfYearlyPeriodic: Number(e.target.value)}})} /></td>
                          <td><input type="number" min={0} max={80} className="editable-cell" value={m.halfYearlyTerm || ''} onChange={e => setLocalMarks({...localMarks, [key]: {...m, halfYearlyTerm: Number(e.target.value)}})} /></td>
                          <td style={{ fontWeight: 'bold' }}>{hyTotal || ''}</td>
                          <td><input type="number" min={0} max={20} className="editable-cell" value={m.annualPeriodic || ''} onChange={e => setLocalMarks({...localMarks, [key]: {...m, annualPeriodic: Number(e.target.value)}})} /></td>
                          <td><input type="number" min={0} max={80} className="editable-cell" value={m.annualTerm || ''} onChange={e => setLocalMarks({...localMarks, [key]: {...m, annualTerm: Number(e.target.value)}})} /></td>
                          <td style={{ fontWeight: 'bold' }}>{anTotal || ''}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '15px' }}>{rowTotal || ''}</td>
                          <td style={{ fontWeight: 'bold', fontSize: '15px' }}>{calculateGrade(rowTotal, 200)}</td>
                        </tr>
                      );
                    })}
                    <tr className="total-row">
                      <td className="subj" style={{ textAlign: 'center' }}>Total</td>
                      <td colSpan={6}></td>
                      <td colSpan={2} style={{ fontSize: "15px", fontWeight: "bold" }}>{grandTotal} / {possibleTotal}</td>
                    </tr>
                    <tr className="perc-row">
                      <td className="subj" style={{ textAlign: 'center' }}>Percentage</td>
                      <td colSpan={6}></td>
                      <td colSpan={2} style={{ fontSize: '16px', textAlign: 'center' }}>
                        {possibleTotal > 0 ? ((grandTotal / possibleTotal) * 100).toFixed(2) + '%' : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="rc-table" style={{ marginBottom: '40px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '85%' }}>Co-Scholastic Areas: [on a five point (A-E) grading scale]</th>
                      <th style={{ width: '25%' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="subj">Work Education</td>
                      <td><input type="text" maxLength={1} className="editable-cell" style={{textTransform:'uppercase'}} value={metaData.work} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, work: e.target.value.toUpperCase()}})} /></td>
                    </tr>
                    <tr>
                      <td className="subj">Art Education</td>
                      <td><input type="text" maxLength={1} className="editable-cell" style={{textTransform:'uppercase'}} value={metaData.art} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, art: e.target.value.toUpperCase()}})} /></td>
                    </tr>
                    <tr>
                      <td className="subj">Health & Physical Education</td>
                      <td><input type="text" maxLength={1} className="editable-cell" style={{textTransform:'uppercase'}} value={metaData.health} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, health: e.target.value.toUpperCase()}})} /></td>
                    </tr>
                  </tbody>
                </table>

                <table className="rc-footer-info">
                  <tbody>
                    <tr>
                      <td className="label">Class Teacher's Remarks</td>
                      <td><input type="text" className="editable-cell" style={{textAlign:'left', paddingLeft:'10px'}} placeholder="Enter remarks..." value={displayRemark} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, remarks: e.target.value}})} /></td>
                    </tr>
                    <tr>
                      <td className="label">Attendance</td>
                      <td><input type="text" className="editable-cell" style={{textAlign:'left', paddingLeft:'10px'}} placeholder="e.g. 150/200" value={metaData.attendance} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, attendance: e.target.value}})} /></td>
                    </tr>
                    <tr>
                      <td className="label">Result</td>
                      <td className={isPass ? 'pass-text' : 'fail-text'} style={{ fontSize: '18px' }}>
                        {isPass ? 'PASSED' : 'FAILED'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ flexGrow: 1 }}></div>

                <div className="rc-grading-scale">
                  <p>Instruction: Grading scale for scholastic areas: Grading are awarded on an 8-point grading scale as follows-</p>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <table style={{ flex: 1 }}>
                      <thead><tr><th>Marks Range</th><th style={{ width: '25%' }}>Grade</th></tr></thead>
                      <tbody><tr><td>91-100</td><td>A1</td></tr><tr><td>81-90</td><td>A2</td></tr><tr><td>71-80</td><td>B1</td></tr><tr><td>61-70</td><td>B2</td></tr></tbody>
                    </table>
                    <table style={{ flex: 1 }}>
                      <thead><tr><th>Marks Range</th><th style={{ width: '25%' }}>Grade</th></tr></thead>
                      <tbody><tr><td>51-60</td><td>C1</td></tr><tr><td>41-50</td><td>C2</td></tr><tr><td>33-40</td><td>D</td></tr><tr><td>32 & Below</td><td>E (Failed)</td></tr></tbody>
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
