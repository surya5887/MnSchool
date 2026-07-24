import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getStudentById, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { getTransactions, addTransaction, type TransactionData } from '../services/financeService';
import Modal from '../components/Modal';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentClass, setStudentClass] = useState<ClassData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [newFine, setNewFine] = useState({ amount: '', description: '', type: 'Late Fine' });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const studentData = await getStudentById(id);
        if (studentData) {
          setStudent(studentData);
          
          // Fetch class for fee structure
          const classes = await getClasses();
          const cls = classes.find(c => c.id === studentData.classId);
          if (cls) setStudentClass(cls);

          // Fetch student specific transactions (both payments and fines)
          const txns = await getTransactions({ studentId: id });
          setTransactions(txns);
        }
      } catch (error) {
        console.error("Error fetching student details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newFine.amount) return;

    try {
      await addTransaction({
        type: 'Income',
        category: 'Custom Fine / Charge',
        amount: -Math.abs(Number(newFine.amount)), // Negative income represents a charge due
        date: new Date().toISOString().split('T')[0],
        description: `[${newFine.type}] ${newFine.description}`,
        paymentMethod: 'Cash', // N/A
        studentId: id
      });
      setIsFineModalOpen(false);
      setNewFine({ amount: '', description: '', type: 'Late Fine' });
      // Refresh txns
      const txns = await getTransactions({ studentId: id });
      setTransactions(txns);
    } catch (error) {
      console.error("Error adding fine", error);
    }
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!student) return <div>Student not found.</div>;

  // Calculate Due logic:
  // Base fee from class
  let baseFeeTotal = 0;
  if (studentClass && studentClass.fees) {
    baseFeeTotal = studentClass.fees.reduce((sum, f) => sum + f.amount, 0);
  }

  // Fees paid (+ amount in Income), Fines charged (- amount in Income)
  const totalPaid = transactions
    .filter(t => t.type === 'Income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const customCharges = transactions
    .filter(t => t.type === 'Income' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const pendingDues = (baseFeeTotal + customCharges) - totalPaid;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '24px', background: 'transparent', border: 'none', padding: 0 }}>
        <ArrowLeft size={20} /> Back to Directory
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column - Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary)', 
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontSize: '3rem', fontWeight: 600, overflow: 'hidden'
            }}>
              {student.photoUrl ? <img src={student.photoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.firstName[0]}
            </div>
            <h2 style={{ margin: '0 0 8px 0' }}>{student.firstName} {student.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>{studentClass?.className} - {student.sectionId} | Roll: {student.rollNumber}</p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>{student.status}</span>
              {student.transportRoute && <span className="badge warning">Bus: {student.transportRoute}</span>}
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0' }}>Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <User size={18} /> <span>Parent: {student.parentName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Phone size={18} /> <span>{student.parentPhone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Mail size={18} /> <span>{student.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Ledgers and Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fee Overview */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={20} className="text-primary" /> Financial Ledger
              </h3>
              <button className="btn-secondary" onClick={() => setIsFineModalOpen(true)}>
                <Plus size={16} /> Add Fine/Charge
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Base Class Fee</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{baseFeeTotal}</div>
               </div>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Total Paid</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{totalPaid}</div>
               </div>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Pending Dues</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{pendingDues}</div>
               </div>
            </div>

            <h4 style={{ margin: '0 0 12px 0' }}>Recent Transactions</h4>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No transactions or charges recorded.</p>
            ) : (
              <div className="glass-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Method</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>{t.description}</td>
                        <td>{t.amount > 0 ? t.paymentMethod : 'Charge'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {t.amount > 0 ? `+ ₹${t.amount}` : `- ₹${Math.abs(t.amount)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} className="text-primary" /> Documents
            </h3>
            {student.documents && student.documents.length > 0 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {student.documents.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noreferrer" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} /> {doc.name}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No documents uploaded.</p>
            )}
          </div>

        </div>
      </div>

      <Modal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} title="Add Custom Charge / Fine">
        <form onSubmit={handleAddFine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} /> This will add to the student's pending dues.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Charge Type</label>
            <select className="glass-input" value={newFine.type} onChange={e => setNewFine({...newFine, type: e.target.value})}>
              <option>Late Fine</option>
              <option>Damage Fine</option>
              <option>Library Fine</option>
              <option>Custom Charge</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input required type="text" className="glass-input" value={newFine.description} onChange={e => setNewFine({...newFine, description: e.target.value})} placeholder="e.g. Broken lab equipment" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newFine.amount} onChange={e => setNewFine({...newFine, amount: e.target.value})} placeholder="e.g. 500" />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsFineModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Add Charge</button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};

export default StudentProfile;
