import React, { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Props {
  content: string;
  onChange: (content: string) => void;
}

const WordDocumentCanvas: React.FC<Props> = ({ content, onChange }) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        .ql-container {
          background: white;
          width: 800px;
          min-height: 1130px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          margin-top: 16px;
          font-family: 'Times New Roman', serif;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 1130px;
          padding: 40px;
        }
        .ql-toolbar {
          background: white;
          width: 800px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          position: sticky;
          top: 16px;
          z-index: 100;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>
      <ReactQuill 
        ref={quillRef}
        theme="snow" 
        value={content} 
        onChange={onChange} 
        modules={modules}
        formats={formats}
        placeholder="Type your exam paper here..."
      />
    </div>
  );
};

export default WordDocumentCanvas;
