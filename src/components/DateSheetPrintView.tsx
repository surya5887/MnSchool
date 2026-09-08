import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import { ArrowLeft, Printer, Loader } from 'lucide-react';
import { getExamSchedulesByTerm, type ExamScheduleData } from '../services/examService';

interface DateSheetProps {
  scheduleData: ExamScheduleData;
  onClose: () => void;
}

const DateSheetPrintView: React.FC<DateSheetProps> = ({ scheduleData, onClose }) => {
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [allSchedules, setAllSchedules] = useState<ExamScheduleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Default instructions similar to the photo
  const engRules = [
    `${scheduleData.examTerm.toUpperCase()} EXAM will start soon.`,
    "Exam timing 8:00 am to 11:00 am.",
    "All guardians are required to clear all the dues till SEP 2026 before examination otherwise the school will not allow your ward to appear in exam.",
    "Teacher parents meeting will be held soon."
  ];

  const hinRules = [
    `विद्यालय में ${scheduleData.examTerm.toUpperCase()} EXAM जल्द शुरू हो रहे हैं।`,
    "परीक्षा समय सुबह 8:00 से 11:00 तक।",
    "सभी अभिभावकों से अनुरोध है कि अपना सितंबर माह 2026 तक का बकाया शुल्क परीक्षा से पूर्व विद्यालय में जमा कराये।",
    "Exam Copies शिक्षक अभिभावक मीटिंग में दिखाई जाएंगी।"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const set = await getSchoolSettings();
        if (set) setSettings(set);
        
        // Fetch all schedules for this exam term to build the master matrix
        if (scheduleData.examTerm) {
          const schedules = await getExamSchedulesByTerm(scheduleData.examTerm);
          setAllSchedules(schedules);
        } else {
          setAllSchedules([scheduleData]); // Fallback
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scheduleData.examTerm]);

  // Aggregate Data for Matrix
  const uniqueDatesSet = new Set<string>();
  allSchedules.forEach(sched => {
    sched.schedule.forEach(item => {
      if (item.date) uniqueDatesSet.add(item.date);
    });
  });
  
  // Sort dates chronologically
  const sortedDates = Array.from(uniqueDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Sort classes (Very basic heuristic to keep numbers ordered if possible)
  const sortedClasses = [...new Set(allSchedules.map(s => s.classId))].sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 999;
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  const getDayOfWeek = (dateString: string) => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return days[d.getDay()];
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="print-wrapper" style={{ position: 'fixed', inset: 0, background: '#e5e7eb', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="print-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      <div className="print-hide" style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn-secondary" onClick={onClose}>
          <ArrowLeft size={20} /> Back
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={20} /> Print Date Sheet
        </button>
      </div>

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
            body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
            body * { visibility: hidden; }
            .print-wrapper { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: white !important; display: block !important; }
            .print-wrapper * { visibility: visible; }
            @page { margin: 8mm; size: A4 portrait; }
          }
          
          .ds-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 20px auto;
            padding: 10mm;
            box-sizing: border-box;
            color: black;
            font-family: 'Times New Roman', Times, serif;
          }

          @media print {
            .ds-container { margin: 0; width: 100%; min-height: 100%; box-shadow: none; border: none; }
          }

          .ds-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .ds-header-left { flex: 1; text-align: center; padding-top: 15px; }
          .ds-header-left h1 { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px; }
          .ds-header-left h2 { font-size: 16px; text-transform: uppercase; margin: 0; font-weight: bold; letter-spacing: 0.5px; }
          
          .ds-header-right { 
            width: 250px; 
            border: 1px solid #000; 
            padding: 8px; 
            font-size: 13px; 
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          .ds-header-right div { border-bottom: 1px dotted #999; margin-bottom: 4px; padding-bottom: 2px; }

          table.ds-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; }
          table.ds-table th, table.ds-table td { border: 1px solid #000; padding: 6px 4px; }
          table.ds-table th { font-weight: bold; font-size: 11px; }
          
          .ds-rules-container { display: flex; gap: 10px; font-family: Arial, sans-serif; font-size: 12px; margin-top: 20px; }
          .ds-rule-box { flex: 1; border: 1px solid #000; padding: 10px; }
          .ds-rule-box h3 { margin: 0 0 8px 0; font-size: 13px; font-weight: bold; text-decoration: underline; }
          .ds-rule-box p { margin: 0 0 4px 0; line-height: 1.4; }
        `}
      </style>

      <div className="ds-container">
        {/* Header Section */}
        <div className="ds-header">
          <div className="ds-header-left">
            <h1>{settings?.name || 'THE SKYLAND SCHOOL SHAHPUR'}</h1>
            <h2>{scheduleData.examTerm.toUpperCase()} EXAM DATE SHEET (2026-27)</h2>
          </div>
          
          <div className="ds-header-right">
            <div>Name: ................................................</div>
            <div>Father's name: Mr. ...........................</div>
            <div>Class: ................................................</div>
            <div style={{borderBottom: 'none'}}>Fee balance: ..................... till SEP 2026.</div>
          </div>
        </div>

        {/* Matrix Table Section */}
        <table className="ds-table">
          <thead>
            <tr>
              <th style={{width: '120px'}}>
                <div style={{borderBottom: '1px solid #000', paddingBottom: '2px'}}>CLASS &rarr;</div>
                <div style={{paddingTop: '2px'}}>DATES/DAY &darr;</div>
              </th>
              {sortedClasses.map(c => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date, idx) => (
              <tr key={idx}>
                <td style={{fontWeight: 'bold', fontSize: '11px', textAlign: 'left', paddingLeft: '8px'}}>
                  {formatDate(date)}<br/>
                  {getDayOfWeek(date)}
                </td>
                {sortedClasses.map(classId => {
                  // Find subject for this class on this date
                  const classSched = allSchedules.find(s => s.classId === classId);
                  const subjectItem = classSched?.schedule.find(item => item.date === date);
                  return (
                    <td key={classId} style={{ fontWeight: subjectItem?.subject ? 'bold' : 'normal' }}>
                      {subjectItem?.subject ? subjectItem.subject.toUpperCase() : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Rules Section */}
        <div className="ds-rules-container">
          <div className="ds-rule-box">
            <h3>Rules & Regulations-</h3>
            {engRules.map((rule, i) => (
              <p key={i}><strong>{i+1}.</strong> {rule}</p>
            ))}
          </div>
          
          <div className="ds-rule-box">
            <h3>नियम व शर्तें-</h3>
            {hinRules.map((rule, i) => (
              <p key={i}><strong>{i+1}.</strong> {rule}</p>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DateSheetPrintView;
