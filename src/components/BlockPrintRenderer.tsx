import React from 'react';
import type { PaperBlock } from '../services/examService';
import KidsGridRenderer from './BlockCanvas/KidsGridRenderer';
import KidsMatchRenderer from './BlockCanvas/KidsMatchRenderer';
import KidsTracingRenderer from './BlockCanvas/KidsTracingRenderer';
import KidsSequenceRenderer from './BlockCanvas/KidsSequenceRenderer';

interface Props {
  blocks: PaperBlock[];
}

const parseInlineBoxes = (html: string) => {
    if (!html) return '';
    return html.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        if (!p1.trim()) {
            return '<span style="display: inline-block; width: 60px; border-bottom: 1px dashed #000;">&nbsp;</span>';
        }
        if (p1.includes('/')) {
            const opts = p1.split('/').map((o: string) => o.trim()).join(' / ');
            return `[ ${opts} ]`;
        }
        return `<span style="border: 1px solid #000; padding: 2px 8px; border-radius: 4px; margin: 0 4px;">${p1}</span>`;
    });
};

const BlockPrintRenderer: React.FC<Props> = ({ blocks }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'kids_activity': {
            const kBlock = block as any;
            if (kBlock.layoutType === 'grid') return <KidsGridRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'match_columns') return <KidsMatchRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'tracing') return <KidsTracingRenderer key={kBlock.id} block={kBlock} />;
            if (kBlock.layoutType === 'sequence') return <KidsSequenceRenderer key={kBlock.id} block={kBlock} />;
            return null;
          }

          case 'header':
            return (
              <div key={idx} style={{ marginBottom: '20px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '100px', textAlign: 'left' }}>
                    {block.leftLogo && <img src={block.leftLogo} alt="" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase' }}>{block.title}</h1>
                    {block.subtitle && <h2 style={{ margin: '0', fontSize: '18px' }}>{block.subtitle}</h2>}
                  </div>

                  <div style={{ width: '100px', textAlign: 'right' }}>
                    {block.rightLogo && <img src={block.rightLogo} alt="" style={{ maxWidth: '100px', maxHeight: '100px' }} />}
                  </div>
                </div>

                {block.fields && block.fields.length > 0 && (
                  <table style={{ width: '100%', marginTop: '10px', fontSize: '14px' }}>
                    <tbody>
                      <tr style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between' }}>
                        {block.fields.map((f, fIdx) => (
                          <td key={fIdx} style={{ padding: '4px 0' }}>
                            <span style={{ fontWeight: 'bold' }}>{f.label}:</span> 
                            {f.value ? <span style={{ marginLeft: '4px', borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '50px' }}>{f.value}</span> : <span style={{ marginLeft: '4px', borderBottom: '1px dotted #000', display: 'inline-block', width: '100px' }}></span>}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                )}
                
                <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '10px 0' }} />
              </div>
            );

          case 'text':
            return (
              <div key={idx} style={{ position: 'relative' }}>
                <div dangerouslySetInnerHTML={{ __html: parseInlineBoxes(block.content.replace(/\n/g, '<br/>')) }} />
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: 0, fontWeight: 'bold' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );

          case 'mcq':
            return (
              <div key={idx} style={{ position: 'relative' }}>
                <div dangerouslySetInnerHTML={{ __html: parseInlineBoxes(block.question.replace(/\n/g, '<br/>')) }} />
                
                {block.layout === 'inline' ? (
                  <div style={{ marginTop: '8px' }}>
                    [ {block.options.map(o => o.text).join(' / ')} ]
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: block.layout === '4-col' ? '1fr 1fr 1fr 1fr' : block.layout === '2-col' ? '1fr 1fr' : '1fr', 
                    gap: '8px', 
                    marginTop: '12px' 
                  }}>
                    {block.options.map((opt: any, oIdx: number) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ marginTop: '2px' }}>({String.fromCharCode(97 + oIdx)})</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {opt.imageUrl && <img src={opt.imageUrl} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />}
                          {opt.text && <span>{opt.text}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(block.showBracket || block.showMarks) && (
                  <div style={{ position: 'absolute', right: 0, bottom: 0, fontWeight: 'bold', display: 'flex', gap: '8px' }}>
                    {block.showBracket && <span>[ &nbsp;&nbsp;&nbsp;&nbsp; ]</span>}
                    {block.showMarks && block.marks !== undefined && <span>[{block.marks}]</span>}
                  </div>
                )}
              </div>
            );

          case 'table': {
            const skipCells = new Set<string>();
            
            // Extract table-level border settings or default to 1px solid #000
            const tbBorderWidth = (block as any).tableBorderWidth !== undefined ? (block as any).tableBorderWidth : 1;
            const tbBorderColor = (block as any).tableBorderColor || '#000000';
            const tbBorderStr = `${tbBorderWidth}px solid ${tbBorderColor}`;

            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', position: 'relative' }}>
                <table style={{ borderCollapse: 'collapse', minWidth: '50%' }}>
                  <tbody>
                    {Array.from({ length: block.rows }).map((_, r) => (
                      <tr key={r}>
                        {Array.from({ length: block.cols }).map((_, c) => {
                          if (skipCells.has(`${r}-${c}`)) return null;

                          const cell = block.cells.find(cl => cl.rowIndex === r && cl.colIndex === c) as any || { content: '' };
                          
                          // Handle colSpan and rowSpan to skip rendering cells that are merged over
                          const cSpan = cell.colSpan && cell.colSpan > 1 ? cell.colSpan : 1;
                          const rSpan = cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : 1;
                          
                          if (cSpan > 1 || rSpan > 1) {
                             for (let i = 0; i < rSpan; i++) {
                               for (let j = 0; j < cSpan; j++) {
                                 if (i === 0 && j === 0) continue;
                                 skipCells.add(`${r+i}-${c+j}`);
                               }
                             }
                          }

                          const TdOrTh = cell.isHeader ? 'th' : 'td';
                          
                          // Calculate background color
                          let bgColor = 'transparent';
                          if (cell.bgColor) bgColor = cell.bgColor;
                          else if (cell.isHeader) bgColor = '#f1f5f9';
                          else if ((block as any).tableBgColor) bgColor = (block as any).tableBgColor;

                          // Calculate text color
                          let txtColor = '#000000';
                          if (cell.textColor) txtColor = cell.textColor;
                          else if ((block as any).tableTextColor) txtColor = (block as any).tableTextColor;

                          return (
                            <TdOrTh key={c} colSpan={cSpan} rowSpan={rSpan} style={{
                              padding: '2px 4px', // Reduced padding
                              textAlign: 'center',
                              border: cell.hideBorder ? 'none' : tbBorderStr,
                              fontWeight: cell.isHeader ? 'bold' : 'normal', // Normal by default unless header
                              backgroundColor: bgColor,
                              color: txtColor,
                              minWidth: '40px',
                              height: '24px'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: cell.content?.replace(/\n/g, '<br/>') || '' }} />
                            </TdOrTh>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: 0, fontWeight: 'bold' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );
          }

          case 'image_group':
            return (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{ 
                  display: block.layout === 'row' ? 'flex' : 'flex', 
                  flexWrap: block.layout === 'grid' ? 'wrap' : 'nowrap',
                  gap: '24px', 
                  justifyContent: 'space-around' 
                }}>
                  {block.images.map((img, iIdx) => (
                    <div key={iIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${img.width || 100}%` }}>
                      <img src={img.url} alt="" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        {img.showTickBox && (
                          <div style={{ width: '16px', height: '16px', border: '1px solid #000' }}></div>
                        )}
                        {img.caption && <span style={{ fontWeight: 'bold' }}>{img.caption}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: 0, fontWeight: 'bold' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );

          case 'split_column':
            return (
              <div key={idx} style={{ display: 'flex', gap: '40px', width: '100%', position: 'relative' }}>
                <div style={{ flex: 1 }}>
                  <BlockPrintRenderer blocks={block.leftBlocks || []} />
                </div>
                <div style={{ width: '1px', background: '#ccc' }}></div>
                <div style={{ flex: 1 }}>
                  <BlockPrintRenderer blocks={block.rightBlocks || []} />
                </div>
              </div>
            );

          case 'word_bank':
            return (
              <div key={idx} style={{ marginTop: '16px', padding: '12px', border: '1px solid #000', borderRadius: '4px', textAlign: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
                  {(block.words || []).map((word, wIdx) => (
                    <span key={wIdx} style={{ fontWeight: 'bold' }}>{word}</span>
                  ))}
                </div>
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: -20, fontWeight: 'bold' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlockPrintRenderer;
