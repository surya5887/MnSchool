import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Clock } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const logs = [
    { id: 1, user: 'Admin (Ramesh)', role: 'Super Admin', action: 'Modified Fee Structure (Added ₹500 Transport)', time: 'Today, 10:45 AM', ip: '192.168.1.5', status: 'Success' },
    { id: 2, user: 'Accountant (Priya)', role: 'Accountant', action: 'Collected Fee ₹2500 from Priya (10th A)', time: 'Today, 09:12 AM', ip: '192.168.1.12', status: 'Success' },
    { id: 3, user: 'Teacher (Aditi)', role: 'Teacher', action: 'Marked Class 1 Attendance', time: 'Yesterday, 08:30 AM', ip: '10.0.0.15', status: 'Success' },
    { id: 4, user: 'Unknown', role: 'None', action: 'Failed Login Attempt', time: 'Yesterday, 11:45 PM', ip: '45.22.19.1', status: 'Failed' },
    { id: 5, user: 'Admin (Ramesh)', role: 'Super Admin', action: 'Exported Master Ledger to Excel', time: '15 Oct, 04:20 PM', ip: '192.168.1.5', status: 'Success' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title"><ShieldAlert size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Audit Trail & Security Logs</h1>
          <p className="page-subtitle">Track every action performed by staff on the platform to ensure 100% transparency.</p>
        </div>
        <button className="btn-secondary"><Filter size={16} /> Filter by User</button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px' }}>
          <div className="search-bar" style={{ margin: 0, width: '300px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search logs..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
          </div>
        </div>

        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User (Role)</th>
                <th>Action Performed</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/>{log.time}</td>
                  <td style={{ fontWeight: 500 }}>
                    {log.user} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{log.role}</span>
                  </td>
                  <td style={{ color: 'var(--text-main)' }}>{log.action}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.ip}</td>
                  <td>
                    <span className={`badge ${log.status === 'Success' ? 'success' : 'danger'}`}>
                      {log.status}
                    </span>
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

export default AuditLogs;
