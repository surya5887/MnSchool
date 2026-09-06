import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'if \(loading\) return <div style=\{\{ position: \'fixed\', top: 0, left: 0, right: 0, bottom: 0, background: \'#e5e7eb\', zIndex: 9999, display: \'flex\', alignItems: \'center\', justifyContent: \'center\' \}\}><Loader className="spin" size=\{48\} /></div>;')

replacement = """if (loading) return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(229, 231, 235, 0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px 60px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minWidth: '350px' }}>
         <img src="/images/logo_circular.png" alt="Logo" style={{ width: '80px', height: '80px', animation: 'pulse-slow 2s infinite' }} />
         <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e3a8a', letterSpacing: '0.5px' }}>Generating Report Card...</div>
         <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #1e3a8a, #b91c1c)', borderRadius: '10px', animation: 'loading-slide 1.5s infinite ease-in-out' }}></div>
         </div>
         <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>Fetching student records & attendance</div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );"""

new_content = pattern.sub(replacement, content)

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced loading UI.")
else:
    print("Loading UI not found or already replaced.")
