import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Calendar, CreditCard, Download, CheckCircle, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { students } from '../data/mockData';

const StudentProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Mock finding student
  const student = students.find(s => s.id === id) || students[0];

  const paymentHistory = [
    { date: '05 Oct 2023', amount: 2500, for: 'Oct Tuition Fee', status: 'Paid', receipt: 'REC-23091' },
    { date: '02 Sep 2023', amount: 2500, for: 'Sep Tuition Fee', status: 'Paid', receipt: 'REC-22105' },
    { date: '15 Aug 2023', amount: 2500, for: 'Aug Tuition Fee', status: 'Paid', receipt: 'REC-21045' },
    { date: '10 Jul 2023', amount: 5500, for: 'Jul Tuition + Annual Charge', status: 'Paid', receipt: 'REC-20999' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className="btn-secondary" style={{ marginBottom: '20px' }} onClick={() => navigate('/students')}>
        ← Back to Directory
      </button>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Column: Personal Info */}
        <div className="glass-panel" style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--glass-shadow)', marginBottom: '16px' }}>
            <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random&size=120`} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ margin: '0 0 4px 0' }}>{student.name}</h2>
          <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`} style={{ marginBottom: '16px' }}>{student.status}</span>
          
          <div style={{ width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Calendar size={18} /> Class: <strong style={{ color: 'var(--text-main)' }}>{student.class} (Roll: {student.roll})</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Phone size={18} /> <strong style={{ color: 'var(--text-main)' }}>{student.parentPhone}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Mail size={18} /> <strong style={{ color: 'var(--text-main)' }}>parent@gmail.com</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)' }}>
              <MapPin size={18} style={{ marginTop: '2px' }} /> <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.4 }}>123, Civil Lines, Near Main Market, City</span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial History */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fee Overview Card */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Current Session (2023-2024) Status</h3>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Dues</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>₹2,500</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Paid</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>₹13,000</div>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '12px 24px' }}>
              <CreditCard size={20} /> Collect Due Fee
            </button>
          </div>

          {/* Historical Timeline */}
          <div className="glass-panel" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Fee Payment History (Ledger)</h3>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <Download size={16} /> Download Statement
              </button>
            </div>

            <div className="glass-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Receipt No.</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Pending Row */}
                  <tr style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                    <td><span style={{ color: 'var(--warning)', fontWeight: 600 }}>Due Now</span></td>
                    <td>Nov Tuition Fee</td>
                    <td>-</td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹2,500</td>
                    <td><span className="badge warning"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> Pending</span></td>
                  </tr>

                  {/* Past Paid Rows */}
                  {paymentHistory.map((pmt, i) => (
                    <tr key={i}>
                      <td>{pmt.date}</td>
                      <td>{pmt.for}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{pmt.receipt}</td>
                      <td style={{ fontWeight: 600 }}>₹{pmt.amount}</td>
                      <td><span className="badge success"><CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }}/> {pmt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
