import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { getClassById, type ClassData } from '../services/classService';
import { getStudents, type StudentData } from '../services/studentService';

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const cls = await getClassById(id);
        if (cls) {
          setClassData(cls);
          if (cls.sections && cls.sections.length > 0) {
            setActiveSection(cls.sections[0]);
          }
          const students = await getStudents();
          // Filter students who are active and in this class
          const classStudents = students.filter(s => s.classId === cls.className);
          setAllStudents(classStudents);
        }
      } catch (error) {
        console.error("Error fetching class details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Class Details...</div>;
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Class not found.</div>;
  }

  // Filter students for the active section
  const sectionStudents = allStudents.filter(s => s.sectionId === activeSection);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={18} /> Back to Classes
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Class {classData.className}</h1>
          <p className="page-subtitle">Class Teacher: {classData.classTeacher || 'Not Assigned'}</p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{allStudents.length}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Students</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Section Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.2)' }}>
          {classData.sections.length === 0 ? (
            <div style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>No sections defined.</div>
          ) : (
            classData.sections.map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: activeSection === sec ? 'rgba(255,255,255,0.7)' : 'transparent',
                  border: 'none',
                  borderBottom: activeSection === sec ? '3px solid var(--primary-color)' : '3px solid transparent',
                  fontWeight: activeSection === sec ? 700 : 500,
                  color: activeSection === sec ? 'var(--primary-color)' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Section {sec} ({allStudents.filter(s => s.sectionId === sec).length})
              </button>
            ))
          )}
        </div>

        {/* Students Table */}
        <div className="students-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {sectionStudents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No students found in Section {activeSection}.
              </div>
            ) : sectionStudents.map((student, idx) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                onClick={() => navigate(`/student/${student.id}`)}
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt={student.firstName} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.firstName} {student.lastName}
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.gender || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '0.65rem', background: student.status === 'Active' ? '#dcfce7' : '#fee2e2', color: student.status === 'Active' ? '#15803d' : '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Row: Roll & Adm */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '10px 12px', borderRadius: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.rollNumber || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adm No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.admissionNo || '-'}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/student/${student.id}`); }} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#3b82f6', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      <style>{`
        @media (max-width: 768px) {
          .students-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }

        .clickable-row:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default ClassDetails;
