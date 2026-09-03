import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { AlertCircle, IndianRupee, MessageCircle, Phone, Search, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getStudents } from '../services/studentService';
import type { StudentData } from '../services/studentService';
import { getSchoolSettings } from '../services/settingsService';
import { getTransactions } from '../services/financeService';
import type { TransactionData } from '../services/financeService';
import { getClasses } from '../services/classService';

interface Defaulter {
  student: StudentData;
  className: string;
  totalDue: number;
}

const DefaultersList: React.FC = () => {
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [students, txns, classes] = await Promise.all([
          getStudents(),
          getTransactions(),
          getClasses()
        ]);

        const classMap = new Map();
        classes.forEach(c => {
          classMap.set(c.id, c.className);
          classMap.set(c.className, c.className);
        });
        const activeStudents = students.filter(s => s.status === 'Active');
        
        let totalDueSchool = 0;
        const defaultersList: Defaulter[] = [];

        // Group transactions by student
        const studentTxns = new Map<string, TransactionData[]>();
        txns.forEach(t => {
          if (t.studentId) {
            if (!studentTxns.has(t.studentId)) studentTxns.set(t.studentId, []);
            studentTxns.get(t.studentId)!.push(t);
          }
        });

        for (const student of activeStudents) {
          if (!student.id) continue;
          const sTxns = studentTxns.get(student.id) || [];
          
          let balance = 0;
          // if previous session dues exist, add them if we were storing them in student object.
          // Currently they are tracked via manual 'Charge' transactions added during admission/migration.
          
          sTxns.forEach(t => {
            if (t.type === 'Charge') balance += t.amount;
            else if (t.type === 'Income' || t.type === 'Discount') balance -= t.amount;
          });

          if (balance > 0) {
            totalDueSchool += balance;
            defaultersList.push({
              student,
              className: classMap.get(student.classId) || 'Unknown',
              totalDue: balance
            });
          }
        }

        // Sort by highest due first
        defaultersList.sort((a, b) => b.totalDue - a.totalDue);

        setDefaulters(defaultersList);
        setTotalOutstanding(totalDueSchool);
      } catch (error) {
        console.error("Error fetching defaulters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getSchoolSettings().then(data => setSettings(data));
  }, []);

  const filteredDefaulters = defaulters.filter(d => 
    d.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.student.lastName && d.student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.student.parentPhone && d.student.parentPhone.includes(searchTerm))
  );

    const [sendingWa, setSendingWa] = useState<string | null>(null);

    const openWhatsApp = async (studentId: string, phone: string, name: string, due: number) => {
      if (!phone) return toast.error("No phone number available for this student.");
      
      if (window.location.hostname === 'localhost') {
        toast.error("Vercel Serverless API cannot run on localhost. Please use the live URL.");
        return;
      }

      // Handle country code safely
      let cleanPhone = phone.replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
      } else if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone; // Default to India if only 10 digits
      }
      
      const defaultTemplate = `Dear Parent,\nThis is a gentle reminder from MN Public School that Rs. {{due}} is currently outstanding for your ward {{name}}. Kindly clear the dues at the earliest.\nThank you.`;
      const templateStr = settings?.feeReminderTemplate || defaultTemplate;
      const message = templateStr.replace(/\{\{name\}\}/g, name).replace(/\{\{due\}\}/g, String(due));
      
      setSendingWa(studentId);
      try {
        const res = await fetch('/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, message })
        });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        toast.error("Failed to parse API response: " + parseErr);
        setSendingWa(null);
        return;
      }

      if (data.success) {
        toast.success("WhatsApp message sent successfully!", { icon: (<svg viewBox="0 0 24 24" width="20" height="20" fill="white">  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>), style: { background: "#25D366", color: "#fff", fontWeight: "bold", padding: '12px 20px', borderRadius: '12px' } });
      } else {
        toast.error("API Error: " + (data.error || JSON.stringify(data)));
      }
    } catch (error: any) {
      toast.error("Network Error: " + error.message);
      console.error(error);
    }
    setSendingWa(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1 1 auto', minWidth: '250px' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={28} color="var(--danger)" /> Fee Defaulters
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>List of students with pending fee dues.</p>
        </div>
        
        <div style={{ flex: '0 0 auto', background: 'var(--danger)', color: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.25)' }}>
          <span style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500, display: 'block', marginBottom: '4px' }}>Total Outstanding Dues</span>
          <h2 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center' }}>
            <IndianRupee size={24} /> {totalOutstanding.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search by student name, class, or phone..." 
              style={{ paddingLeft: '44px', width: '100%', margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader message="Loading data..." />
        ) : filteredDefaulters.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ background: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', opacity: 0.2 }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>All Clear!</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>There are currently no students with pending dues.</p>
          </div>
        ) : (
          
            <>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '16px' }}>
                {filteredDefaulters.map((d) => (
                  <div key={d.student.id} style={{ 
                    background: '#ffffff',
                    border: 'none',
                    borderLeft: '5px solid #ef4444',
                    borderRadius: '12px', 
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}>
                            {d.student.firstName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.15rem', letterSpacing: '-0.3px' }}>{d.student.firstName} {d.student.lastName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 10px', borderRadius: '20px', color: '#475569', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px' }}>{d.className}</span>
                              <span style={{ opacity: 0.7 }}>Roll: {d.student.rollNumber || 'N/A'}</span>
                            </div>
                          </div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(239,68,68,0.3)', position: 'relative', zIndex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 600, fontSize: '0.95rem' }}>
                          <AlertCircle size={18} /> Due Amount
                       </div>
                       <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '1.4rem', display: 'flex', alignItems: 'center', letterSpacing: '-0.5px' }}>
                          <IndianRupee size={20} />{d.totalDue.toLocaleString()}
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, paddingTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                        <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '50%' }}>
                           <Phone size={16} color="#64748b" />
                        </div>
                        {d.student.parentPhone || 'N/A'}
                      </div>
                      <button 
                        onClick={() => openWhatsApp(d.student.id || '', d.student.parentPhone || '', `${d.student.firstName} ${d.student.lastName}`, d.totalDue)}
                        style={{ 
                          background: sendingWa === d.student.id ? '#e2e8f0' : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                          color: sendingWa === d.student.id ? '#64748b' : 'white', 
                          border: 'none', padding: '10px 20px', 
                          borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', 
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                          boxShadow: sendingWa === d.student.id ? 'none' : '0 6px 16px rgba(37, 211, 102, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {sendingWa === d.student.id ? 'Sending...' : (
                          <>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
        )}
      </div>
    </motion.div>
  );
};

export default DefaultersList;
