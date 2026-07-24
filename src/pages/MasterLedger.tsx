import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { getTransactions, type TransactionData } from '../services/financeService';

const MasterLedger: React.FC = () => {
  const [session, setSession] = useState('2023-2024');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        // For ledger, we want oldest first to calculate running balance
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions", error);
      }
    };
    fetchTransactions();
  }, []);

  let runningBalance = 0;
  const ledgerData = transactions.map(t => {
    const amt = t.type === 'Income' ? t.amount : -t.amount;
    runningBalance += amt;
    return {
      date: new Date(t.date).toLocaleDateString(),
      type: t.type,
      category: t.category,
      details: t.description,
      amount: amt,
      balance: runningBalance,
      ref: t.id ? t.id.slice(0, 8).toUpperCase() : '-'
    };
  }).reverse(); // Reverse for display (newest first)

  const totalCredit = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Master Ledger (Bahi Khata)</h1>
          <p className="page-subtitle">A complete chronological record of all money in and money out.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select className="glass-input" value={session} onChange={(e) => setSession(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
            <option value="2023-2024">Session: 2023-2024</option>
            <option value="2022-2023">Session: 2022-2023</option>
            <option value="2021-2022">Session: 2021-2022</option>
          </select>
          <button className="btn-secondary" onClick={() => alert('Exporting ledger to PDF/Excel will be available soon.')}>
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Credit (Income)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>₹{totalCredit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Debit (Expense)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>₹{totalDebit.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Net Bank/Cash Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{netBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px' }}>
           <input type="date" className="glass-input" style={{ width: 'auto' }} />
           <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>to</span>
           <input type="date" className="glass-input" style={{ width: 'auto' }} />
           <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => alert('Advanced filtering coming soon!')}><Filter size={16}/> Filter Ledger</button>
        </div>

        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref No.</th>
                <th>Particulars / Details</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Credit (In)</th>
                <th style={{ textAlign: 'right' }}>Debit (Out)</th>
                <th style={{ textAlign: 'right', background: 'rgba(99,102,241,0.05)' }}>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{row.date}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{row.ref}</td>
                  <td style={{ fontWeight: 500 }}>{row.details}</td>
                  <td>
                    <span className="badge" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', fontWeight: 500 }}>
                      {row.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    {row.amount > 0 ? `₹${row.amount}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                    {row.amount < 0 ? `₹${Math.abs(row.amount)}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, background: 'rgba(99,102,241,0.02)' }}>
                    ₹{row.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default MasterLedger;
