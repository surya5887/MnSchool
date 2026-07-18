import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, Save, FileText, Camera } from 'lucide-react';

const NewAdmission: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title"><UserPlus size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> New Admission</h1>
        <p className="page-subtitle">Enroll a new student into the system with full digital records.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        
        {/* Left Column - Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Basic Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>First Name</label>
                <input type="text" className="glass-input" placeholder="e.g. Rahul" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Last Name</label>
                <input type="text" className="glass-input" placeholder="e.g. Kumar" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Birth</label>
                <input type="date" className="glass-input" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Gender</label>
                <select className="glass-input">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Academic & Fee Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Admission to Class</label>
                <select className="glass-input">
                  <option>Class 1</option>
                  <option>Class 5</option>
                  <option>Class 10</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
                <select className="glass-input">
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Fee Group Assignment</label>
                <select className="glass-input">
                  <option>General Fee Category</option>
                  <option>RTE Quota (Free)</option>
                  <option>Staff Child (50% Off)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Transport Route</label>
                <select className="glass-input">
                  <option>Not Required</option>
                  <option>Route 1 - Civil Lines (+ ₹1500)</option>
                  <option>Route 2 - Station Road (+ ₹1000)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Custom Fields & KYC (Aadhar/PAN)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Aadhar Number</label>
                <input type="text" className="glass-input" placeholder="0000 0000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Blood Group</label>
                <input type="text" className="glass-input" placeholder="e.g. O+" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Parent PAN Number (For Tax)</label>
                <input type="text" className="glass-input" placeholder="ABCDE1234F" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Mother Tongue</label>
                <input type="text" className="glass-input" placeholder="e.g. Hindi" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Photo & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Student Photo</h3>
            <div style={{ width: '150px', height: '150px', borderRadius: '12px', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '16px', background: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              <Camera size={32} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.85rem' }}>Upload Photo</span>
            </div>
            
            <h3 style={{ margin: '16px 0', alignSelf: 'flex-start' }}>Documents</h3>
            <button className="btn-secondary" style={{ width: '100%', marginBottom: '12px' }}>
              <Upload size={16} /> Upload Birth Certificate
            </button>
            <button className="btn-secondary" style={{ width: '100%' }}>
              <Upload size={16} /> Upload TC / Marksheet
            </button>
          </div>

          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Finalize</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Please verify all details before submitting. An SMS will be automatically sent to the parents upon admission.</p>
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Save size={18} /> Confirm Admission
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewAdmission;
