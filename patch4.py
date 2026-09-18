import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement1 = '''<div className="paper-container" style={{ fontSize: paperData.globalFontSize || '14px', position: 'relative' }}>
      {paperData.worksheetElements && paperData.worksheetElements.length > 0 ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '1130px' }}>
          {paperData.worksheetElements.map(el => (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                border: el.type === 'shape' && el.border ? '2px solid #000' : 'none',
                background: el.type === 'shape' && !el.border ? '#e5e7eb' : (el.type === 'line' ? '#000' : 'transparent'),
                display: 'flex',
                overflow: 'hidden'
              }}
            >
              {el.type === 'text' && (
                <div style={{ width: '100%', height: '100%', padding: '4px' }}>
                  <div dangerouslySetInnerHTML={{ __html: el.content || '' }} style={{ width: '100%', height: '100%' }} />
                </div>
              )}
              {el.type === 'image' && el.imageUrl && (
                <img src={el.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          {!paperData.hideStandardHeader && (
            <>
              {/* School Header */}'''

code = re.sub(r'<div className="paper-container" style=\{\{ fontSize: paperData\.globalFontSize \|\| \'14px\' \}\}>\s*\{\/\* School Header \*\/\}', replacement1, code)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
