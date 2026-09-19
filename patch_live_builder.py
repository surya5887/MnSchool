import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans', 'Merriweather', 'Noto Sans', 'Nunito',
  'Concert One', 'Playfair Display', 'Rubik', 'Lora', 'Ubuntu', 'Work Sans', 'Fira Sans', 'Quicksand', 'Inter', 'Poppins', 'Roboto Condensed', 'Karla',
  'Inconsolata', 'Bitter', 'Pacifico', 'Dancing Script', 'Caveat', 'Righteous', 'Creepster', 'Lobster', 'Fredoka One', 'Comfortaa', 'Shadows Into Light', 'Cinzel',
  'Amatic SC', 'Bangers', 'Permanent Marker', 'Courgette', 'Satisfy', 'Alfa Slab One', 'Cookie', 'Chewy', 'Bree Serif'
]
fonts_html = "".join([f'<option value="{font}">{font}</option>' for font in fonts])

old_select = '''                      <div style={{ display: 'flex', gap: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Question Type</label>
                          <select className="glass-input" style={{ marginBottom: 0, background: 'white' }} value={q.type || 'subjective'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { type: e.target.value })}>
                            <option value="subjective">Subjective</option>
                            <option value="objective">Objective (MCQ)</option>
                            <option value="true_false">True / False</option>
                            <option value="match">Match the Following</option>
                            <option value="fill_in_the_blanks">Fill in Blanks</option>
                            <option value="instruction">Instruction</option>
                          </select>
                        </div>'''

new_select = f'''                      <div style={{ display: 'flex', gap: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Font Style</label>
                          <select className="glass-input" style={{ marginBottom: 0, background: 'white', fontFamily: q.fontFamily || 'inherit' }} value={{q.fontFamily || ''}} onChange={{e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, {{ fontFamily: e.target.value }})}}>
                            <option value="">Default Font</option>
                            {fonts_html}
                          </select>
                        </div>'''

code = code.replace(old_select, new_select)

with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

