import re

file_path = 'src/components/Layout.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'getSchoolSettings' not in content:
    content = content.replace("import { getRecentLogs } from '../services/auditService';", "import { getRecentLogs } from '../services/auditService';\nimport { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';")

if 'const [settings, setSettings]' not in content:
    content = content.replace("const [recentLogs, setRecentLogs] = useState<any[]>([]);", "const [recentLogs, setRecentLogs] = useState<any[]>([]);\n  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);")

if 'getSchoolSettings().then' not in content:
    # find the useEffect block
    fetch_code = "getSchoolSettings().then(set => { if (set) setSettings(set); });\n    "
    content = content.replace("fetchLogs();", fetch_code + "fetchLogs();")

content = content.replace('src="/images/logo_circular.png"', 'src={settings?.logoUrl || "/images/logo_circular.png"}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Layout.tsx")
