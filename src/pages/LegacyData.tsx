import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, Save, FileText } from 'lucide-react';

const LegacyData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'manual'>('manual');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title"><Database size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Upload Old Records (Legacy Data)</h1>
        <p className="page-subtitle">Digitize your old paper registers and past session records easily.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          className={activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'} 
          onClick={() => setActiveTab('manual')}
        >
          <FileText size={18} /> Manual Fast Entry
        </button>
        <button 
          className={activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'} 
          onClick={() => setActiveTab('bulk')}
        >
          <Upload size={18} /> Bulk Excel Upload
        </button>
      </div>

      {activeTab === 'manual' && (
        <div className="glass-panel" style={{ maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Quick Past Record Entry</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Type of Record</label>
              <select className="glass-input">
                <option>Past Fee Payment (Income)</option>
                <option>Past School Expense (Debit)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Session / Year</label>
              <select className="glass-input">
                <option>2022-2023</option>
                <option>2021-2022</option>
                <option>2020-2021</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Name / Particulars</label>
              <input type="text" className="glass-input" placeholder="e.g. Rahul Kumar (Class 5)" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Transaction (As per old register)</label>
              <input type="date" className="glass-input" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Amount (₹)</label>
              <input type="number" className="glass-input" placeholder="0.00" />
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%' }}>
            <Save size={18} /> Save into Historical Ledger
          </button>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="glass-panel" style={{ maxWidth: '800px', textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Upload size={40} />
          </div>
          <h3 style={{ marginBottom: '12px' }}>Upload Excel / CSV File</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            If you have your old data in an excel sheet, you can upload it here directly. Download our template to ensure correct formatting.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-secondary">Download Excel Template</button>
            <button className="btn-primary">Browse File to Upload</button>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default LegacyData;
