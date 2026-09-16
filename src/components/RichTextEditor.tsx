import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Image as ImageIcon, Grid, Triangle } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const insertHtml = (html: string) => {
    if (!isFocused && editorRef.current) editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          insertHtml('<img src="' + compressedBase64 + '" style="max-width: 100%; height: auto; margin: 8px 0;" alt="Inserted image" />&nbsp;');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertTable = () => {
    const rows = prompt('Number of rows? (e.g. 5)', '5');
    const cols = prompt('Number of columns? (e.g. 5)', '5');
    if (rows && cols && !isNaN(Number(rows)) && !isNaN(Number(cols))) {
      let tableHtml = '<br/><table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><tbody>';
      for (let i = 0; i < Number(rows); i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < Number(cols); j++) {
          tableHtml += '<td style="border: 1px solid #000; padding: 12px; min-width: 30px; text-align: center;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table><br/>';
      insertHtml(tableHtml);
    }
  };

  const insertShape = () => {
    const shape = prompt('Enter shape (triangle, circle, square, line):', 'triangle');
    let svg = '';
    const style = 'display: inline-block; vertical-align: middle; margin: 0 4px;';
    
    if (shape === 'triangle') {
      svg = '<svg width="40" height="40" viewBox="0 0 100 100" style="' + style + '"><polygon points="50,10 90,90 10,90" fill="none" stroke="black" stroke-width="4"/></svg>';
    } else if (shape === 'circle') {
      svg = '<svg width="40" height="40" viewBox="0 0 100 100" style="' + style + '"><circle cx="50" cy="50" r="40" fill="none" stroke="black" stroke-width="4"/></svg>';
    } else if (shape === 'square') {
      svg = '<svg width="40" height="40" viewBox="0 0 100 100" style="' + style + '"><rect x="10" y="10" width="80" height="80" fill="none" stroke="black" stroke-width="4"/></svg>';
    } else if (shape === 'line') {
      svg = '<svg width="100" height="20" viewBox="0 0 100 20" style="' + style + '"><line x1="0" y1="10" x2="100" y2="10" stroke="black" stroke-width="4"/></svg>';
    }
    
    if (svg) {
      insertHtml(svg + '&nbsp;');
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
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

        <select 
          onChange={(e) => { execCommand('fontSize', e.target.value); e.target.value = ''; }}
          className="rich-btn"
          style={{ ...btnStyle, border: '1px solid #d1d5db', padding: '2px 4px', fontSize: '12px', height: '26px' }}
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
        <button type="button" onMouseDown={e => { e.preventDefault(); fileInputRef.current?.click(); }} style={btnStyle} className="rich-btn" title="Insert Image (Local, Auto-Compressed)"><ImageIcon size={16} /></button>
        
        <button type="button" onMouseDown={e => { e.preventDefault(); insertTable(); }} style={btnStyle} className="rich-btn" title="Insert Grid/Table"><Grid size={16} /></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); insertShape(); }} style={btnStyle} className="rich-btn" title="Insert Shape (Triangle, Circle, etc)"><Triangle size={16} /></button>

        <style>{`
          .rich-btn:hover { background: #e5e7eb !important; border-color: #d1d5db !important; }
          .rich-btn:active { background: #d1d5db !important; transform: scale(0.95); }
          .editor-content:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; display: block; }
          .editor-content table td { border: 1px solid #000; }
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
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
