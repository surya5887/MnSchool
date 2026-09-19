import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        code = f.read()
    
    code = code.replace("import { KidsActivityBlock }", "import type { KidsActivityBlock }")
    code = code.replace("import { KidsActivityBlock, KidsActivityItem, KidsCategory, KidsLayoutType }", "import type { KidsActivityBlock, KidsActivityItem, KidsCategory, KidsLayoutType }")
    code = code.replace("import { PaperBlock, KidsActivityBlock, KidsCategory, KidsLayoutType }", "import type { PaperBlock, KidsActivityBlock, KidsCategory, KidsLayoutType }")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(code)
