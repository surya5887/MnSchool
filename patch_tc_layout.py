import re

file_path = 'src/components/TransferCertificatePrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Restore Original Header Layout
old_header = """<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #ccc', paddingBottom: '16px', gap: '20px', marginBottom: '30px' }}>
                     {settings?.logo && (
                        <img src={settings.logo} alt="School Logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                     )}
                     <div style={{ textAlign: 'center' }}>
                         <h1 style={{ margin: '0', fontSize: '28px', color: '#111', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{settings?.name || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#444' }}>{settings?.address ? settings.address : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#444' }}>Contact: {settings?.phone || '8447537369 / 9873872786'}</p>
                          {settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#444', fontWeight: 'bold' }}>{settings.recognitionText}</p>}
                     </div>
                </div>"""

new_header = """<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '16px', gap: '20px', marginBottom: '30px' }}>
                     {settings?.logo && (
                        <img src={settings.logo} alt="School Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                     )}
                     <div style={{ textAlign: 'center' }}>
                         <h1 style={{ margin: '0', fontSize: '32px', color: '#1e3a8a', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>{settings?.name || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a' }}>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                            {settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#444' }}>{settings.recognitionText}</p>}
                     </div>
                </div>"""

content = content.replace(old_header, new_header)

# Reduce Font Size and Margin in CSS block
old_css = """.tc-row { display: flex; align-items: flex-end; margin-bottom: 24px; font-size: 16px; color: #333; }
               .tc-label { white-space: nowrap; }
               input.tc-editable { font-family: 'Times New Roman', serif; font-size: 17px !important; text-transform: uppercase; }"""

new_css = """.tc-row { display: flex; align-items: flex-end; margin-bottom: 14px; font-size: 14.5px; color: #333; }
               .tc-label { white-space: nowrap; }
               input.tc-editable { font-family: 'Times New Roman', serif; font-size: 15px !important; text-transform: uppercase; }"""

content = content.replace(old_css, new_css)

# Update font size in footer
content = content.replace("fontSize: '16px'", "fontSize: '14.5px'")
# Note: InputLine has its own font-size which is overridden by input.tc-editable, so that's fine.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched TC")
