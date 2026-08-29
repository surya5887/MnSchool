import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Clock, Activity } from 'lucide-react';
import { getAuditLogs, logAction, type AuditLogData } from '../services/auditService';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        if (data.length === 0 && !localStorage.getItem('audit_seeded')) {
          await logAction('System', 'System', 'Audit Trail Activated & Purged Old Spam', 'Success');
          localStorage.setItem('audit_seeded', 'true');
          const newData = await getAuditLogs();
          setLogs(newData);
        } else {
          setLogs(data);
        }
      } catch (error) {
        console.error("Error fetching logs", error);
      }
    };
    fetchLogs();
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user))).filter(Boolean);

    const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
    const matchesUser = selectedUser ? log.user === selectedUser : true;
    
    let matchesType = true;
    if (selectedType) {
      const act = log.action.toLowerCase();
      if (selectedType === 'Auth') matchesType = act.includes('log');
      else if (selectedType === 'Student') matchesType = act.includes('student');
      else if (selectedType === 'Finance') matchesType = act.includes('fee') || act.includes('expense') || act.includes('?');
      else if (selectedType === 'Staff') matchesType = act.includes('staff') || act.includes('teacher');
      else if (selectedType === 'System') matchesType = act.includes('settings') || act.includes('audit');
    }

    return matchesSearch && matchesUser && matchesType;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><ShieldAlert size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Audit Trail & Security Logs</h1>
          <p className="page-subtitle">Track every action performed by staff on the platform to ensure 100% transparency.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Filter size={16} color="var(--primary)" />
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="">All Activities</option>
              <option value="Auth">Login / Logout</option>
              <option value="Student">Admissions & Students</option>
              <option value="Finance">Finance & Fees</option>
              <option value="Staff">Staff Management</option>
              <option value="System">System Settings</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Filter size={16} color="var(--primary)" />
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
          <div className="search-bar" style={{ margin: 0, flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search by action or user..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Time</th>
                <th>User (Role)</th>
                <th>Action Performed</th>
                <th style={{ width: '150px' }}>IP Address</th>
                <th style={{ width: '120px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '6px', color: 'var(--primary)' }}/>{new Date(log.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td style={{ fontWeight: 600 }}>
                    {log.user} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>{log.role}</span>
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
          
          {filteredLogs.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ background: 'var(--glass-bg)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--glass-border)' }}>
                <Activity size={32} color="var(--primary)" opacity={0.5} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No logs found</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No audit trail records match your current filters or the database is clean.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
