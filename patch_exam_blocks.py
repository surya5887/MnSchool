import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add a helper function at the top of the component
helper_code = '''
  const addBlockToQuestion = (sIdx: number, qIdx: number, type: string) => {
    const newSecs = [...paperData!.sections];
    if (!newSecs[sIdx].questions[qIdx].blocks) {
      newSecs[sIdx].questions[qIdx].blocks = [];
    }
    
    const newBlock: any = {
      id: Math.random().toString(36).substring(7),
      type,
    };

    if (type === 'table') {
      newBlock.rows = 3;
      newBlock.cols = 3;
      newBlock.data = Array(3).fill(null).map(() => Array(3).fill(''));
    } else if (type === 'split_column') {
      newBlock.leftContent = '';
      newBlock.rightContent = '';
      newBlock.splitRatio = '50-50';
    } else if (type === 'match') {
      newBlock.pairs = [{ left: '', right: '' }, { left: '', right: '' }];
    } else if (type === 'mcq') {
      newBlock.question = '';
      newBlock.options = ['', '', '', ''];
    } else if (type === 'image_group') {
      newBlock.images = [];
      newBlock.layout = 'grid';
    }

    newSecs[sIdx].questions[qIdx].blocks!.push(newBlock);
    setPaperData({...paperData!, sections: newSecs});
  };
'''

code = code.replace("  const [activeTab, setActiveTab] = useState('paper_builder');", "  const [activeTab, setActiveTab] = useState('paper_builder');\n" + helper_code)

# Add buttons to the toolbar
old_toolbar_end = '''                        <button className="btn-secondary" style={{ padding: "6px", color: "var(--danger)", width: "auto", marginBottom: 0, marginLeft: 'auto', background: 'white', border: '1px solid #fca5a5' }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions.splice(qIdx, 1);
                          setPaperData({...paperData, sections: newSecs});
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>'''

new_toolbar_end = '''                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onClick={() => addBlockToQuestion(sIdx, qIdx, 'table')}>
                          <Grid size={14} /> Table/Grid
                        </button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onClick={() => addBlockToQuestion(sIdx, qIdx, 'split_column')}>
                          <LayoutTemplate size={14} /> Split Cols
                        </button>
                        <select className="glass-input" style={{ padding: '4px 8px', fontSize: '0.85rem', height: 'auto', width: 'auto', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onChange={(e) => {
                          if (e.target.value) {
                            addBlockToQuestion(sIdx, qIdx, e.target.value);
                            e.target.value = "";
                          }
                        }}>
                          <option value="">+ More Blocks...</option>
                          <option value="match">Matching</option>
                          <option value="mcq">MCQ Block</option>
                          <option value="image_group">Images</option>
                          <option value="text">Text/Math</option>
                        </select>
                        <button className="btn-secondary" style={{ padding: "6px", color: "var(--danger)", width: "auto", marginBottom: 0, marginLeft: 'auto', background: 'white', border: '1px solid #fca5a5' }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions.splice(qIdx, 1);
                          setPaperData({...paperData, sections: newSecs});
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>'''

code = code.replace(old_toolbar_end, new_toolbar_end)

# Add hideToolbar to BlockCanvas
code = code.replace("<BlockCanvas \n                        blocks={q.blocks || []}", "<BlockCanvas hideToolbar={true} \n                        blocks={q.blocks || []}")

# Ensure Grid and LayoutTemplate are imported from lucide-react
if "Grid," not in code:
    code = code.replace("import { Trash2, Plus", "import { Trash2, Plus, Grid, LayoutTemplate")

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
