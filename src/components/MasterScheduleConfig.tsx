import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { getExamSchedulesByClass, saveExamSchedule, type ExamScheduleData } from '../services/examService';

interface Props {
  examTerm: string;
  allClasses: { className: string }[];
  onBack: () => void;
  onPreview: (data: ExamScheduleData) => void;
}

const MasterScheduleConfig: React.FC<Props> = ({ examTerm, allClasses, onBack, onPreview }) => {
  const [loading, setLoading] = useState(true);
  const [masterClasses, setMasterClasses] = useState<string[]>([]);
  const [rows, setRows] = useState<{ date: string, subjects: Record<string, string> }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMaster = async () => {
      const existing = await getExamSchedulesByClass('MASTER');
      const termSched = existing.find(s => s.examTerm === examTerm);
      if (termSched && termSched.schedule.length > 0) {
        // Parse the packed data
        try {
          const firstRow = JSON.parse(termSched.schedule[0].subject);
          setMasterClasses(firstRow.classes || []);
          
          const loadedRows = termSched.schedule.map(item => {
            const parsed = JSON.parse(item.subject);
            return {
              date: item.date,
              subjects: parsed.subjects || {}
            };
          });
          setRows(loadedRows);
        } catch (e) {
          console.error("Failed to parse master schedule", e);
        }
      } else {
        // Default: include all classes up to Class VIII
        const defaults = allClasses.map(c => c.className).slice(0, 10);
        setMasterClasses(defaults);
        setRows([ { date: '', subjects: {} } ]);
      }
      setLoading(false);
    };
    loadMaster();
  }, [examTerm, allClasses]);

  const toggleClass = (cName: string) => {
    if (masterClasses.includes(cName)) {
      setMasterClasses(prev => prev.filter(c => c !== cName));
    } else {
      setMasterClasses(prev => [...prev, cName]);
    }
  };

  const addRow = () => setRows(prev => [...prev, { date: '', subjects: {} }]);
  const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

  const updateDate = (index: number, val: string) => {
    const newRows = [...rows];
    newRows[index].date = val;
    setRows(newRows);
  };

  const updateSubject = (rowIndex: number, cName: string, val: string) => {
    const newRows = [...rows];
    if (!newRows[rowIndex].subjects) newRows[rowIndex].subjects = {};
    newRows[rowIndex].subjects[cName] = val;
    setRows(newRows);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const schedule = rows.map(r => ({
      date: r.date,
      startTime: '',
      endTime: '',
      subject: JSON.stringify({
        classes: masterClasses,
        subjects: r.subjects
      })
    }));

    const data: ExamScheduleData = {
      classId: 'MASTER',
      examTerm,
      schedule
    };

    await saveExamSchedule(data);
    setIsSaving(false);
  };

  if (loading) return <div>Loading master schedule...</div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={onBack}>
          <ArrowLeft size={20} /> Back
        </button>
        <div>
          <h2 style={{ margin: 0 }}>Master Date Sheet Editor</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Term: {examTerm}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>Select Classes to Include</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {allClasses.map(c => (
            <button
              key={c.className}
              onClick={() => toggleClass(c.className)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid ' + (masterClasses.includes(c.className) ? 'var(--primary-color)' : '#ddd'),
                background: masterClasses.includes(c.className) ? 'var(--primary-color)' : 'transparent',
                color: masterClasses.includes(c.className) ? 'white' : 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              {c.className}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', width: '150px' }}>Date</th>
              {masterClasses.map(c => (
                <th key={c} style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #eee' }}>{c}</th>
              ))}
              <th style={{ padding: '12px', borderBottom: '2px solid #eee', width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  <input type="date" className="glass-input" style={{ width: '100%', margin: 0 }} value={row.date} onChange={e => updateDate(i, e.target.value)} />
                </td>
                {masterClasses.map(c => (
                  <td key={c} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <input type="text" className="glass-input" style={{ width: '100%', margin: 0, textAlign: 'center' }} placeholder="Subject" value={row.subjects[c] || ''} onChange={e => updateSubject(i, c, e.target.value)} />
                  </td>
                ))}
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <button className="btn-secondary" style={{ padding: '6px', color: 'red' }} onClick={() => removeRow(i)}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={addRow}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Add Row
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={20} style={{ marginRight: '8px' }} /> {isSaving ? 'Saving...' : 'Save Master Schedule'}
        </button>
        <button className="btn-secondary" onClick={() => {
          const schedule = rows.map(r => ({ date: r.date, startTime: '', endTime: '', subject: JSON.stringify({ classes: masterClasses, subjects: r.subjects }) }));
          onPreview({ classId: 'MASTER', examTerm, schedule });
        }}>
          <Printer size={20} style={{ marginRight: '8px' }} /> Preview & Print
        </button>
      </div>
    </motion.div>
  );
};

export default MasterScheduleConfig;
