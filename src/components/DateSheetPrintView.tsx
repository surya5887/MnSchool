import React, { useState, useEffect } from 'react';
import { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import { ArrowLeft, Printer } from 'lucide-react';
import type { ExamScheduleData } from '../services/examService';

interface DateSheetProps {
  scheduleData: ExamScheduleData;
  onClose: () => void;
}

const DateSheetPrintView: React.FC<DateSheetProps> = ({ scheduleData, onClose }) => {
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [instructions, setInstructions] = useState("Students must report to the examination hall 15 minutes before the commencement of the exam.\nUse of unfair means will result in strict disciplinary action.\nMobile phones, smartwatches, or any electronic gadgets are strictly prohibited.\nBring your own stationery items. Borrowing is not allowed during the exam.");

  useEffect(() => {
    getSchoolSettings().then(set => {
      if (set) setSettings(set);
    });
  }, []);

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
            * { overflow: visible !important; }
            .print-wrapper { position: static !important; overflow: visible !important; background: white !important; display: block !important; }
            @page { margin: 10mm; size: A4 portrait; }
          }
          .sheet-container {
            width: 210mm;
            min-height: 297mm;
            margin: 2rem auto;
            background: white;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          .schedule-table th, .schedule-table td {
            border: 1px solid #000;
            padding: 12px;
            text-align: center;
          }
          .schedule-table th {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-weight: bold;
          }
        `}
      </style>

      <div className="sheet-container">
        <div style={{ textAlign: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#b91c1c', textTransform: 'uppercase', fontFamily: "'Arial Black', Impact, sans-serif" }}>{settings?.schoolName || 'MN Public School'}</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e3a8a', fontWeight: 'bold' }}>{settings?.recognitionText || 'Affiliated to CBSE, New Delhi'}</p>
          <h2 style={{ margin: '20px 0 0 0', fontSize: '22px', textDecoration: 'underline' }}>EXAMINATION DATE SHEET</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
          <div>Exam Term: <span style={{ color: '#1e3a8a' }}>{scheduleData.examTerm}</span></div>
          <div>Class: <span style={{ color: '#1e3a8a' }}>{scheduleData.classId}</span></div>
        </div>

        <table className="schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Subject</th>
              <th>Timings</th>
            </tr>
          </thead>
          <tbody>
            {[...scheduleData.schedule].sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            }).map((item, idx) => {
              const dateObj = item.date ? new Date(item.date) : null;
              const day = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { weekday: 'long' }) : '-';
              const dateStr = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : '-'; // DD/MM/YYYY
              return (
                <tr key={idx}>
                  <td>{dateStr}</td>
                  <td>{day}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.subject}</td>
                  <td>{item.startTime} - {item.endTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: '50px', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>General Instructions for Students:</p>
          <textarea 
            style={{ width: '100%', minHeight: '120px', border: '1px dashed #ccc', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', marginTop: '10px' }} 
            className="editable-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <style>{`
            @media print {
               .editable-instructions { border: none !important; resize: none !important; overflow: hidden !important; background: transparent !important; }
            }
          `}</style>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Class Teacher</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', width: '150px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSheetPrintView;
