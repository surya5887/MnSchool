import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Upload, Save, FileText, CheckCircle } from 'lucide-react';
import { addTransaction } from '../services/financeService';

const LegacyData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'manual'>('manual');
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Income',
    session: '2022-2023',
    particulars: '',
    date: new Date().toISOString().split('T')[0],
    amount: ''
  });

  const handleSave = async () => {
    if (!formData.particulars || !formData.amount) return;
    
    try {
      await addTransaction({
        date: formData.date,
        description: `[Legacy: ${formData.session}] ${formData.particulars}`,
        amount: Number(formData.amount),
        type: formData.type as 'Income' | 'Expense',
        category: formData.type === 'Income' ? 'Legacy Arrears' : 'Legacy Expense',
        paymentMethod: 'Cash'
      });
      setSaved(true);
      setFormData({...formData, particulars: '', amount: ''});
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving legacy record", error);
    }
  };

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
              <select className="glass-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Income">Past Fee Payment (Income)</option>
                <option value="Expense">Past School Expense (Debit)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Session / Year</label>
              <select className="glass-input" value={formData.session} onChange={e => setFormData({...formData, session: e.target.value})}>
                <option>2022-2023</option>
                <option>2021-2022</option>
                <option>2020-2021</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Name / Particulars</label>
              <input type="text" className="glass-input" placeholder="e.g. Rahul Kumar (Class 5)" value={formData.particulars} onChange={e => setFormData({...formData, particulars: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Transaction (As per old register)</label>
              <input type="date" className="glass-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Amount (₹)</label>
              <input type="number" className="glass-input" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
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
            <button className="btn-secondary" onClick={() => alert('Downloading Excel Template...')}>Download Excel Template</button>
            <button className="btn-primary" onClick={() => alert('File picker dialog opening...')}>Browse File to Upload</button>
          </div>
        </div>
      )}

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
            <CheckCircle size={24} /> Legacy Record Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LegacyData;
