import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add imports
imports = '''import React from 'react';
import type { PaperBlock, KidsActivityBlock } from '../services/examService';
import KidsGridRenderer from './BlockCanvas/KidsGridRenderer';
import KidsMatchRenderer from './BlockCanvas/KidsMatchRenderer';
import KidsTracingRenderer from './BlockCanvas/KidsTracingRenderer';
import KidsSequenceRenderer from './BlockCanvas/KidsSequenceRenderer';'''

code = code.replace("import React from 'react';\\nimport type { PaperBlock } from '../../services/examService';", imports)

# Add case
kids_case = '''
          case 'kids_activity': {
            const kBlock = block as KidsActivityBlock;
            if (kBlock.layoutType === 'grid') return <KidsGridRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'match_columns') return <KidsMatchRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'tracing') return <KidsTracingRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'sequence') return <KidsSequenceRenderer key={kBlock.id} block={kBlock} />;
            return null;
          }
'''

code = code.replace("switch (block.type) {", "switch (block.type) {" + kids_case)

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
