import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, HardDrive, BookOpen, CreditCard, PenTool } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');

  const tabs = [
    { id: 'core', label: 'Core Setup', icon: <PenTool size={18} /> },
    { id: 'academic', label: 'Academic & Subjects', icon: <BookOpen size={18} /> },
    { id: 'finance', label: 'Finance & Fees', icon: <CreditCard size={18} /> },
    { id: 'rbac', label: 'Roles & Permissions', icon: <Shield size={18} /> },
    { id: 'backup', label: 'Data Backup', icon: <HardDrive size={18} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title"><Settings size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> System Settings</h1>
        <p className="page-subtitle">Configure the core modules, classes, and administrative access of your ERP.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Settings Sidebar */}
        <div className="glass-panel" style={{ width: '250px', padding: '12px' }}>
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
                  <button className="btn-primary" style={{ marginTop: '16px' }}>Save Changes</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rbac' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Role-Based Access Control (RBAC)</h2>
                <button className="btn-primary">Add New Role</button>
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
                      <td>2 Users</td>
                      <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Accountant</td>
                      <td>Fee Collection, Ledger View, Expenses</td>
                      <td>1 User</td>
                      <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Teacher</td>
                      <td>Mark Attendance, Student Directory View</td>
                      <td>14 Users</td>
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
                  <h3 style={{ margin: '0 0 16px 0' }}>Fee Heads</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}><span>Tuition Fee (Monthly)</span> <span>Active</span></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}><span>Admission Fee (One-time)</span> <span>Active</span></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}><span>Transport Fee (Monthly)</span> <span>Active</span></li>
                  </ul>
                  <button className="btn-secondary" style={{ marginTop: '16px', width: '100%' }}>+ Add New Head</button>
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Your data is automatically backed up every 24 hours to secure AWS servers. You can also trigger a manual backup and download it.
              </p>
              <button className="btn-primary" style={{ padding: '12px 24px' }}>
                Generate & Download Database Backup
              </button>
            </motion.div>
          )}

          {activeTab === 'academic' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ margin: '0 0 24px 0' }}>Class & Section Hierarchy</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Define the structure of your school and subjects taught in each class.</p>
              
              <div className="glass-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Sections</th>
                      <th>Subjects Assigned</th>
                      <th>Class Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Class 1</td>
                      <td>A, B</td>
                      <td>English, Hindi, Maths, EVS</td>
                      <td>Aditi Sharma</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Class 10</td>
                      <td>A, B, C</td>
                      <td>English, Hindi, Maths, Science, SST</td>
                      <td>Rahul Verma</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default SystemSettings;
