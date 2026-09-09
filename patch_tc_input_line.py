import re

file_path = 'src/components/TransferCertificatePrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_input_line = """const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end', marginLeft: '8px' }}>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="tc-editable"
        size={value ? Math.max(String(value).length, 1) : 1}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '14.5px',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          minWidth: '50px',
          maxWidth: '100%'
        }}
      />
      <div style={{ flex: 1, borderBottom: '1px solid #000', marginBottom: '4px', minWidth: '20px' }}></div>
    </div>
  );"""

new_input_line = """const InputLine = ({ name, value, onChange, width = '100%', placeholder = '' }: any) => (
    <div style={{ display: 'inline-flex', flex: width === '100%' ? 1 : 'none', width: width !== '100%' ? width : 'auto', alignItems: 'flex-end', marginLeft: '8px' }}>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="tc-editable"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #000',
          outline: 'none',
          fontSize: '14.5px',
          fontFamily: 'inherit',
          padding: '0 4px',
          color: '#000',
          width: '100%'
        }}
      />
    </div>
  );"""

content = content.replace(old_input_line, new_input_line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated InputLine to have continuous borderBottom")
