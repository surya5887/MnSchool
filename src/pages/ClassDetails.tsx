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
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sectionStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students found in Section {activeSection}.
                  </td>
                </tr>
              ) : (
                sectionStudents.map((student, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>{student.rollNumber}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{student.admissionNo}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt={student.firstName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500 }}>
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{student.gender}</td>
                    <td>
                      <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/students/${student.id}`); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .clickable-row:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default ClassDetails;
