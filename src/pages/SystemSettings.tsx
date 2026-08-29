import { getAllAdmins, updateAdminCredentials } from '../services/adminService';
import { Lock, Edit, Save, X as XIcon, Building2, Phone, Mail, Calendar, User, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, PenTool, Check } from 'lucide-react';
import { logAction } from '../services/auditService';
import { getStaff, type StaffData } from '../services/staffService';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [saved, setSaved] = useState(false);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [newSessionInput, setNewSessionInput] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [editAdminData, setEditAdminData] = useState({ email: '', password: '' });
  
  const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');
  
  useEffect(() => {
    if (authUser.role === 'Super Admin') {
      getAllAdmins().then(data => setAdmins(data));
    }
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    const s = await getStaff();
    setStaff(s);
    const set = await getSchoolSettings();
    if (set) {
      setSettings(set);
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
    { id: 'core', label: 'Core Setup', desc: 'School details & academic session', icon: <Building2 size={20} /> },
    { id: 'rbac', label: 'Roles & Permissions', desc: 'System access & restrictions', icon: <ShieldCheck size={20} /> },
    ...(authUser.role === 'Super Admin' ? [{ id: 'credentials', label: 'System Credentials', desc: 'Manage email & passwords', icon: <Lock size={20} /> }] : [])
  ];

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>
            <SettingsIcon size={24} color="white" />
          </div>
          System Settings
        </h1>
        <p className="page-subtitle" style={{ marginTop: '8px' }}>Configure the core modules, classes, and administrative access of your ERP.</p>
      </div>

      <div className="settings-layout" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Beautiful Settings Sidebar */}
        <div className="settings-sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                  background: isActive ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.6)',
                  color: isActive ? 'white' : 'var(--text-main)',
                  borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                  boxShadow: isActive ? '0 10px 25px rgba(99, 102, 241, 0.4)' : '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.8)'
                }}
              >
                <div style={{ 
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)', 
                  padding: '10px', borderRadius: '12px', color: isActive ? 'white' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {tab.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{tab.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: isActive ? 0.9 : 0.6 }}>{tab.desc}</div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        <div style={{ flex: 1, minHeight: '600px', minWidth: 0, width: '100%' }}>
          
          <AnimatePresence mode="wait">
            {activeTab === 'core' && settings && (
              <motion.div key="core" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h2 style={{ margin: '0 0 32px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Building2 size={24} color="var(--primary)" /> Core School Details
                  </h2>
                  
                  <div className="settings-grid" style={{ display: 'grid', gap: '24px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <PenTool size={16} /> School Name (Appears on Receipts)
                      </label>
                      <input type="text" className="glass-input" style={{ fontSize: '1.05rem', padding: '14px 20px', borderRadius: '16px' }} value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} />
                    </div>
                    
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Phone size={16} /> Contact Number
                      </label>
                      <input type="text" className="glass-input" style={{ padding: '14px 20px', borderRadius: '16px' }} value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                    </div>
                    
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Mail size={16} /> Email Address
                      </label>
                      <input type="email" className="glass-input" style={{ padding: '14px 20px', borderRadius: '16px' }} value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1', height: '1px', background: 'rgba(0,0,0,0.05)', margin: '12px 0' }}></div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Calendar size={16} /> Current Academic Session
                      </label>
                      <select 
                        className="glass-input" 
                        style={{ padding: '14px 20px', borderRadius: '16px', fontWeight: 600, color: 'var(--primary)' }}
                        value={settings.activeSession || ''} 
                        onChange={e => setSettings({...settings, activeSession: e.target.value})}
                      >
                        {(settings.academicSessions || []).map(session => (
                          <option key={session} value={session}>{session} {settings.activeSession === session ? '(Active)' : ''}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        Add New Session
                      </label>
                      <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <input 
                          type="text" 
                          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 20px', outline: 'none', fontWeight: 500 }}
                          placeholder="e.g. 2025-2026" 
                          value={newSessionInput} 
                          onChange={e => setNewSessionInput(e.target.value)} 
                        />
                        <button className="btn-secondary" style={{ borderRadius: '14px', padding: '10px 24px' }} onClick={() => {
                          if (newSessionInput && !settings.academicSessions?.includes(newSessionInput)) {
                            setSettings({
                              ...settings,
                              academicSessions: [...(settings.academicSessions || []), newSessionInput]
                            });
                            setNewSessionInput('');
                          }
                        }}>
                          Add Session
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                      <button className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }} disabled={isSaving} onClick={async () => {
                        setIsSaving(true);
                        await saveSchoolSettings(settings);
                        window.dispatchEvent(new Event('settingsUpdated'));
                        await handleSave('Core');
                        setIsSaving(false);
                      }}>
                        {isSaving ? 'Saving...' : <><Save size={20} /> Save All Changes</>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'credentials' && authUser.role === 'Super Admin' && (
              <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Lock size={24} color="var(--primary)" /> System Credentials
                  </h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Manage secure access for top-level administrators. Passwords are securely hashed with bcrypt encryption.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {admins.map(admin => (
                      <div key={admin.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
                        
                        {editingAdmin === admin.id ? (
                          <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                              {admin.role.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Email Address</label>
                              <input 
                                type="email" 
                                className="glass-input" 
                                style={{ padding: '10px 16px', borderRadius: '12px', width: '100%' }}
                                value={editAdminData.email}
                                onChange={e => setEditAdminData({...editAdminData, email: e.target.value})}
                                placeholder="New Email"
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>New Password</label>
                              <input 
                                type="text" 
                                className="glass-input" 
                                style={{ padding: '10px 16px', borderRadius: '12px', width: '100%' }}
                                value={editAdminData.password}
                                onChange={e => setEditAdminData({...editAdminData, password: e.target.value})}
                                placeholder="Leave blank to keep current"
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingBottom: '2px' }}>
                              <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '12px' }} onClick={async () => {
                                await updateAdminCredentials(admin.id, editAdminData.email, editAdminData.password);
                                setAdmins(await getAllAdmins());
                                setEditingAdmin(null);
                                handleSave('Credentials');
                              }}>
                                <Save size={16} /> Save
                              </button>
                              <button className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setEditingAdmin(null)}>
    <XIcon size={16} /> Cancel
  </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                {admin.role.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>{admin.role}</h4>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Mail size={14} /> {admin.email}
                                </div>
                              </div>
                            </div>
                            <button className="btn-secondary" onClick={() => {
                              setEditingAdmin(admin.id);
                              setEditAdminData({ email: admin.email, password: '' });
                            }} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Edit size={16} /> Edit Access
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rbac' && (
              <motion.div key="rbac" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={24} color="var(--primary)" /> Role Management
                  </h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>The system uses 3 fixed hierarchy roles. Permissions are strictly enforced across the entire ERP framework.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {/* Admin Card */}
                    <div style={{ background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>Principal / Admin</h3>
                          <span className="badge success" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Full Access</span>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>
                          <Shield size={20} color="var(--success)" />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Complete control over the entire system including financials, users, settings, and destructive actions.
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--primary)" /> 1 System User
                      </div>
                    </div>

                    {/* Teacher Card */}
                    <div style={{ background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--warning)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>Teacher</h3>
                          <span className="badge warning" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Restricted Access</span>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px' }}>
                          <User size={20} color="var(--warning)" />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Can manage their assigned class, take attendance, view student profiles, and see their own salary ledger.
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--primary)" /> {staff.filter(s => s.role === 'Teacher' || !s.role).length} Active Users
                      </div>
                    </div>

                    {/* Student Card */}
                    <div style={{ background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>Student / Parent</h3>
                          <span className="badge" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>View Only</span>
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                          <User size={20} color="var(--primary)" />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Can view their own profile, fee receipts, payment ledger, daily attendance, and class timetable.
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--primary)" /> All Registered Students
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
    
      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              background: 'var(--success)', color: 'white',
              padding: '16px 24px', borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}>
              <Check size={20} />
            </div>
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SystemSettings;
