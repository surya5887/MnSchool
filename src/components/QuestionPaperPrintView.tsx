import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { QuestionPaperData } from '../services/examService';

interface QuestionPaperProps {
  paperData: QuestionPaperData;
  onClose: () => void;
}

const QuestionPaperPrintView: React.FC<QuestionPaperProps> = ({ paperData, onClose }) => {
  return (
    <div className="print-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      <div className="print-hide" style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn-secondary" onClick={onClose}>
          <ArrowLeft size={20} /> Back
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={20} /> Print Question Paper
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
            @page { margin: 10mm; size: A4 portrait; }
            
            .paper-container {
              margin: 0 auto !important;
              padding: 40px !important;
              width: 800px !important;
              max-width: 800px !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              height: auto !important;
              min-height: 1130px !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
          
          @media screen {
            .paper-container {
              width: 800px !important;
              max-width: 800px !important;
              min-height: 1130px !important;
              margin: 2rem auto;
              background: white;
              padding: 40px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              position: relative;
              box-sizing: border-box;
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              color: #000;
            }
          }
          
          @media screen and (max-width: 768px) {
            .print-wrapper {
              overflow-x: auto !important;
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .paper-container {
              zoom: 0.45;
              -moz-transform: scale(0.45);
              -moz-transform-origin: top center;
              margin: 1rem auto;
            }
          }
          .header-table {
            width: 100%;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .header-table td {
            padding: 4px 0;
          }
        `}
      </style>

      <div className="paper-container">
        {/* School Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase' }}>MN PUBLIC SCHOOL</h1>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{paperData.examTerm} (2026-27)</h2>
        </div>

        {/* Paper Details Table */}
        <table className="header-table">
          <tbody>
            <tr>
              <td style={{ textAlign: 'left', width: '33%' }}>Class: {paperData.classId} {paperData.sectionId || ''}</td>
              <td style={{ textAlign: 'center', width: '33%', fontSize: '18px', textDecoration: 'underline' }}>{paperData.subject}</td>
              <td style={{ textAlign: 'right', width: '33%' }}>Max Marks: {paperData.maxMarks}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ textAlign: 'left', paddingTop: '10px' }}>Time Allowed: {paperData.timeAllowed}</td>
            </tr>
          </tbody>
        </table>

        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '0 0 20px 0' }} />

        {/* General Instructions */}
        {paperData.generalInstructions && paperData.generalInstructions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>General Instructions:</div>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
              {paperData.generalInstructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections and Questions */}
        <div style={{ marginTop: '30px' }}>
          {paperData.sections.map((section, sIdx) => {
            let qCounter = 1;
            return (
              <div key={sIdx} style={{ marginBottom: '30px' }}>
                {section.sectionTitle && (
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: '20px 0', textDecoration: 'underline' }}>
                    {section.sectionTitle}
                  </div>
                )}
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {section.questions.map((q, qIdx) => {
                      if (q.type === 'instruction') {
                        return (
                          <tr key={qIdx}>
                            <td colSpan={3} style={{ padding: '12px 0', fontWeight: 'bold' }}>
                              <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br/>') }} />
                            </td>
                          </tr>
                        );
                      }
                      
                      const currentQNum = qCounter++;
                      return (
                        <tr key={qIdx}>
                          <td style={{ verticalAlign: 'top', width: '40px', padding: '8px 0', fontWeight: 'bold' }}>Q{currentQNum}.</td>
                          <td style={{ verticalAlign: 'top', padding: '8px 10px', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                            <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br/>') }} />
                            {q.type === 'objective' && q.options && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx}>({['a', 'b', 'c', 'd'][optIdx]}) {opt}</div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'top', width: '50px', padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>[{q.marks}]</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        
        {/* Footer line */}
        <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
          --- End of Question Paper ---
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperPrintView;
