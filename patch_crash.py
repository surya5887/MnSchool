import re

file_path = 'src/components/Layout.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add schoolSettings state
if 'const [schoolSettings, setSchoolSettings]' not in content:
    content = content.replace("const [activeSession, setActiveSession] = useState(localStorage.getItem('activeSession') || 'Loading...');", "const [activeSession, setActiveSession] = useState(localStorage.getItem('activeSession') || 'Loading...');\n  const [schoolSettings, setSchoolSettings] = useState<any>(null);")

# Update fetchSessionAndRunBilling
old_fetch = """      const fetchSessionAndRunBilling = async () => {
        try {
          const settings = await getSchoolSettings();
          if (settings && settings.activeSession) {
            setActiveSession(settings.activeSession);
            localStorage.setItem('activeSession', settings.activeSession);"""
            
new_fetch = """      const fetchSessionAndRunBilling = async () => {
        try {
          const settings = await getSchoolSettings();
          if (settings) {
            setSchoolSettings(settings);
            if (settings.activeSession) {
              setActiveSession(settings.activeSession);
              localStorage.setItem('activeSession', settings.activeSession);
            }
          }"""

if 'setSchoolSettings(settings)' not in content:
    content = content.replace(old_fetch, new_fetch)

# Update the img src
content = content.replace('src={settings?.logoUrl || "/images/logo_circular.png"}', 'src={schoolSettings?.logoUrl || "/images/logo_circular.png"}')
content = content.replace('<h2>{settings?.schoolName || "MN Public School"}</h2>', '<h2>{schoolSettings?.schoolName || "MN Public School"}</h2>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Layout.tsx to fix crash")
