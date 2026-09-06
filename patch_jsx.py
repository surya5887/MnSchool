import os

file_path = 'src/pages/Examination.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the end of the file to close the fragment and add DocumentBuilder
# We need to find `    </motion.div>\n  );\n};`
content = content.replace("    </motion.div>\n  );\n};", "      </>)}\n      {activeTab === 'doc_builder' && <DocumentBuilder />}\n    </motion.div>\n  );\n};")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed JSX fragment closing.")
