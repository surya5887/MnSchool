import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, IndianRupee, MessageCircle, Phone, Search, CheckCircle2 } from 'lucide-react';
import { getStudents } from '../services/studentService';
import type { StudentData } from '../services/studentService';
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
  }, []);

  const filteredDefaulters = defaulters.filter(d => 
    d.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.student.lastName && d.student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.student.parentPhone && d.student.parentPhone.includes(searchTerm))
  );

    const [sendingWa, setSendingWa] = useState<string | null>(null);

    const openWhatsApp = async (phone: string, name: string, due: number) => {
      if (!phone) return alert("No phone number available for this student.");
      
      if (window.location.hostname === 'localhost') {
        alert("Guru ji, Serverless WhatsApp API 'localhost' par kaam nahi karti kyunki serverless functions Vercel par host hain! Kripya ise aapke LIVE URL par check karein jo apne dusre tab me khol rakha hai.");
        return;
      }

      const num = phone.replace(/\D/g, '');
      const message = `Dear Parent,\nThis is a gentle reminder from MN Public School that Rs. ${due} is currently outstanding for your ward ${name}. Kindly clear the dues at the earliest.\nThank you.`;
      
      setSendingWa(num);
          try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + num, message })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        alert("Serverless Error (Vercel): Failed to parse API response. Please check Vercel Logs. Details: " + parseErr);
        setSendingWa(null);
        return;
      }

      if (data.success) {
        alert("✅ Serverless WhatsApp sent successfully!");
      } else {
        alert("API Error: " + (data.error || JSON.stringify(data)));
      }
    } catch (error: any) {
      alert("Network Error: " + error.message);
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
        ) : filteredDefaulters.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ background: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', opacity: 0.2 }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>All Clear!</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>There are currently no students with pending dues.</p>
          </div>
        ) : (
          <div className="glass-table-container">
            <table style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Parent Phone</th>
                  <th style={{ textAlign: 'right' }}>Total Due</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefaulters.map((d) => (
                  <tr key={d.student.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          {d.student.firstName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.student.firstName} {d.student.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roll: {d.student.rollNumber || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{d.className}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Phone size={14} /> {d.student.parentPhone || 'N/A'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)', fontSize: '1.05rem' }}>
                      ₹{d.totalDue.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => openWhatsApp(d.student.parentPhone || '', `${d.student.firstName} ${d.student.lastName}`, d.totalDue)}
                        style={{ 
                          background: '#25D366', color: 'white', border: 'none', padding: '8px 16px', 
                          borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', 
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' 
                        }}
                      >
                        {sendingWa === d.student.parentPhone?.replace(/\D/g, '') ? 'Sending...' : <><MessageCircle size={16} /> Send Reminder</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DefaultersList;
