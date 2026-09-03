import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, Plus, Search, Book, UserCheck, Clock, Users, ArrowRightLeft, Calendar, FileText, CheckCircle, AlertTriangle, Download, X, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getBooks, addBook, updateBook, deleteBook,
  getExternalMembers, addExternalMember,
  getCirculationLogs, issueBook, returnBook,
  getReadingRoomLogs, checkInReadingRoom, checkOutReadingRoom
} from '../services/libraryService';
import type { BookData, ExternalMemberData, CirculationLogData, ReadingRoomLogData } from '../services/libraryService';
import { getStudents } from '../services/studentService';
import type { StudentData } from '../services/studentService';
import { getStaff } from '../services/staffService';
import type { StaffData } from '../services/staffService';

type TabType = 'dashboard' | 'catalog' | 'circulation' | 'readingroom' | 'members';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [books, setBooks] = useState<BookData[]>([]);
  const [members, setMembers] = useState<ExternalMemberData[]>([]);
  const [circulations, setCirculations] = useState<CirculationLogData[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingRoomLogData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  
  // Form State
  const [newBook, setNewBook] = useState<Partial<BookData>>({ totalCopies: 1, availableCopies: 1, category: 'Textbooks (CBSE)' });
  const [newMember, setNewMember] = useState<Partial<ExternalMemberData>>({});
  const [memberFee, setMemberFee] = useState<number>(500);
  const [issueData, setIssueData] = useState<Partial<CirculationLogData>>({ memberType: 'Internal' });
  const [returnData, setReturnData] = useState<{ circId: string, bookId: string, fine: number } | null>(null);
  const [readingData, setReadingData] = useState<Partial<ReadingRoomLogData>>({ memberType: 'Internal' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [b, m, c, r, s, st] = await Promise.all([
        getBooks(), getExternalMembers(), getCirculationLogs(), getReadingRoomLogs(), getStudents(), getStaff()
      ]);
      setBooks(b); setMembers(m); setCirculations(c); setReadingLogs(r); setStudents(s); setStaffList(st);
    } catch (e) {
      console.error("Error fetching library data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBook({ ...newBook, availableCopies: newBook.totalCopies } as any);
      setIsBookModalOpen(false);
      setNewBook({ totalCopies: 1, availableCopies: 1, category: 'Textbooks (CBSE)' });
      fetchData();
    } catch (error) {
      alert("Failed to add book");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExternalMember({ ...newMember, isActive: true, joinDate: new Date().toISOString() } as any, memberFee);
      setIsMemberModalOpen(false);
      setNewMember({});
      fetchData();
    } catch (error) {
      alert("Failed to add member");
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const book = books.find(b => b.id === issueData.bookId);
      if(!book) return;
      let mName = '';
      if(issueData.memberType === 'Internal') mName = students.find(s => s.id === issueData.memberId)?.name || '';
      else if(issueData.memberType === 'Staff') mName = staffList.find(s => s.id === issueData.memberId)?.name || '';
      else if(issueData.memberType === 'External') mName = members.find(s => s.id === issueData.memberId)?.name || '';
      
      const issueDate = new Date().toISOString();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days default
      
      await issueBook({
        bookId: book.id!,
        bookAccessionNo: book.bookId,
        bookTitle: book.title,
        memberType: issueData.memberType as any,
        memberId: issueData.memberId!,
        memberName: mName,
        issueDate,
        dueDate: dueDate.toISOString(),
        status: 'Issued'
      });
      setIsIssueModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Failed to issue book");
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!returnData) return;
    try {
      await returnBook(returnData.circId, returnData.bookId, returnData.fine);
      setIsReturnModalOpen(false);
      fetchData();
    } catch(e) {
      alert("Failed to return book");
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let mName = '';
      if(readingData.memberType === 'Internal') mName = students.find(s => s.id === readingData.memberId)?.name || '';
      else if(readingData.memberType === 'Staff') mName = staffList.find(s => s.id === readingData.memberId)?.name || '';
      else if(readingData.memberType === 'External') mName = members.find(s => s.id === readingData.memberId)?.name || '';
      
      await checkInReadingRoom({
        date: new Date().toISOString().split('T')[0],
        memberType: readingData.memberType as any,
        memberId: readingData.memberId!,
        memberName: mName,
        seatNumber: readingData.seatNumber || 'Any',
        inTime: new Date().toISOString()
      });
      setIsReadingModalOpen(false);
      fetchData();
    } catch(e) {
      alert("Check in failed");
    }
  };

  const calculateFine = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    if(now > due) {
      const diffTime = Math.abs(now.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 5; // 5 Rs per day fine
    }
    return 0;
  };

  const activeReaders = readingLogs.filter(r => !r.outTime && r.date === new Date().toISOString().split('T')[0]);
  const activeIssues = circulations.filter(c => c.status === 'Issued');
  
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Library...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title"><LibraryIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Library System</h1>
          <p className="page-subtitle">Inventory, Circulation, Reading Room & Ledger Automation</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button className={`btn-${activeTab === 'dashboard' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('dashboard')}><Clock size={16} /> Dashboard</button>
        <button className={`btn-${activeTab === 'catalog' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('catalog')}><Book size={16} /> Catalog</button>
        <button className={`btn-${activeTab === 'circulation' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('circulation')}><ArrowRightLeft size={16} /> Circulation</button>
        <button className={`btn-${activeTab === 'readingroom' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('readingroom')}><UserCheck size={16} /> Reading Room</button>
        <button className={`btn-${activeTab === 'members' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('members')}><Users size={16} /> Ext. Members</button>
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary-color)' }}><Book size={24} /></div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{books.reduce((acc, b) => acc + (Number(b.totalCopies) || 1), 0)}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Total Books in Inventory</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#f59e0b' }}><ArrowRightLeft size={24} /></div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{activeIssues.length}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Books Currently Issued</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#22c55e' }}><UserCheck size={24} /></div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{activeReaders.length}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Active Readers in Room</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}><AlertTriangle size={24} /></div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{activeIssues.filter(c => new Date() > new Date(c.dueDate)).length}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Overdue Returns</p>
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="search-bar" style={{ margin: 0, width: '300px' }}>
              <Search size={18} />
              <input type="text" placeholder="Search books..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={() => setIsBookModalOpen(true)}><Plus size={18} /> Add Book</button>
          </div>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Acc. No</th>
                  <th>Title & Author</th>
                  <th>Category</th>
                  <th>Rack</th>
                  <th>Copies (Avail/Total)</th>
                </tr>
              </thead>
              <tbody>
                {books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.bookId.toLowerCase().includes(searchQuery.toLowerCase())).map(book => (
                  <tr key={book.id}>
                    <td>{book.bookId}</td>
                    <td><div style={{ fontWeight: 600 }}>{book.title}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.author} {book.publisher && `• ${book.publisher}`}</div></td>
                    <td>{book.category}</td>
                    <td>{book.rackNumber || '-'}</td>
                    <td>
                      <span style={{ color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{book.availableCopies ?? 1}</span> / {book.totalCopies ?? 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'circulation' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button className="btn-primary" onClick={() => setIsIssueModalOpen(true)}><ArrowRightLeft size={18} /> Issue Book</button>
          </div>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Issued To</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status & Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {circulations.map(circ => (
                  <tr key={circ.id}>
                    <td><div style={{ fontWeight: 600 }}>{circ.bookTitle}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{circ.bookAccessionNo}</div></td>
                    <td><div style={{ fontWeight: 600 }}>{circ.memberName}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{circ.memberType}</div></td>
                    <td>{new Date(circ.issueDate).toLocaleDateString()}</td>
                    <td style={{ color: new Date() > new Date(circ.dueDate) && circ.status === 'Issued' ? 'var(--danger)' : 'inherit' }}>{new Date(circ.dueDate).toLocaleDateString()}</td>
                    <td>
                      {circ.status === 'Issued' ? (
                         new Date() > new Date(circ.dueDate) ? <span className="badge warning">Overdue (₹{calculateFine(circ.dueDate)})</span> : <span className="badge success">Issued</span>
                      ) : (
                         <span className="badge" style={{ background: 'var(--glass-border)' }}>Returned (Fine: ₹{circ.fineAmount || 0})</span>
                      )}
                    </td>
                    <td>
                      {circ.status === 'Issued' && (
                        <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={() => {
                          setReturnData({ circId: circ.id!, bookId: circ.bookId, fine: calculateFine(circ.dueDate) });
                          setIsReturnModalOpen(true);
                        }}>Return</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'readingroom' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Today's Active Readers</h3>
            <button className="btn-primary" onClick={() => setIsReadingModalOpen(true)}><UserCheck size={18} /> Check-In Reader</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {activeReaders.map(reader => (
              <div key={reader.id} style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{reader.memberName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{reader.memberType}</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Seat: <strong>{reader.seatNumber}</strong></div>
                <div style={{ fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> In: {new Date(reader.inTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <button className="btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '0.85rem' }} onClick={async () => {
                  await checkOutReadingRoom(reader.id!);
                  fetchData();
                }}>Check-Out</button>
              </div>
            ))}
            {activeReaders.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No active readers in the room currently.</div>}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button className="btn-primary" onClick={() => setIsMemberModalOpen(true)}><Plus size={18} /> Register Ext. Member</button>
          </div>
          <div className="glass-table-container">
            <table>
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name & Phone</th>
                  <th>Join Date</th>
                  <th>Valid Till</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.memberId}</td>
                    <td><div style={{ fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.phone}</div></td>
                    <td>{new Date(m.joinDate).toLocaleDateString()}</td>
                    <td>{new Date(m.validTill).toLocaleDateString()}</td>
                    <td><span className={`badge ${m.isActive ? 'success' : 'danger'}`}>{m.isActive ? 'Active' : 'Expired'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Add New Book">
        <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label>Accession No / Book ID</label><input required className="glass-input" value={newBook.bookId || ''} onChange={e => setNewBook({...newBook, bookId: e.target.value})} /></div>
            <div><label>ISBN (Optional)</label><input className="glass-input" value={newBook.isbn || ''} onChange={e => setNewBook({...newBook, isbn: e.target.value})} /></div>
          </div>
          <div><label>Title</label><input required className="glass-input" value={newBook.title || ''} onChange={e => setNewBook({...newBook, title: e.target.value})} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label>Author</label><input required className="glass-input" value={newBook.author || ''} onChange={e => setNewBook({...newBook, author: e.target.value})} /></div>
            <div><label>Publisher</label><input className="glass-input" value={newBook.publisher || ''} onChange={e => setNewBook({...newBook, publisher: e.target.value})} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Category</label>
              <select className="glass-input" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                <option>Textbooks (CBSE)</option><option>Science Fiction</option><option>History</option><option>Fiction</option><option>Reference</option><option>Literature</option><option>Magazines/Journals</option>
              </select>
            </div>
            <div><label>Rack / Shelf No</label><input className="glass-input" value={newBook.rackNumber || ''} onChange={e => setNewBook({...newBook, rackNumber: e.target.value})} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label>Total Copies</label><input type="number" required className="glass-input" min="1" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: Number(e.target.value)})} /></div>
            <div><label>Price (₹)</label><input type="number" className="glass-input" value={newBook.price || ''} onChange={e => setNewBook({...newBook, price: Number(e.target.value)})} /></div>
          </div>
          <button type="submit" className="btn-primary">Add Book</button>
        </form>
      </Modal>

      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Register External Member">
        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <DollarSign size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>Membership fee will automatically be posted to the Master Ledger as Income.</div>
          </div>
          <div><label>Member ID</label><input required className="glass-input" value={newMember.memberId || ''} onChange={e => setNewMember({...newMember, memberId: e.target.value})} /></div>
          <div><label>Full Name</label><input required className="glass-input" value={newMember.name || ''} onChange={e => setNewMember({...newMember, name: e.target.value})} /></div>
          <div><label>Phone Number</label><input required className="glass-input" value={newMember.phone || ''} onChange={e => setNewMember({...newMember, phone: e.target.value})} /></div>
          <div><label>Address</label><textarea className="glass-input" value={newMember.address || ''} onChange={e => setNewMember({...newMember, address: e.target.value})} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label>Valid Till</label><input type="date" required className="glass-input" value={newMember.validTill || ''} onChange={e => setNewMember({...newMember, validTill: e.target.value})} /></div>
            <div><label>Registration Fee (₹)</label><input type="number" required className="glass-input" value={memberFee} onChange={e => setMemberFee(Number(e.target.value))} /></div>
          </div>
          <button type="submit" className="btn-primary">Register Member</button>
        </form>
      </Modal>

      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Book">
        <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Select Book</label>
            <select required className="glass-input" value={issueData.bookId || ''} onChange={e => setIssueData({...issueData, bookId: e.target.value})}>
              <option value="">-- Select Available Book --</option>
              {books.filter(b => b.availableCopies > 0).map(b => (
                <option key={b.id} value={b.id}>{b.bookId} - {b.title} (Avail: {b.availableCopies})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Member Type</label>
            <select className="glass-input" value={issueData.memberType} onChange={e => setIssueData({...issueData, memberType: e.target.value as any, memberId: ''})}>
              <option value="Internal">School Student</option>
              <option value="Staff">School Staff</option>
              <option value="External">External Member</option>
            </select>
          </div>
          <div>
            <label>Select Member</label>
            <select required className="glass-input" value={issueData.memberId || ''} onChange={e => setIssueData({...issueData, memberId: e.target.value})}>
              <option value="">-- Select --</option>
              {issueData.memberType === 'Internal' && students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classId} {s.sectionId})</option>)}
              {issueData.memberType === 'Staff' && staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
              {issueData.memberType === 'External' && members.filter(m => m.isActive).map(s => <option key={s.id} value={s.id}>{s.name} ({s.memberId})</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Issue Book</button>
        </form>
      </Modal>

      <Modal isOpen={isReturnModalOpen} onClose={() => { setIsReturnModalOpen(false); setReturnData(null); }} title="Return Book">
        {returnData && (
          <form onSubmit={handleReturnBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Late Fine: ₹{returnData.fine}</h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>If fine is applicable, it will automatically be added to the Ledger as Income.</p>
            </div>
            <div>
              <label>Adjust Fine Amount (if waived)</label>
              <input type="number" className="glass-input" value={returnData.fine} onChange={e => setReturnData({...returnData, fine: Number(e.target.value)})} />
            </div>
            <button type="submit" className="btn-primary">Confirm Return</button>
          </form>
        )}
      </Modal>

      <Modal isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} title="Reading Room Check-In">
        <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Member Type</label>
              <select className="glass-input" value={readingData.memberType} onChange={e => setReadingData({...readingData, memberType: e.target.value as any, memberId: ''})}>
                <option value="Internal">School Student</option>
                <option value="Staff">School Staff</option>
                <option value="External">External Member</option>
              </select>
            </div>
            <div>
              <label>Seat Number</label>
              <input required className="glass-input" value={readingData.seatNumber || ''} onChange={e => setReadingData({...readingData, seatNumber: e.target.value})} placeholder="e.g. S-12 or Table 4" />
            </div>
          </div>
          <div>
            <label>Select Member</label>
            <select required className="glass-input" value={readingData.memberId || ''} onChange={e => setReadingData({...readingData, memberId: e.target.value})}>
              <option value="">-- Select --</option>
              {readingData.memberType === 'Internal' && students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classId} {s.sectionId})</option>)}
              {readingData.memberType === 'Staff' && staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
              {readingData.memberType === 'External' && members.filter(m => m.isActive).map(s => <option key={s.id} value={s.id}>{s.name} ({s.memberId})</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Check-In</button>
        </form>
      </Modal>

    </motion.div>
  );
};

export default Library;
