import re

file_path = 'src/pages/NewAdmission.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Insert the <style> block right after the opening div of NewAdmission
style_block = """<div className="new-admission-container">
        <style>
          {`
            .submit-dock-wrapper {
              position: sticky;
              bottom: 24px;
              z-index: 100;
              display: flex;
              justify-content: center;
              width: 100%;
              margin-top: 32px;
            }
            .submit-dock {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 24px;
              background: rgba(255, 255, 255, 0.85);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              padding: 16px 24px;
              border-radius: 24px;
              border: 1px solid rgba(255, 255, 255, 0.6);
              box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
              width: 100%;
              flex-wrap: wrap;
            }
            .submit-notice-icon {
              background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
              color: white;
              padding: 12px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
            }
            .submit-notice-title {
              margin: 0 0 6px 0;
              color: #1e293b;
              font-size: 1.05rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.3px;
            }
            .submit-notice-text {
              margin: 0;
              font-size: 0.9rem;
              color: #64748b;
              line-height: 1.4;
              font-weight: 500;
            }
            .submit-buttons {
              display: flex;
              gap: 16px;
              align-items: center;
              flex-wrap: wrap;
            }
            
            @media (max-width: 768px) {
              .submit-dock-wrapper {
                bottom: 12px !important;
                margin-top: 16px !important;
              }
              .submit-dock {
                padding: 12px !important;
                gap: 12px !important;
                border-radius: 16px !important;
                flex-direction: column;
                align-items: stretch;
              }
              .submit-notice-container {
                gap: 10px !important;
              }
              .submit-notice-icon {
                padding: 8px !important;
                border-radius: 10px !important;
              }
              .submit-notice-icon svg {
                width: 18px !important;
                height: 18px !important;
              }
              .submit-notice-title {
                font-size: 0.85rem !important;
                margin-bottom: 2px !important;
                gap: 6px !important;
              }
              .submit-notice-text {
                font-size: 0.75rem !important;
                line-height: 1.25 !important;
              }
              .submit-notice-title span {
                font-size: 0.6rem !important;
                padding: 2px 6px !important;
              }
              .submit-buttons {
                width: 100%;
                display: flex;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 8px !important;
              }
              .submit-buttons button {
                flex: 1;
                padding: 10px 12px !important;
                font-size: 0.9rem !important;
                justify-content: center;
                border-radius: 12px !important;
              }
              .submit-buttons button svg {
                width: 16px !important;
                height: 16px !important;
              }
            }
          `}
        </style>
"""

content = content.replace("<div className=\"new-admission-container\">", style_block)

# Replace the inline styles with the classes
old_dock = """              {/* Submit Bar Dock */}
              <div style={{ position: 'sticky', bottom: '24px', zIndex: 100, display: 'flex', justifyContent: 'center', width: '100%', marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', padding: '16px 24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', width: '100%', flexWrap: 'wrap' }}>
                  
                  {/* Attractive Notice */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 350px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)' }}>
                      <Info size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
                        Login Information <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid #fee2e2' }}>Required</span>
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.4', fontWeight: 500 }}>
                        <strong>Email ID</strong> is mandatory for student portal access. <br/>Default password is <strong>First Name + Birth Year</strong> (e.g. RAHUL2015).
                      </p>
                    </div>
                  </div>
  
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setFormData(INITIAL_FORM_DATA)} className="hover-scale" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700, borderRadius: '16px', color: '#ef4444', background: '#fff', border: '2px solid #fee2e2', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }} onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Reset Form
                    </button>
                    <button type="submit" disabled={loading} className="hover-scale" style={{ padding: '14px 36px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '16px', color: 'white', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16,185,129,0.35)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {loading ? 'Saving...' : <><Save size={20} /> Enroll Student</>}
                    </button>
                  </div>
                </div>
              </div>"""

new_dock = """              {/* Submit Bar Dock */}
              <div className="submit-dock-wrapper">
                <div className="submit-dock">
                  
                  {/* Attractive Notice */}
                  <div className="submit-notice-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 350px' }}>
                    <div className="submit-notice-icon">
                      <Info size={24} />
                    </div>
                    <div>
                      <h4 className="submit-notice-title">
                        Login Information <span>Required</span>
                      </h4>
                      <p className="submit-notice-text">
                        <strong>Email ID</strong> is mandatory for student portal access. <br/>Default password is <strong>First Name + Birth Year</strong> (e.g. RAHUL2015).
                      </p>
                    </div>
                  </div>
  
                  {/* Buttons */}
                  <div className="submit-buttons">
                    <button type="button" onClick={() => setFormData(INITIAL_FORM_DATA)} className="hover-scale" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700, borderRadius: '16px', color: '#ef4444', background: '#fff', border: '2px solid #fee2e2', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }} onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Reset Form
                    </button>
                    <button type="submit" disabled={loading} className="hover-scale" style={{ padding: '14px 36px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '16px', color: 'white', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16,185,129,0.35)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {loading ? 'Saving...' : <><Save size={20} /> Enroll Student</>}
                    </button>
                  </div>
                </div>
              </div>"""

content = content.replace(old_dock, new_dock)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied responsive submit dock.")
