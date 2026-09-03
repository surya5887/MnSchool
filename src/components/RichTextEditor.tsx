import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder, minHeight = '40px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastHtml = useRef(value);

  // Only update innerHTML if the value changed externally (not from our own typing)
  useEffect(() => {
    if (editorRef.current && value !== lastHtml.current) {
      editorRef.current.innerHTML = value;
      lastHtml.current = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtml.current = html;
      onChange(html);
    }
  };

  const execCommand = (e: React.MouseEvent | React.PointerEvent, cmd: string) => {
    e.preventDefault(); // Prevent losing focus from the contenteditable
    document.execCommand(cmd, false, undefined);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtml.current = html;
      onChange(html);
      
      // Fallback focus in case it was lost
      if (!isFocused) {
        editorRef.current.focus();
      }
    }
  };

  const btnStyle = {
    background: 'transparent',
    border: '1px solid transparent',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ 
      flex: 1, 
      border: isFocused ? '2px solid var(--primary-color)' : '1px solid rgba(0,0,0,0.1)', 
      borderRadius: '8px', 
      background: 'white', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'border 0.2s',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9fafb' }}>
        <button 
          type="button"
          onPointerDown={e => execCommand(e, 'bold')}
          style={btnStyle}
          className="rich-btn"
          title="Bold"
        ><Bold size={16} /></button>
        <button 
          type="button"
          onPointerDown={e => execCommand(e, 'italic')}
          style={btnStyle}
          className="rich-btn"
          title="Italic"
        ><Italic size={16} /></button>
        <button 
          type="button"
          onPointerDown={e => execCommand(e, 'underline')}
          style={btnStyle}
          className="rich-btn"
          title="Underline"
        ><Underline size={16} /></button>
        <style>{`
          .rich-btn:hover { background: #e5e7eb !important; border-color: #d1d5db !important; }
          .rich-btn:active { background: #d1d5db !important; transform: scale(0.95); }
          .editor-content:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; display: block; }
        `}</style>
      </div>
      
      <div 
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ 
          padding: '12px', 
          minHeight, 
          outline: 'none', 
          fontSize: '14px', 
          lineHeight: '1.6',
          fontFamily: 'inherit',
          background: 'white',
          color: 'var(--text-main)',
          cursor: 'text',
          whiteSpace: 'pre-wrap'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
