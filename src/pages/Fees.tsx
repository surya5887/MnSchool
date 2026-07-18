import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Check } from 'lucide-react';
import { feeTransactions, expenses, students } from '../data/mockData';
import Modal from '../components/Modal';

const Fees: React.FC = () => {
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saved, setSaved] = useState(false);

  // Auto-find student for the awesome 1-click collect experience
  const foundStudent = students.find(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 2);

  const handleSuccess = () => {
    setCollectModalOpen(false);
    setExpenseModalOpen(false);
    setSaved(true);
    setSearchQuery('');
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
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹14,500</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Bank / UPI (Today)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹32,000</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Today's Expenses</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹4,500</div>
        </div>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Pending Fees (All)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹85,000</div>
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
                    <td style={{ fontWeight: 500 }}>{txn.student}</td>
                    <td>{txn.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>+₹{txn.amount}</td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)' }}>{txn.method}</span></td>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.date}</div>
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
              <img src={`https://ui-avatars.com/api/?name=${foundStudent.name}&background=random`} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{foundStudent.name}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{foundStudent.class} • Roll: {foundStudent.roll}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending Dues</div>
                <div style={{ color: 'var(--danger)', fontSize: '1.4rem', fontWeight: 700 }}>₹2,500</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Payment Method</label>
              <select className="glass-input">
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSuccess}>
              Collect ₹2,500 & Generate Receipt
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
            <select className="glass-input">
              <option>Stationary</option>
              <option>Electricity</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Amount (₹)</label>
            <input type="number" className="glass-input" placeholder="e.g. 500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
            <input type="text" className="glass-input" placeholder="What was this for?" />
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={handleSuccess}>
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
