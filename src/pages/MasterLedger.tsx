import { verifyAdminPassword } from '../services/authService';
import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { Download, TrendingUp, TrendingDown, BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, type TransactionData } from '../services/financeService';
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
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('All');
  
  // Date and Stats State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statsPeriod, setStatsPeriod] = useState('30'); // '30', '60', '90', '180', '365'

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTxnData, setEditTxnData] = useState<TransactionData | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOption, setExportOption] = useState('30');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions', error);
      setLoading(false);
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
    const isValid = await verifyAdminPassword(deletePassword);
      if (!isValid) {
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

  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyAdminPassword(editPassword);
    if (!isValid) {
      setEditError('Incorrect admin password.');
      return;
    }
    if (!editTxnData || !editTxnData.id) return;
    
    try {
      await updateTransaction(editTxnData.id, {
        amount: Number(editTxnData.amount),
        description: editTxnData.description,
        date: editTxnData.date,
        type: editTxnData.type,
      });
      setIsEditModalOpen(false);
      setEditTxnData(null);
      setEditPassword('');
      setEditError('');
      fetchData();
    } catch (err) {
      console.error('Error updating transaction', err);
    }
  };

  const handleExportData = () => {
    let filtered = transactions;
    
    if (exportOption === 'custom') {
      if (exportStartDate && exportEndDate) {
        const start = new Date(exportStartDate).getTime();
        const end = new Date(exportEndDate).getTime() + 86400000;
        filtered = filtered.filter(t => {
          const dt = new Date(t.date).getTime();
          return dt >= start && dt < end;
        });
      }
    } else {
      const days = parseInt(exportOption, 10);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);
      const thresholdTime = threshold.getTime();
      filtered = filtered.filter(t => new Date(t.date).getTime() >= thresholdTime);
    }

    if (filtered.length === 0) {
      alert("No data found for the selected date range.");
      return;
    }

    // Generate CSV
    const headers = ["Date", "Time", "Type", "Category", "Description", "Credit (In)", "Debit (Out)"];
    const rows = filtered.map(t => {
      const dateObj = new Date(t.date);
      const dateStr = dateObj.toLocaleDateString('en-GB');
      const timeStr = dateObj.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
      const credit = t.type === 'Income' || t.type === 'Discount' ? t.amount : 0;
      const debit = t.type === 'Expense' || t.type === 'Charge' ? t.amount : 0;
      
      const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : "";
      const cat = t.category ? `"${t.category.replace(/"/g, '""')}"` : "";
      
      return [dateStr, timeStr, t.type, cat, desc, credit, debit].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_Ledger_${exportOption === 'custom' ? 'Custom' : `Last_${exportOption}_Days`}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  // Process data for rendering
  const processedData = transactions.map(t => {
    const amt = t.type === 'Income' || t.type === 'Discount' ? t.amount : -t.amount;
    return {
      ...t,
      amtValue: amt,
    };
  });

  const availableMonths = Array.from(new Set(processedData.map(t => t.date.substring(0, 7)))).sort().reverse();
  
  let displayedRows = processedData.slice().reverse();

  if (startDate && endDate) {
    const startT = new Date(startDate).getTime();
    const endT = new Date(endDate).getTime() + 86400000; // include full end date
    displayedRows = displayedRows.filter(t => {
      const dt = new Date(t.date).getTime();
      return dt >= startT && dt < endT;
    });
  } else if (filterMonth !== 'All') {
    displayedRows = displayedRows.filter(t => t.date.startsWith(filterMonth));
  }

  // Stats Calculations
  const periodDays = parseInt(statsPeriod, 10);
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - periodDays);
  const thresholdTime = thresholdDate.getTime();

  const recentTransactions = transactions.filter(t => new Date(t.date).getTime() >= thresholdTime);
  const totalCredit = recentTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = recentTransactions.filter(t => t.type === 'Expense' || t.type === 'Charge').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  const periodLabel = statsPeriod === '30' ? 'Last 30 Days' : 
                      statsPeriod === '60' ? 'Last 2 Months' :
                      statsPeriod === '90' ? 'Last 3 Months' :
                      statsPeriod === '180' ? 'Last 6 Months' : 'Last 1 Year';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "32px" }}>
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
          <button className="btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stats Period:</span>
        <select className="glass-input" style={{ width: 'auto', padding: '6px 12px' }} value={statsPeriod} onChange={(e) => setStatsPeriod(e.target.value)}>
          <option value="30">Last 30 Days</option>
          <option value="60">Last 2 Months</option>
          <option value="90">Last 3 Months</option>
          <option value="180">Last 6 Months</option>
          <option value="365">Last 1 Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Credit ({periodLabel})</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>₹{totalCredit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Debit ({periodLabel})</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>₹{totalDebit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Net Balance ({periodLabel})</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{netBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="filter-bar" style={{ padding: "20px 24px", borderBottom: "1px solid var(--glass-border)", justifyContent: "space-between" }}>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {availableMonths.length > 0 && (
                <select 
                  className="glass-input" 
                  style={{ width: 'auto', padding: '6px 12px', margin: 0 }}
                  value={filterMonth}
                  onChange={e => {
                    setFilterMonth(e.target.value);
                    setStartDate('');
                    setEndDate('');
                  }}
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
           
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
             <input 
               type="date" 
               className="glass-input" 
               style={{ width: 'auto', padding: '6px 12px', margin: 0 }} 
               value={startDate} 
               onChange={e => { setStartDate(e.target.value); setFilterMonth('All'); }} 
             />
             <span style={{ color: 'var(--text-muted)' }}>to</span>
             <input 
               type="date" 
               className="glass-input" 
               style={{ width: 'auto', padding: '6px 12px', margin: 0 }} 
               value={endDate} 
               onChange={e => { setEndDate(e.target.value); setFilterMonth('All'); }} 
             />
             <button className="btn-primary" onClick={() => setIsAddEntryOpen(true)}>
               <Plus size={16}/> Add Entry
             </button>
           </div>
        </div>

        <div className="glass-table-container">
          <table style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th>Description</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Credit (In)</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Debit (Out)</th>
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Loader message="Loading ledger..." /> : displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No records found.</td>
                </tr>
              ) : displayedRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(row.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {row.description}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    {row.amtValue > 0 ? `₹${row.amtValue}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                    {row.amtValue < 0 ? `₹${Math.abs(row.amtValue)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="icon-btn" onClick={() => { setEditTxnData(row); setIsEditModalOpen(true); }} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => { setDeleteTxnId(row.id || null); setIsDeleteModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Master Ledger">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Select Date Range</label>
            <select className="glass-input" value={exportOption} onChange={e => setExportOption(e.target.value)}>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 2 Months</option>
              <option value="90">Last 3 Months</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last 1 Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
          
          {exportOption === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Start Date</label>
                <input type="date" className="glass-input" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>End Date</label>
                <input type="date" className="glass-input" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsExportModalOpen(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleExportData}>Download Excel (CSV)</button>
          </div>
        </div>
      </Modal>

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
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
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

    
      {/* Edit Transaction Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditTxnData(null); setEditError(''); }} title="Edit Transaction">
        {editTxnData && (
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Type</label>
                <select className="glass-input" value={editTxnData.type} onChange={e => setEditTxnData({...editTxnData, type: e.target.value as any})}>
                  <option value="Income">Credit (Income)</option>
                  <option value="Expense">Debit (Expense)</option>
                  <option value="Charge">Debit (Charge/Due)</option>
                  <option value="Discount">Discount</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Amount (,1)</label>
                <input required type="number" min="1" className="glass-input" value={editTxnData.amount} onChange={e => setEditTxnData({...editTxnData, amount: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
              <input required type="text" className="glass-input" value={editTxnData.description} onChange={e => setEditTxnData({...editTxnData, description: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
              <input required type="datetime-local" className="glass-input" value={editTxnData.date ? editTxnData.date.substring(0, 16) : ''} onChange={e => setEditTxnData({...editTxnData, date: e.target.value})} />
            </div>
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password to Save</label>
              <input required type="password" className="glass-input" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Enter admin password" />
              {editError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{editError}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

    </motion.div>
  );
};

export default MasterLedger;
