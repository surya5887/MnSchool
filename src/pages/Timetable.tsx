import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Printer, Plus } from 'lucide-react';

const Timetable: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = ['P1 (08:00)', 'P2 (08:45)', 'P3 (09:30)', 'Break', 'P4 (10:30)', 'P5 (11:15)', 'P6 (12:00)'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><Clock size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Class Timetable</h1>
          <p className="page-subtitle">Visually manage and print daily schedules for teachers and students.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary"><Printer size={18} /> Print Routine</button>
          <button className="btn-primary"><Plus size={18} /> Assign Teacher</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Class to View Timetable</label>
          <select className="glass-input" defaultValue="10A">
            <option value="10A">Class 10 - Section A</option>
            <option value="9A">Class 9 - Section A</option>
            <option value="8B">Class 8 - Section B</option>
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
           <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Class Teacher: <strong>Aditi Sharma</strong></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${periods.length}, 1fr)`, gap: '8px', minWidth: '800px' }}>
          
          {/* Header Row */}
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', padding: '12px', textAlign: 'center' }}>Day</div>
          {periods.map(p => (
             <div key={p} style={{ background: p === 'Break' ? 'transparent' : 'rgba(99, 102, 241, 0.1)', color: p === 'Break' ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 600, padding: '12px', textAlign: 'center', borderRadius: '8px' }}>
               {p}
             </div>
          ))}

          {/* Timetable Rows */}
          {days.map(day => (
            <React.Fragment key={day}>
              <div style={{ fontWeight: 600, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>{day}</div>
              
              {periods.map((p, i) => {
                if (p === 'Break') {
                   return <div key={`${day}-${i}`} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}></div>;
                }
                
                // Mock Subjects
                let subject = "Maths";
                let teacher = "R.K.";
                if (i === 1) { subject = "Science"; teacher = "S.M."; }
                if (i === 2) { subject = "English"; teacher = "A.S."; }
                if (i === 4) { subject = "Hindi"; teacher = "P.K."; }
                if (i === 5) { subject = "SST"; teacher = "D.P."; }
                if (i === 6) { subject = "Games"; teacher = "P.T."; }

                return (
                  <div key={`${day}-${i}`} className="glass-card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{subject}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{teacher}</div>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Timetable;
