import re

file_path = 'src/components/Layout.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific settings fetch block in Layout
pattern = re.compile(
    r'const settings = await getSchoolSettings\(\);\s*if \(settings && settings\.activeSession\) \{\s*setActiveSession\(settings\.activeSession\);\s*localStorage\.setItem\(\'activeSession\', settings\.activeSession\);\s*\}'
)

new_fetch = """const settings = await getSchoolSettings();
          if (settings) {
            setSchoolSettings(settings);
            if (settings.activeSession) {
              setActiveSession(settings.activeSession);
              localStorage.setItem('activeSession', settings.activeSession);
            }
          }"""

content = pattern.sub(new_fetch, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace applied")
