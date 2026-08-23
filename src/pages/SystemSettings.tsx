import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, PenTool, Check } from 'lucide-react';
import { logAction } from '../services/auditService';
import { getStaff, type StaffData } from '../services/staffService';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [saved, setSaved] = useState(false);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [newSessionInput, setNewSessionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const staffData = await getStaff();
      setStaff(staffData);
      const settingsData = await getSchoolSettings();
      if (settingsData) {
        setSettings(settingsData);
      } else {
        setSettings({
          schoolName: "MN Public School", shortName: "MNPS", email: "info@mnpublicschool.com", phone: "+91 98765 43210", address: "",
          academicSessions: ["2023-2024", "2024-2025"], activeSession: "2023-2024"
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (settingName: string) => {
    await logAction('Admin', 'Super Admin', `Updated ${settingName} Settings`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  

  const tabs = [
    { id: 'core', label: 'Core Setup', icon: <PenTool size={18} /> },
    { id: 'rbac', label: 'Roles & Permissions', icon: <Shield size={18} /> },
  ];

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title"><Settings size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> System Settings</h1>
        <p className="page-subtitle">Configure the core modules, classes, and administrative access of your ERP.</p>
      </div>

      <div className="responsive-flex" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Settings Sidebar */}
        <div className="glass-panel settings-sidebar" style={{ width: '250px', padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none',
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === tab.id ? 600 : 500,
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="glass-panel" style={{ flex: 1, minHeight: '500px' }}>
          
          {activeTab === 'core' && settings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ margin: '0 0 24px 0' }}>Core School Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>School Name (Appears on Receipts)</label>
                  <input type="text" className="glass-input" value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number</label>
                  <input type="text" className="glass-input" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
                  <input type="text" className="glass-input" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Current Academic Session</label>
                  <select 
                    className="glass-input" 
                    value={settings.activeSession || ''} 
                    onChange={e => setSettings({...settings, activeSession: e.target.value})}
                  >
                    {(settings.academicSessions || []).map(session => (
                      <option key={session} value={session}>{session} {settings.activeSession === session ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ flex: 1 }}
                    placeholder="e.g. 2025-2026" 
                    value={newSessionInput} 
                    onChange={e => setNewSessionInput(e.target.value)} 
                  />
                  <button className="btn-secondary" onClick={() => {
                    if (newSessionInput && !settings.academicSessions?.includes(newSessionInput)) {
                      setSettings({
                        ...settings,
                        academicSessions: [...(settings.academicSessions || []), newSessionInput]
                      });
                      setNewSessionInput('');
                    }
                  }}>
                    Add New Session
                  </button>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button className="btn-primary" style={{ marginTop: '16px' }} disabled={isSaving} onClick={async () => {
                    setIsSaving(true);
                    await saveSchoolSettings(settings);
                    window.dispatchEvent(new Event('settingsUpdated'));
                    await handleSave('Core');
                    setIsSaving(false);
                  }}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rbac' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Role Management</h3>
                <button className="btn-primary" onClick={() => alert('Role creation will be available in v2.0')}>Add New Role</button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Define permissions for different staff types. Do not give full access to accountants.</p>
              
              <div className="glass-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Permissions</th>
                      <th>Users Assigned</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Super Admin</td>
                      <td><span className="badge success">Full Access</span></td>
                      <td>{staff.filter(s => s.role === 'Admin').length} Users</td>
                      <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Accountant</td>
                      <td>Fee Collection, Ledger View, Expenses</td>
                      <td><span className="badge" style={{ background: 'var(--primary-color)', color: 'white' }}>9</span></td>
                      <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => alert('Edit Role coming soon')}>Edit</button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Teacher</td>
                      <td>Mark Attendance, Student Directory View</td>
                      <td>{staff.filter(s => s.role === 'Teacher').length} Users</td>
                      <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
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
          <Check size={24} /> Action completed successfully!
        </motion.div>
      )}

      {/* Class Modal removed - moved to Classes page */}
    </>
  );
};

export default SystemSettings;
