import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_table = '''          case 'table':
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', position: 'relative' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {Array.from({ length: block.rows }).map((_, r) => (
                      <tr key={r}>
                        {Array.from({ length: block.cols }).map((_, c) => {
                          const cell = block.cells.find(cl => cl.rowIndex === r && cl.colIndex === c);
                          return (
                            <td key={c} style={{ 
                              width: '40px', 
                              height: '40px', 
                              textAlign: 'center', 
                              border: cell?.hideBorder ? 'none' : '1px solid #000',
                              fontWeight: 'bold'
                            }}>
                              {cell?.content}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );'''

new_table = '''          case 'table': {
            const skipCells = new Set<string>();
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', position: 'relative' }}>
                <table style={{ borderCollapse: 'collapse', minWidth: '50%' }}>
                  <tbody>
                    {Array.from({ length: block.rows }).map((_, r) => (
                      <tr key={r}>
                        {Array.from({ length: block.cols }).map((_, c) => {
                          if (skipCells.has(${r}-)) return null;

                          const cell = block.cells.find(cl => cl.rowIndex === r && cl.colIndex === c) as any || { content: '' };
                          
                          if (cell.colSpan > 1 || cell.rowSpan > 1) {
                             for (let i = 0; i < (cell.rowSpan || 1); i++) {
                               for (let j = 0; j < (cell.colSpan || 1); j++) {
                                 if (i === 0 && j === 0) continue;
                                 skipCells.add(${r+i}-);
                               }
                             }
                          }

                          const TdOrTh = cell.isHeader ? 'th' : 'td';
                          return (
                            <TdOrTh key={c} colSpan={cell.colSpan || 1} rowSpan={cell.rowSpan || 1} style={{
                              padding: '8px',
                              textAlign: 'center',
                              border: cell.hideBorder ? 'none' : '1px solid #000',
                              fontWeight: cell.isHeader ? 'bold' : 'normal',
                              backgroundColor: cell.bgColor || (cell.isHeader ? '#f1f5f9' : 'transparent'),
                              color: cell.textColor || '#000000',
                              minWidth: '40px',
                              height: '40px'
                            }}>
                              {cell.content}
                            </TdOrTh>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.showMarks && block.marks !== undefined && (
                  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                    [{block.marks}]
                  </div>
                )}
              </div>
            );
          }'''

code = code.replace(old_table, new_table)

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
