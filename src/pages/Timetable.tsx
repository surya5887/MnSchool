import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTimetable, assignPeriod, removePeriod, getTimetableStructure, saveTimetableStructure, type TimetableEntry } from '../services/timetableService';
import { getClasses, type ClassData } from '../services/classService';
import { Plus, Clock, Printer } from 'lucide-react';
import Modal from '../components/Modal';
import './Timetable.css';

const Timetable: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const [classFilter, setClassFilter] = useState('');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [assignment, setAssignment] = useState({
    day: '',
    periodIndex: 0,
    subject: '',
    teacher: ''
  });
  const [editingEntryExists, setEditingEntryExists] = useState(false);

  const [days, setDays] = useState<{name: string, isHoliday: boolean}[]>([
    {name: 'Monday', isHoliday: false}, 
    {name: 'Tuesday', isHoliday: false}, 
    {name: 'Wednesday', isHoliday: false}, 
    {name: 'Thursday', isHoliday: false}, 
    {name: 'Friday', isHoliday: false}, 
    {name: 'Saturday', isHoliday: false}
  ]);
  const [periods, setPeriods] = useState<{name: string, isBreak: boolean}[]>([
    { name: 'P1 (08:00)', isBreak: false },
    { name: 'P2 (08:45)', isBreak: false },
    { name: 'P3 (09:30)', isBreak: false },
    { name: 'Break', isBreak: true },
    { name: 'P4 (10:30)', isBreak: false },
    { name: 'P5 (11:15)', isBreak: false },
    { name: 'P6 (12:00)', isBreak: false }
  ]);

  // Structure Edit Modals State
  const [editPeriodModalOpen, setEditPeriodModalOpen] = useState(false);
  const [editDayModalOpen, setEditDayModalOpen] = useState(false);
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [periodFormData, setPeriodFormData] = useState({ name: '', isBreak: false });
  const [dayFormData, setDayFormData] = useState({ name: '', isHoliday: false });

  const fetchTimetableAndStructure = async (cid: string) => {
    if (!cid) return;
    try {
      const [data, structure] = await Promise.all([
        getTimetable(cid),
        getTimetableStructure(cid)
      ]);
      setTimetable(data);
      if (structure) {
        // Map string days to object for backward compatibility
        const mappedDays = structure.days.map((d: any) => 
          typeof d === 'string' ? { name: d, isHoliday: false } : d
        );
        setDays(mappedDays);
        setPeriods(structure.periods);
      } else {
        // Defaults
        setDays([
          {name: 'Monday', isHoliday: false}, 
          {name: 'Tuesday', isHoliday: false}, 
          {name: 'Wednesday', isHoliday: false}, 
          {name: 'Thursday', isHoliday: false}, 
          {name: 'Friday', isHoliday: false}, 
          {name: 'Saturday', isHoliday: false}
        ]);
        setPeriods([
          { name: 'P1 (08:00)', isBreak: false },
          { name: 'P2 (08:45)', isBreak: false },
          { name: 'P3 (09:30)', isBreak: false },
          { name: 'Break', isBreak: true },
          { name: 'P4 (10:30)', isBreak: false },
          { name: 'P5 (11:15)', isBreak: false },
          { name: 'P6 (12:00)', isBreak: false }
        ]);
      }
    } catch (error) {
      console.error("Error fetching timetable data", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const classData = await getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          const defaultClass = classData[0].className;
          setClassFilter(defaultClass);
          fetchTimetableAndStructure(defaultClass);
        }
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };
    initData();
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setClassFilter(val);
    fetchTimetableAndStructure(val);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignPeriod({
        classId: classFilter,
        ...assignment,
        periodIndex: Number(assignment.periodIndex)
      });
      setIsModalOpen(false);
      fetchTimetableAndStructure(classFilter);
    } catch (error) {
      console.error("Error assigning period", error);
    }
  };

  const handleClearPeriod = async () => {
    try {
      await removePeriod(classFilter, assignment.day, assignment.periodIndex);
      setIsModalOpen(false);
      fetchTimetableAndStructure(classFilter);
    } catch (error) {
      console.error("Error clearing period", error);
    }
  };

  const saveStructure = async (newDays: {name: string, isHoliday: boolean}[], newPeriods: {name: string, isBreak: boolean}[]) => {
    try {
      await saveTimetableStructure(classFilter, { days: newDays, periods: newPeriods });
    } catch (error) {
      console.error("Error saving structure", error);
    }
  };

  // --- Period Management ---
  const handleAddPeriod = () => {
    setEditingPeriodIndex(null);
    setPeriodFormData({ name: `P${periods.length + 1}`, isBreak: false });
    setEditPeriodModalOpen(true);
  };

  const handleEditPeriod = (index: number) => {
    setEditingPeriodIndex(index);
    setPeriodFormData(periods[index]);
    setEditPeriodModalOpen(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newPeriods = [...periods];
    if (editingPeriodIndex !== null) {
      newPeriods[editingPeriodIndex] = periodFormData;
    } else {
      newPeriods.push(periodFormData);
    }
    setPeriods(newPeriods);
    setEditPeriodModalOpen(false);
    saveStructure(days, newPeriods);
  };

  const handleDeletePeriod = () => {
    if (editingPeriodIndex === null) return;
    if (window.confirm("Delete this period? Assigned teachers in this column will be orphaned.")) {
      const newPeriods = periods.filter((_, i) => i !== editingPeriodIndex);
      setPeriods(newPeriods);
      setEditPeriodModalOpen(false);
      saveStructure(days, newPeriods);
    }
  };

  // --- Day Management ---
  const handleAddDay = () => {
    setEditingDayIndex(null);
    setDayFormData({ name: 'New Day', isHoliday: false });
    setEditDayModalOpen(true);
  };

  const handleEditDay = (index: number) => {
    setEditingDayIndex(index);
    setDayFormData(days[index]);
    setEditDayModalOpen(true);
  };

  const handleSaveDay = (e: React.FormEvent) => {
    e.preventDefault();
    const newDays = [...days];
    if (editingDayIndex !== null) {
      newDays[editingDayIndex] = dayFormData;
    } else {
      newDays.push(dayFormData);
    }
    setDays(newDays);
    setEditDayModalOpen(false);
    saveStructure(newDays, periods);
  };

  const handleDeleteDay = () => {
    if (editingDayIndex === null) return;
    if (window.confirm("Delete this day? Assignments for this day will be orphaned.")) {
      const newDays = days.filter((_, i) => i !== editingDayIndex);
      setDays(newDays);
      setEditDayModalOpen(false);
      saveStructure(newDays, periods);
    }
  };

  const handleCellClick = (day: string, periodIndex: number, existingEntry: TimetableEntry | undefined) => {
    setAssignment({
      day,
      periodIndex,
      subject: existingEntry ? existingEntry.subject : '',
      teacher: existingEntry ? existingEntry.teacher : ''
    });
    setEditingEntryExists(!!existingEntry);
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><Clock size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Class Timetable</h1>
          <p className="page-subtitle">Visually manage and print daily schedules for teachers and students.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print Routine</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Class to View Timetable</label>
          <select className="glass-input" value={classFilter} onChange={handleClassChange} disabled={role === 'Teacher'}>
            {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
           <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Class Teacher: <strong>{classes.find(c => c.className === classFilter)?.classTeacher || 'Not Assigned'}</strong></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${periods.length}, 1fr) 60px`, gap: '8px', minWidth: '800px' }}>
          
          {/* Header Row */}
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', padding: '12px', textAlign: 'center' }}>Day</div>
          {periods.map((p, i) => (
             <div 
                key={i} 
                onClick={() => handleEditPeriod(i)}
                className="timetable-header-cell"
                style={{ background: p.isBreak ? 'transparent' : 'rgba(99, 102, 241, 0.1)', color: p.isBreak ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 600, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition)' }}
                title="Click to Edit Period"
             >
               {p.name}
             </div>
          ))}
          <div 
             onClick={handleAddPeriod}
             className="timetable-add-cell"
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}
             title="Add Period"
          >
             <Plus size={20} />
          </div>

          {/* Timetable Rows */}
          {days.map((day, dIndex) => (
            <React.Fragment key={dIndex}>
              <div 
                onClick={() => handleEditDay(dIndex)}
                className="timetable-header-cell"
                style={{ fontWeight: 600, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: day.isHoliday ? 'rgba(255, 99, 132, 0.1)' : 'rgba(255,255,255,0.4)', color: day.isHoliday ? 'var(--danger)' : 'inherit', borderRadius: '8px', cursor: 'pointer' }}
                title="Click to Edit Day"
              >
                {day.name}
              </div>
              
              {day.isHoliday ? (
                 <div style={{ gridColumn: `span ${periods.length + 1}`, background: 'rgba(255, 99, 132, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                   Holiday / Off-Day
                 </div>
              ) : (
                <>
                  {periods.map((p, i) => {
                    if (p.isBreak) {
                       return <div key={`${day.name}-${i}`} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}></div>;
                    }
                    
                    const entry = timetable.find(t => t.day === day.name && t.periodIndex === i);

                    return (
                      <div 
                        key={`${day.name}-${i}`} 
                        className="glass-card timetable-cell" 
                        style={{ padding: '12px', textAlign: 'center', position: 'relative', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'var(--transition)' }}
                        onClick={() => handleCellClick(day.name, i, entry)}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: entry ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {entry ? entry.subject : 'Free'}
                        </div>
                        {entry && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{entry.teacher}</div>}
                        {!entry && <div className="assign-hint" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', opacity: 0, transition: 'var(--transition)' }}>+ Assign</div>}
                      </div>
                    )
                  })}
                  <div></div> {/* Empty cell under the + Period button */}
                </>
              )}
            </React.Fragment>
          ))}

          {/* Add Day Row */}
          <div 
            onClick={handleAddDay}
            className="timetable-add-cell"
            style={{ fontWeight: 600, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Add Day"
          >
            <Plus size={20} />
          </div>
          {/* Fill the rest of the bottom row with empty space */}
          {periods.map((_, i) => <div key={`empty-${i}`}></div>)}
          <div></div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assign: ${assignment.day} - ${periods[assignment.periodIndex]?.name}`}>
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Subject</label>
            <select required className="glass-input" value={assignment.subject} onChange={e => setAssignment({...assignment, subject: e.target.value})}>
              <option value="">-- Select Subject --</option>
              {classes.find(c => c.className === classFilter)?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Teacher Initials / Name</label>
            <input required type="text" className="glass-input" value={assignment.teacher} onChange={e => setAssignment({...assignment, teacher: e.target.value})} placeholder="e.g. S.M." />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'space-between' }}>
            {editingEntryExists ? (
              <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleClearPeriod}>Clear Period</button>
            ) : <div></div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Assignment</button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Period Modal */}
      <Modal isOpen={editPeriodModalOpen} onClose={() => setEditPeriodModalOpen(false)} title={editingPeriodIndex !== null ? "Edit Period" : "Add Period"}>
        <form onSubmit={handleSavePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Period Name</label>
            <input required type="text" className="glass-input" value={periodFormData.name} onChange={e => setPeriodFormData({...periodFormData, name: e.target.value})} placeholder="e.g. P1 (08:00)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isBreak" checked={periodFormData.isBreak} onChange={e => setPeriodFormData({...periodFormData, isBreak: e.target.checked})} />
            <label htmlFor="isBreak">This is a Break period (No assignments allowed)</label>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'space-between' }}>
            {editingPeriodIndex !== null ? (
              <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDeletePeriod}>Delete Period</button>
            ) : <div></div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setEditPeriodModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Day Modal */}
      <Modal isOpen={editDayModalOpen} onClose={() => setEditDayModalOpen(false)} title={editingDayIndex !== null ? "Edit Day" : "Add Day"}>
        <form onSubmit={handleSaveDay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Day Name</label>
            <input required type="text" className="glass-input" value={dayFormData.name} onChange={e => setDayFormData({...dayFormData, name: e.target.value})} placeholder="e.g. Sunday" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isHoliday" checked={dayFormData.isHoliday} onChange={e => setDayFormData({...dayFormData, isHoliday: e.target.checked})} />
            <label htmlFor="isHoliday">This is a Holiday / Off-Day</label>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'space-between' }}>
            {editingDayIndex !== null ? (
              <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDeleteDay}>Delete Day</button>
            ) : <div></div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setEditDayModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Timetable;

