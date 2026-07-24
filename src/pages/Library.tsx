import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, Book, Search, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { getBooks, addBook, updateBookStatus, type BookData } from '../services/libraryService';

const Library: React.FC = () => {
  const [books, setBooks] = useState<BookData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const [newBook, setNewBook] = useState({
    bookId: '',
    title: '',
    author: '',
    category: 'Textbooks (CBSE)'
  });

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBook({ ...newBook, status: 'Available' });
      setIsModalOpen(false);
      setNewBook({ bookId: '', title: '', author: '', category: 'Textbooks (CBSE)' });
      fetchBooks();
    } catch (error) {
      console.error("Error adding book", error);
    }
  };

  const handleToggleStatus = async (book: BookData) => {
    try {
      if (book.status === 'Available') {
        const studentName = prompt("Enter student name to issue to:");
        if (studentName) {
          await updateBookStatus(book.id!, 'Issued', studentName);
          fetchBooks();
        }
      } else {
        await updateBookStatus(book.id!, 'Available');
        fetchBooks();
      }
    } catch (error) {
      console.error("Error updating book status", error);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.bookId.toLowerCase().includes(search.toLowerCase()) || 
                          b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All Categories', ...Array.from(new Set(books.map(b => b.category)))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><LibraryIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Library Management</h1>
          <p className="page-subtitle">Track books, issue logs, and manage library inventory seamlessly.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add New Book</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div className="search-bar" style={{ margin: 0, flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0 12px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
          <input type="text" placeholder="Search by Book Name, ID, or Author..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '12px 0' }} />
        </div>
        <select className="glass-input" style={{ width: '200px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
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
              {filteredBooks.map(book => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{book.bookId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                        <Book size={20} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{book.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{book.author}</td>
                  <td><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', fontSize: '0.85rem' }}>{book.category}</span></td>
                  <td>
                    <span className={`badge ${book.status === 'Available' ? 'success' : 'warning'}`}>
                      {book.status === 'Issued' ? `Issued (${book.issuedTo})` : 'Available'}
                    </span>
                  </td>
                  <td>
                     {book.status === 'Available' ? (
                       <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleToggleStatus(book)}>Issue</button>
                     ) : (
                       <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleToggleStatus(book)}>Return</button>
                     )}
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No books found in the library.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Book">
        <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Book ID</label>
            <input required type="text" className="glass-input" value={newBook.bookId} onChange={e => setNewBook({...newBook, bookId: e.target.value})} placeholder="e.g. B-105" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
            <input required type="text" className="glass-input" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Author</label>
            <input required type="text" className="glass-input" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
            <select className="glass-input" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
              <option>Textbooks (CBSE)</option>
              <option>Science Fiction</option>
              <option>History</option>
              <option>Fiction</option>
              <option>Reference</option>
              <option>Literature</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Book</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Library;
