import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_sec_render = '''              paperData.sections && paperData.sections.map((section, sIdx) => {
              return (
                <div key={sIdx} style={{ marginBottom: '30px' }}>
                  {section.sectionTitle && (
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: '20px 0', textDecoration: 'underline', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                      {section.sectionTitle}
                    </div>
                  )}'''

new_sec_render = '''              paperData.sections && paperData.sections.map((section, sIdx) => {
              const isSecSelected = isEditor && selectedItem?.type === 'section' && selectedItem.sIdx === sIdx;
              const secProps = isEditor ? {
                onClick: (e: any) => { e.stopPropagation(); onItemClick?.({ type: 'section', sIdx }); },
                onMouseEnter: (e: any) => { if (!isSecSelected) e.currentTarget.style.outline = '2px dashed #cbd5e1'; },
                onMouseLeave: (e: any) => { if (!isSecSelected) e.currentTarget.style.outline = '2px solid transparent'; }
              } : {};
              
              return (
                <div key={sIdx} style={{ marginBottom: '30px' }}>
                  {section.sectionTitle && (
                    <div {...secProps} style={{ 
                      textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: '20px 0', textDecoration: 'underline', pageBreakAfter: 'avoid', breakAfter: 'avoid',
                      cursor: isEditor ? 'pointer' : 'auto',
                      outline: isSecSelected ? '2px solid #3b82f6' : '2px solid transparent',
                      background: isSecSelected ? '#eff6ff' : 'transparent',
                      padding: isEditor ? '8px' : '0'
                    }}>
                      {section.sectionTitle}
                    </div>
                  )}'''

code = code.replace(old_sec_render, new_sec_render)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

