import re

file_path = 'src/pages/NewAdmission.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("{/* Submit Bar Dock */}")
end_idx = content.find("</form>")

if start_idx != -1 and end_idx != -1:
    new_dock_str = """{/* Submit Bar Dock */}
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
                    <button type="button" onClick={() => setFormData(INITIAL_FORM_DATA)} className="hover-scale reset-btn" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700, borderRadius: '16px', color: '#ef4444', background: '#fff', border: '2px solid #fee2e2', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }} onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Reset
                    </button>
                    <button type="submit" disabled={loading} className="hover-scale submit-btn" style={{ padding: '14px 36px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '16px', color: 'white', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16,185,129,0.35)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {loading ? 'Saving...' : <><Save size={20} /> Enroll</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        """
              
    content = content[:start_idx] + new_dock_str + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced.")
else:
    print("Could not find bounds.")
