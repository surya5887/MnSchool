import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';

const MasterLedger: React.FC = () => {
  const [session, setSession] = useState('2023-2024');

  // Unified mock ledger data (Income and Expenses mixed for accounting view)
  const ledgerData = [
    { date: '12 Oct 2023', type: 'Income', category: 'Tuition Fee', details: 'Aarav Sharma (10th A)', amount: 2500, balance: 142500, ref: 'REC-23091' },
    { date: '12 Oct 2023', type: 'Expense', category: 'Maintenance', details: 'School Bus Repair', amount: -25000, balance: 140000, ref: 'VOU-882' },
    { date: '11 Oct 2023', type: 'Income', category: 'Tuition Fee', details: 'Kavya Reddy (7th A)', amount: 2000, balance: 165000, ref: 'REC-23090' },
    { date: '10 Oct 2023', type: 'Income', category: 'Admission Fee', details: 'Karan Malhotra (6th A)', amount: 8500, balance: 163000, ref: 'REC-23089' },
    { date: '05 Oct 2023', type: 'Expense', category: 'Utilities', details: 'Electricity Bill (Sep)', amount: -15000, balance: 154500, ref: 'VOU-881' },
    { date: '04 Oct 2023', type: 'Expense', category: 'Supplies', details: 'Stationary & Chalks', amount: -4500, balance: 169500, ref: 'VOU-880' },
    { date: '01 Oct 2023', type: 'Income', category: 'Opening Balance', details: 'Carried forward from Sep', amount: 174000, balance: 174000, ref: '-' },
  ];

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
          <button className="btn-secondary">
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
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>₹14,50,000</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Debit (Expense)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>₹8,45,000</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Net Bank/Cash Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹6,05,000</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px' }}>
           <input type="date" className="glass-input" style={{ width: 'auto' }} />
           <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>to</span>
           <input type="date" className="glass-input" style={{ width: 'auto' }} />
           <button className="btn-secondary" style={{ marginLeft: 'auto' }}><Filter size={16}/> Filter Ledger</button>
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
