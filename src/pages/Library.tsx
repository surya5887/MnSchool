import React from 'react';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, Book, ArrowLeftRight, Search, Plus } from 'lucide-react';

const Library: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><LibraryIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Library Management</h1>
          <p className="page-subtitle">Track books, issue logs, and manage library inventory seamlessly.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <button className="btn-secondary"><ArrowLeftRight size={18} /> Issue / Return Book</button>
           <button className="btn-primary"><Plus size={18} /> Add New Book</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div className="search-bar" style={{ margin: 0, flex: 1 }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by Book Name, ISBN, or Author..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
        </div>
        <select className="glass-input" style={{ width: '200px' }}>
          <option>All Categories</option>
          <option>Science Fiction</option>
          <option>Textbooks (CBSE)</option>
          <option>History</option>
        </select>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Book Details</th>
                <th>Author / Publisher</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'B-101', name: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', cat: 'Textbooks', status: 'Available' },
                { id: 'B-102', name: 'The Alchemist', author: 'Paulo Coelho', cat: 'Fiction', status: 'Issued (Rahul V.)' },
                { id: 'B-103', name: 'Indian History', author: 'R.S. Sharma', cat: 'History', status: 'Available' },
                { id: 'B-104', name: 'Mathematics X', author: 'R.D. Sharma', cat: 'Textbooks', status: 'Issued (Diya P.)' },
              ].map(book => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{book.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                        <Book size={20} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{book.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{book.author}</td>
                  <td><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', fontSize: '0.85rem' }}>{book.cat}</span></td>
                  <td>
                    <span className={`badge ${book.status === 'Available' ? 'success' : 'warning'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td>
                     {book.status === 'Available' ? (
                       <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Issue</button>
                     ) : (
                       <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Return</button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Library;
