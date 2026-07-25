import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, HardDrive, BookOpen, CreditCard, PenTool, Check, Database } from 'lucide-react';
import { logAction } from '../services/auditService';
import { getStaff, type StaffData } from '../services/staffService';
import { getStudents } from '../services/studentService';
import { getClasses } from '../services/classService';
import { getFeeTypes, getFeeGroups } from '../services/feeService';
import { getTransactions } from '../services/financeService';
import { getBooks } from '../services/libraryService';
import { getVehicles } from '../services/transportService';
import { getAuditLogs } from '../services/auditService';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [saved, setSaved] = useState(false);
  const [staff, setStaff] = useState<StaffData[]>([]);

  const fetchStaff = async () => {
    try {
      const staffData = await getStaff();
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSave = async (settingName: string) => {
    await logAction('Admin', 'Super Admin', `Updated ${settingName} Settings`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const [students, classes, staffList, feeTypes, feeGroups, transactions, books, vehicles, auditLogs] = await Promise.all([
        getStudents(),
        getClasses(),
        getStaff(),
        getFeeTypes(),
        getFeeGroups(),
        getTransactions(),
        getBooks(),
        getVehicles(),
        getAuditLogs()
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          students,
          classes,
          staff: staffList,
          feeTypes,
          feeGroups,
          transactions,
          books,
          vehicles,
          auditLogs
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mn_school_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Backup failed", e);
      alert("Failed to create backup.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const tabs = [
    { id: 'core', label: 'Core Setup', icon: <PenTool size={18} /> },
    { id: 'academic', label: 'Academic & Subjects', icon: <BookOpen size={18} /> },
    { id: 'finance', label: 'Finance & Fees', icon: <CreditCard size={18} /> },
    { id: 'rbac', label: 'Roles & Permissions', icon: <Shield size={18} /> },
    { id: 'backup', label: 'Data Backup', icon: <HardDrive size={18} /> },
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
          
          {activeTab === 'core' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ margin: '0 0 24px 0' }}>Core School Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>School Name (Appears on Receipts)</label>
                  <input type="text" className="glass-input" defaultValue="MN Public School" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number</label>
                  <input type="text" className="glass-input" defaultValue="+91 98765 43210" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
                  <input type="text" className="glass-input" defaultValue="info@mnpublicschool.com" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Current Academic Session</label>
                  <select className="glass-input">
                    <option>2023-2024 (Active)</option>
                    <option>2024-2025</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => handleSave('Core')}>Save Changes</button>
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

          {activeTab === 'finance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ margin: '0 0 24px 0' }}>Fee Types & Discounts</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage all fee heads, late fines, and dynamic discounts (e.g. Sibling discount).</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Dynamic Fee Assignment</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Standard fees (like Monthly Tuition) are now attached directly to Classes. To set up or modify a class's base fee, go to the <strong>Academic & Subjects</strong> tab and edit/create a Class.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
                    Custom charges or fines can be applied directly via the individual <strong>Student Profile</strong> page.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Automation</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Auto-Apply Late Fine (₹50/day after 10th)</span>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Auto-Apply Sibling Discount (25%)</span>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Enable Online Payment Gateway (Razorpay)</span>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'backup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <HardDrive size={40} />
              </div>
              <h2 style={{ margin: '0 0 16px 0' }}>Secure Cloud Backup</h2>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>Manual Database Backup</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Download a complete snapshot of all school data.</p>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={handleBackup} disabled={isBackingUp}>
                <Database size={18} /> {isBackingUp ? 'Generating JSON...' : 'Perform Backup Now'}
              </button>
            </div></motion.div>
          )}

          {activeTab === 'academic' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Class & Section Hierarchy</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Define the structure of your school and subjects taught in each class. These appear in dropdowns across the ERP.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: 'var(--primary)' }}><BookOpen size={24} /></div>
                    <h3 style={{ margin: 0 }}>Manage Classes</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>Class and Section management has been moved to its own dedicated section in the sidebar.</p>
                  <a href="/classes" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>Go to Classes</a>
                </div>
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
