import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Check } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { getTransactions, addTransaction, type TransactionData } from '../services/financeService';
import Modal from '../components/Modal';

const Fees: React.FC = () => {
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saved, setSaved] = useState(false);
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  // Collect Fee form state
  const [feeMethod, setFeeMethod] = useState<'Cash'|'Bank Transfer'|'UPI'>('Cash');
  const [feeAmount, setFeeAmount] = useState<number>(0);

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState('Stationary');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDesc, setExpenseDesc] = useState('');

  const fetchData = async () => {
    try {
      const studentData = await getStudents();
      setStudents(studentData);
      const classData = await getClasses();
      setClasses(classData);
      const txnData = await getTransactions();
      setTransactions(txnData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const feeTransactions = transactions.filter(t => t.type === 'Income');
  const expenses = transactions.filter(t => t.type === 'Expense');

  // Calculate dynamic stats
  const today = new Date().toISOString().split('T')[0];
  const cashInHand = transactions.filter(t => t.paymentMethod === 'Cash' && t.type === 'Income' && t.date.startsWith(today)).reduce((sum, t) => sum + t.amount, 0);
  const bankUpi = transactions.filter(t => (t.paymentMethod === 'Bank Transfer' || t.paymentMethod === 'UPI') && t.type === 'Income' && t.date.startsWith(today)).reduce((sum, t) => sum + t.amount, 0);
  const todaysExpenses = transactions.filter(t => t.type === 'Expense' && t.date.startsWith(today)).reduce((sum, t) => sum + t.amount, 0);
  
  let totalPendingFees = 0;
  students.forEach(student => {
    const studentClass = classes.find(c => c.id === student.classId);
    let baseFeeTotal = 0;
    if (studentClass && studentClass.fees) {
      baseFeeTotal = studentClass.fees.reduce((sum, f) => sum + f.amount, 0);
    }
    const studentTxns = transactions.filter(t => t.studentId === student.id);
    const totalPaid = studentTxns.filter(t => t.type === 'Income' && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const customCharges = studentTxns.filter(t => t.type === 'Income' && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const pending = (baseFeeTotal + customCharges) - totalPaid;
    if (pending > 0) totalPendingFees += pending;
  });

  const foundStudent = students.find(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 2
  );

  let foundStudentPendingDues = 0;
  if (foundStudent) {
    const studentClass = classes.find(c => c.id === foundStudent.classId);
    let baseFeeTotal = 0;
    if (studentClass && studentClass.fees) {
      baseFeeTotal = studentClass.fees.reduce((sum, f) => sum + f.amount, 0);
    }
    const studentTxns = transactions.filter(t => t.studentId === foundStudent.id);
    const totalPaid = studentTxns.filter(t => t.type === 'Income' && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const customCharges = studentTxns.filter(t => t.type === 'Income' && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    foundStudentPendingDues = (baseFeeTotal + customCharges) - totalPaid;
  }

  const handleCollectFee = async () => {
    if (!foundStudent) return;
    await addTransaction({
      type: 'Income',
      category: 'Fee Collection',
      amount: feeAmount,
      date: new Date().toISOString(),
      description: `Fee collected from ${foundStudent.firstName} ${foundStudent.lastName}`,
      paymentMethod: feeMethod,
      studentId: foundStudent.id
    });
    setCollectModalOpen(false);
    setSaved(true);
    setSearchQuery('');
    fetchData();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogExpense = async () => {
    if (!expenseAmount) return;
    await addTransaction({
      type: 'Expense',
      category: expenseCategory,
      amount: expenseAmount,
      date: new Date().toISOString(),
      description: expenseDesc,
      paymentMethod: 'Cash', // default for petty expenses
    });
    setExpenseModalOpen(false);
    setSaved(true);
    setExpenseAmount(0);
    setExpenseDesc('');
    fetchData();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Finance & Cash Register</h1>
          <p className="page-subtitle">Track collections, manage daily expenses, and automate accounting.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setExpenseModalOpen(true)}>
            <PlusCircle size={20} /> Log Expense
          </button>
          <button className="btn-primary" onClick={() => setCollectModalOpen(true)}>
            <PlusCircle size={20} /> Collect Fee
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Cash in Hand (Today)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{cashInHand.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Bank / UPI (Today)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{bankUpi.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Today's Expenses</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{todaysExpenses.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Pending Fees (All)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{totalPendingFees.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Fees Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Fee Collections</h3>
            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>View All</button>
          </div>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {feeTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: 500 }}>{txn.description}</td>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>+₹{txn.amount}</td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)' }}>{txn.paymentMethod}</span></td>
                    <td><button style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: 0 }}>Recent Expenses</h3>
          </div>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{exp.category}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(exp.date).toLocaleDateString()} - {exp.description}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--danger)', textAlign: 'right' }}>-₹{exp.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collect Fee Modal */}
      <Modal isOpen={isCollectModalOpen} onClose={() => setCollectModalOpen(false)} title="1-Click Fee Collection">
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Search for a student to automatically calculate their pending dues.</p>
        
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Type student name (e.g. 'Priya')..." 
            className="glass-input" 
            style={{ paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {foundStudent ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img src={foundStudent.photoUrl || `https://ui-avatars.com/api/?name=${foundStudent.firstName}+${foundStudent.lastName}&background=random`} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{foundStudent.firstName} {foundStudent.lastName}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{foundStudent.classId} {foundStudent.sectionId} • Roll: {foundStudent.rollNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending Dues</div>
                <div style={{ color: foundStudentPendingDues > 0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.4rem', fontWeight: 700 }}>₹{foundStudentPendingDues}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Payment Method</label>
              <select className="glass-input" value={feeMethod} onChange={e => setFeeMethod(e.target.value as any)}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Amount to Collect (₹)</label>
              <input type="number" className="glass-input" value={feeAmount || ''} onChange={e => setFeeAmount(Number(e.target.value))} placeholder="e.g. 1500" />
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCollectFee}>
              Collect ₹{feeAmount} & Generate Receipt
            </button>
          </motion.div>
        ) : searchQuery.length > 2 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No student found.</div>
        ) : null}
      </Modal>

      {/* Log Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Log Daily Expense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Category</label>
            <select className="glass-input" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
              <option>Stationary</option>
              <option>Electricity</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Amount (₹)</label>
            <input type="number" className="glass-input" placeholder="e.g. 500" value={expenseAmount || ''} onChange={e => setExpenseAmount(Number(e.target.value))} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
            <input type="text" className="glass-input" placeholder="What was this for?" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={handleLogExpense}>
            Save Expense
          </button>
        </div>
      </Modal>

      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              background: 'var(--success)', color: 'white',
              padding: '16px 24px', borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <Check size={24} /> Action completed successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Fees;
