import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Clock } from 'lucide-react';
import { getAuditLogs, type AuditLogData } from '../services/auditService';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs", error);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()));

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
            <input type="text" placeholder="Search logs..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} />
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
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/>{new Date(log.time).toLocaleString()}</td>
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
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
