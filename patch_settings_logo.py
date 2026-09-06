import re

file_path = 'src/pages/SystemSettings.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'ImageCropperModal' not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport ImageCropperModal from '../components/ImageCropperModal';")

# 2. State and Handlers
state_injection = """
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = (croppedBase64: string) => {
    setSettings(prev => prev ? { ...prev, logoUrl: croppedBase64 } : prev);
    setCropImageSrc(null);
  };
"""
if 'const fileInputRef' not in content:
    content = content.replace("const [newSessionInput, setNewSessionInput] = useState('');", "const [newSessionInput, setNewSessionInput] = useState('');" + state_injection)

# 3. UI Addition in Core Setup
# Let's insert the logo block right before the School Name block
logo_ui = """
                      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div>
                           <img src={settings?.logoUrl || '/images/logo_circular.png'} alt="School Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }} />
                        </div>
                        <div>
                           <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>School Logo</h3>
                           <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>This logo will appear on all certificates and report cards.</p>
                           <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Change Logo</button>
                           <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" style={{ display: 'none' }} />
                        </div>
                      </div>
"""
if 'School Logo</h3>' not in content:
    content = content.replace("<div className=\"settings-grid\" style={{ display: 'grid', gap: '24px' }}>", "<div className=\"settings-grid\" style={{ display: 'grid', gap: '24px' }}>" + logo_ui)

# 4. Render modal at the end of the return statement
modal_ui = """
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={onCropComplete}
        />
      )}
"""
if '<ImageCropperModal' not in content:
    content = content.replace("</AnimatePresence>\n    </>", "</AnimatePresence>\n" + modal_ui + "\n    </>")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched SystemSettings with Logo UI")
