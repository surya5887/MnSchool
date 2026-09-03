import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder, minHeight = '40px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  return (
    <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.03)' }}>
        <button 
          onMouseDown={e => { e.preventDefault(); execCommand('bold'); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)' }}
          title="Bold"
        ><Bold size={14} /></button>
        <button 
          onMouseDown={e => { e.preventDefault(); execCommand('italic'); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)' }}
          title="Italic"
        ><Italic size={14} /></button>
        <button 
          onMouseDown={e => { e.preventDefault(); execCommand('underline'); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)' }}
          title="Underline"
        ><Underline size={14} /></button>
      </div>
      
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ 
          padding: '10px 12px', 
          minHeight, 
          outline: 'none', 
          fontSize: '14px', 
          lineHeight: '1.5',
          fontFamily: 'inherit',
          background: 'transparent',
          color: 'var(--text-main)'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
