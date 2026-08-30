import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle2, AlertTriangle, MessageSquare, Clock, Zap } from 'lucide-react';
import { runAutomatedBilling } from '../services/billingService';

const FinancialAutomation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleRunEngine = async () => {
    setIsRunning(true);
    setResultMessage(null);
    try {
      const count = await runAutomatedBilling();
      setResultMessage(`Success! Generated ${count} new invoices/fines.`);
    } catch (error) {
      setResultMessage(`Error running billing engine.`);
    }
    setIsRunning(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>
            <Zap size={24} color="white" />
          </div>
          Financial Automation Engine
        </h1>
        <p className="page-subtitle" style={{ marginTop: '8px' }}>Manage auto-billing, late fines, and smart notifications</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Billing Engine Status */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '10px', color: 'var(--primary-color)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Auto-Billing Engine</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Status: Active (Runs 1st of Month)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            System automatically scans all active students, fetches their class monthly fee, and posts a "Due" entry to their ledger. It skips students who have already been billed for the current month.
          </p>
          <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
             <button 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                onClick={handleRunEngine}
                disabled={isRunning}
             >
               {isRunning ? 'Processing...' : <><PlayCircle size={18} /> Force Run Engine Now</>}
             </button>
             {resultMessage && (
               <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                 {resultMessage}
               </div>
             )}
          </div>
        </div>

        {/* Late Fine Automation */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '10px', color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Late Fine Automation</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Status: Active (Runs 11th of Month)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            If a student has a pending due balance (Total Due &gt; 0) on or after the 11th of the month, the system automatically posts a Late Fine charge to their ledger.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Late Fine Amount:</span>
               <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹50.00 / month</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Grace Period Ends:</span>
               <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>10th of every month</span>
             </div>
          </div>
        </div>

        {/* Smart Notifications */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(34,197,94,0.1)', padding: '10px', borderRadius: '10px', color: 'var(--success)' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Smart Notifications</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> WhatsApp Serverless Linked</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Automated alerts sent directly to parents' WhatsApp numbers using the Zero-cost Serverless Engine.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <input type="checkbox" checked readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--success)' }} />
               <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Advance Due Reminder (5th of Month)</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <input type="checkbox" checked readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--success)' }} />
               <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Instant Payment Receipt on Fee Deposit</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <input type="checkbox" checked readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--success)' }} />
               <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Defaulter Alert (After 10th)</span>
             </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default FinancialAutomation;
