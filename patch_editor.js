const fs = require('fs');
const content = \import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';

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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
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

  const execCommand = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    handleInput();
    if (!isFocused && editorRef.current) {
      editorRef.current.focus();
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
      <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9fafb', flexWrap: 'wrap' }}>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('bold'); }} style={btnStyle} className="rich-btn" title="Bold"><Bold size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('italic'); }} style={btnStyle} className="rich-btn" title="Italic"><Italic size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('underline'); }} style={btnStyle} className="rich-btn" title="Underline"><Underline size={16} /></button>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('justifyLeft'); }} style={btnStyle} className="rich-btn" title="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('justifyCenter'); }} style={btnStyle} className="rich-btn" title="Align Center"><AlignCenter size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('justifyRight'); }} style={btnStyle} className="rich-btn" title="Align Right"><AlignRight size={16} /></button>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('insertUnorderedList'); }} style={btnStyle} className="rich-btn" title="Bullet List"><List size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCommand('insertOrderedList'); }} style={btnStyle} className="rich-btn" title="Numbered List"><ListOrdered size={16} /></button>

        <style>{\
          .rich-btn:hover { background: #e5e7eb !important; border-color: #d1d5db !important; }
          .rich-btn:active { background: #d1d5db !important; transform: scale(0.95); }
          .editor-content:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; display: block; }
          .editor-content ul, .editor-content ol { padding-left: 20px; margin: 4px 0; }
        \}</style>
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
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
\;
fs.writeFileSync('src/components/RichTextEditor.tsx', content);
