import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, TrendingDown, BookOpen, Plus, Trash2 } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, type TransactionData } from '../services/financeService';
import { getSchoolSettings } from '../services/settingsService';
import Modal from '../components/Modal';

const getISTDateTimeLocalString = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'}));
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getDate()).padStart(2, '0');
  const hh = String(istTime.getHours()).padStart(2, '0');
  const min = String(istTime.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const MasterLedger: React.FC = () => {
  const [session, setSession] = useState(localStorage.getItem('activeSession') || '2023-2024');
  const [academicSessions, setAcademicSessions] = useState<string[]>([localStorage.getItem('activeSession') || '2023-2024']);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filterMonth, setFilterMonth] = useState('All');

  // Add Entry State
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'Expense',
    amount: '',
    description: '',
    category: 'General',
    date: getISTDateTimeLocalString()
  });

  // Delete State
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchData = async () => {
    try {
      const settings = await getSchoolSettings();
      if (settings && settings.academicSessions) {
        setAcademicSessions(settings.academicSessions);
        if (!session) setSession(settings.academicSessions[0] || '2023-2024');
      }
      
      const data = await getTransactions({ session });
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.amount || !newEntry.description) return;
    
    try {
      await addTransaction({
        type: newEntry.type as 'Income' | 'Expense',
        amount: Number(newEntry.amount),
        description: newEntry.description,
        category: newEntry.category,
        date: newEntry.date,
        session: session
      });
      setIsAddEntryOpen(false);
      setNewEntry({ type: 'Expense', amount: '', description: '', category: 'General', date: getISTDateTimeLocalString() });
      fetchData();
    } catch (err) {
      console.error('Error adding entry', err);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin123') {
      setDeleteError('Incorrect admin password.');
      return;
    }
    if (!deleteTxnId) return;
    
    try {
      await deleteTransaction(deleteTxnId);
      setIsDeleteModalOpen(false);
      setDeleteTxnId(null);
      setDeletePassword('');
      setDeleteError('');
      fetchData();
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  // Calculate Running Balances
  let runningBalance = 0;
  const processedData = transactions.map(t => {
    const amt = t.type === 'Income' || t.type === 'Discount' ? t.amount : -t.amount;
    runningBalance += amt;
    return {
      ...t,
      amtValue: amt,
      balance: runningBalance,
      ref: t.id ? t.id.slice(0, 8).toUpperCase() : '-'
    };
  });

  const availableMonths = Array.from(new Set(processedData.map(t => t.date.substring(0, 7)))).sort().reverse();
  const displayedRows = filterMonth === 'All' 
    ? processedData.slice().reverse() 
    : processedData.filter(t => t.date.startsWith(filterMonth)).reverse();

  // 30-Day Calculations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoTime = thirtyDaysAgo.getTime();

  const recentTransactions = transactions.filter(t => new Date(t.date).getTime() >= thirtyDaysAgoTime);
  const totalCredit = recentTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = recentTransactions.filter(t => t.type === 'Expense' || t.type === 'Charge').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 className="page-title"><BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Master Ledger (Bahi Khata)</h1>
          <p className="page-subtitle">A complete chronological record of all money in and money out.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select className="glass-input" value={session} onChange={(e) => setSession(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
            {academicSessions.map(s => (
              <option key={s} value={s}>Session: {s}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={() => alert('Exporting ledger to PDF/Excel will be available soon.')}>
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Credit (Last 30 Days)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>₹{totalCredit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Debit (Last 30 Days)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>₹{totalDebit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Net Balance (Last 30 Days)</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{netBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {availableMonths.length > 0 && (
                <select 
                  className="glass-input" 
                  style={{ width: 'auto', padding: '6px 12px', margin: 0 }}
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                >
                  <option value="All">All Months</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>
                      {new Date(m + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              )}
           </div>
           
           <button className="btn-primary" onClick={() => setIsAddEntryOpen(true)}>
             <Plus size={16}/> Add Entry
           </button>
        </div>

        <div className="glass-table-container">
          <table style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th>Ref No.</th>
                <th>Particulars / Details</th>
                <th>Category</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Credit (In)</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Debit (Out)</th>
                <th style={{ textAlign: 'right', background: 'rgba(99,102,241,0.05)', whiteSpace: 'nowrap' }}>Running Balance</th>
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No records found.</td>
                </tr>
              ) : displayedRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(row.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{row.ref}</td>
                  <td style={{ fontWeight: 500 }}>
                    {row.studentId ? `[${row.studentId}] ${row.description}` : row.description}
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', fontWeight: 500 }}>
                      {row.category || row.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    {row.amtValue > 0 ? `₹${row.amtValue}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                    {row.amtValue < 0 ? `₹${Math.abs(row.amtValue)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, background: 'rgba(99,102,241,0.02)' }}>
                    ₹{row.balance}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="icon-btn" onClick={() => { setDeleteTxnId(row.id || null); setIsDeleteModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      <Modal isOpen={isAddEntryOpen} onClose={() => setIsAddEntryOpen(false)} title="Add New Entry (Credit/Debit)">
        <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Type</label>
              <select className="glass-input" value={newEntry.type} onChange={e => setNewEntry({...newEntry, type: e.target.value})}>
                <option value="Income">Credit (Income)</option>
                <option value="Expense">Debit (Expense)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
              <input required type="number" min="1" className="glass-input" value={newEntry.amount} onChange={e => setNewEntry({...newEntry, amount: e.target.value})} placeholder="e.g. 1500" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Particulars / Details</label>
            <input required type="text" className="glass-input" value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})} placeholder="e.g. Purchased supplies" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAddEntryOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Entry</button>
          </div>
        </form>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteTxnId(null); setDeleteError(''); }} title="Delete Transaction">
        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action cannot be undone and will permanently remove this record from the system.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
            <input required type="password" className="glass-input" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter admin password" />
            {deleteError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Confirm Delete</button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};

export default MasterLedger;
