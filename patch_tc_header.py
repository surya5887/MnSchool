import re

file_path = 'src/components/TransferCertificatePrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS for the new header and margins
old_css = """                  .paper-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 15mm !important; box-shadow: none !important; }
                  .paper-container * { visibility: visible !important; }
                  .no-print { display: none !important; }
                  @page { size: A4 portrait; margin: 0; }
               }
               @media screen and (max-width: 768px) {
                  .paper-container {
                      zoom: 0.45;
                  }
               }
               .tc-row { display: flex; align-items: flex-end; margin-bottom: 14px; font-size: 14.5px; color: #333; }
               .tc-label { white-space: nowrap; }
               input.tc-editable { font-family: 'Times New Roman', serif; font-size: 15px !important; text-transform: uppercase; }
            `}} />"""

new_css = """                  .paper-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 10mm 8mm !important; box-shadow: none !important; }
                  .paper-container * { visibility: visible !important; }
                  .no-print { display: none !important; }
                  @page { size: A4 portrait; margin: 0; }
               }
               @media screen and (max-width: 768px) {
                  .paper-container {
                      zoom: 0.45;
                  }
               }
               .rc-header-flex { display: flex; align-items: center; justify-content: center; border-bottom: 4px solid #b91c1c; padding-bottom: 20px; margin-bottom: 30px; }
               .rc-logo-box { flex: 0 0 160px; text-align: center; }
               .rc-logo-box img { width: 140px; height: 140px; object-fit: contain; }
               .rc-header-text { flex: 1; text-align: left; padding: 0 10px 0 30px; }
               .rc-header-text h1 { font-size: 38px; font-weight: 900;  color: #b91c1c; margin: 0 0 10px 0; font-family: 'Arial Black', Impact, sans-serif; letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
               .rc-header-text h3 { font-size: 16px; color: #1e3a8a; margin: 0 0 8px 0; font-weight: bold; font-family: 'Arial', sans-serif;}
               .rc-header-text p { font-size: 13px; margin: 5px 0; font-weight: bold; color: #000; font-family: 'Arial', sans-serif;}

               .tc-row { display: flex; align-items: flex-end; margin-bottom: 14px; font-size: 14.5px; color: #333; }
               .tc-label { white-space: nowrap; }
               input.tc-editable { font-family: 'Times New Roman', serif; font-size: 15px !important; text-transform: uppercase; }
            `}} />"""

content = content.replace(old_css, new_css)

# 2. Update the header HTML block
old_header = """                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '16px', gap: '20px', marginBottom: '30px' }}>
                     {settings?.logo && (
                        <img src={settings.logo} alt="School Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                     )}
                     <div style={{ textAlign: 'center' }}>
                         <h1 style={{ margin: '0', fontSize: '32px', color: '#1e3a8a', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>{settings?.name || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a' }}>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>
                            {settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '14.5px', color: '#444' }}>{settings.recognitionText}</p>}
                     </div>
                </div>"""

new_header = """                {/* HEADER */}
                <div className="rc-header-flex">
                    <div className="rc-logo-box"><img src={settings?.logo || "/images/logo_circular.png"} alt="School Logo" /></div>
                    <div className="rc-header-text">
                        <h1>{settings?.name || 'M.N. PUBLIC SCHOOL'}</h1>
                        <h3>{settings?.recognitionText || 'Recognition from UP Board (CBSE Pattern for English Medium)'}</h3>
                        <p>Email: {settings?.email || 'mnpsharsoli@gmail.com'} &nbsp;&nbsp;|&nbsp;&nbsp; Mobile No.: {settings?.phone || '8477025152'}</p>
                        <p>{settings?.address || 'Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India'}</p>
                    </div>
                </div>"""

content = content.replace(old_header, new_header)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated header to report card style and reduced margins")
