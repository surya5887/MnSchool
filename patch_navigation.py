import re
import os

file_path = 'src/pages/DefaultersList.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'useNavigate' not in content:
    content = content.replace("import { Search,", "import { useNavigate } from 'react-router-dom';\nimport { Search,")
    # If the first failed:
    if 'useNavigate' not in content:
        content = content.replace("import React,", "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';\n//")

# 2. Add hook inside component
if 'const navigate = useNavigate();' not in content:
    content = content.replace("const DefaultersList: React.FC = () => {", "const DefaultersList: React.FC = () => {\n  const navigate = useNavigate();")

# 3. Add onClick and hover styles to the name
# <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.15rem', letterSpacing: '-0.3px' }}>{d.student.firstName} {d.student.lastName}</div>
old_name_div = r"<div style=\{\{\s*fontWeight:\s*700,\s*color:\s*'#1e293b',\s*fontSize:\s*'1\.15rem',\s*letterSpacing:\s*'-0\.3px'\s*\}\}>\{d\.student\.firstName\}\s*\{d\.student\.lastName\}</div>"
new_name_div = """<div 
                                onClick={() => navigate(`/student/${d.student.id}`)}
                                style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.15rem', letterSpacing: '-0.3px', cursor: 'pointer', textDecoration: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                              >
                                {d.student.firstName} {d.student.lastName}
                              </div>"""
content = re.sub(old_name_div, new_name_div, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added click navigation to student name.")
