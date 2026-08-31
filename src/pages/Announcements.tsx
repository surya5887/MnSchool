import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';
import type { SchoolSettingsData } from '../services/settingsService';
import { Megaphone, Users, Search, CheckSquare, Square, Send, Loader2, MessageSquare, AlertCircle, Settings2, Languages, ShieldCheck, Folder, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
  isCommunity: boolean;
  isCommunityAnnounce?: boolean;
  isParentCommunity?: boolean;
  linkedParent?: string | null;
  iAmAdmin: boolean;
  readOnly: boolean;
}

const Announcements: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [hindiEnabled, setHindiEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Settings for templates
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [feeTemplate, setFeeTemplate] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/whatsapp-groups');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch groups');
      setGroups(data.groups || []);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchGroups();
    
    // Load Settings
    const loadSettings = async () => {
      const data = await getSchoolSettings();
      setSettings(data);
      const defaultTemplate = `Dear Parent,\nThis is a gentle reminder from MN Public School that Rs. {{due}} is currently outstanding for your ward {{name}}. Kindly clear the dues at the earliest.\nThank you.`;
      if (data && data.feeReminderTemplate) {
        setFeeTemplate(data.feeReminderTemplate);
      } else {
        setFeeTemplate(defaultTemplate);
      }
    };
    loadSettings();
  }, []);

  const saveTemplate = async () => {
    if (!settings) return;
    setIsSavingTemplate(true);
    await saveSchoolSettings({ ...settings, feeReminderTemplate: feeTemplate });
    setIsSavingTemplate(false);
    toast.success('Fee Reminder Template Saved!');
  };

  const selectableGroups = groups.filter(g => !g.readOnly && g.name?.toLowerCase().includes(search.toLowerCase()) && !g.isParentCommunity);
  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  const selectAll = () => {
    if (selectedGroups.length === selectableGroups.length && selectableGroups.length > 0) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(selectableGroups.map(g => g.id));
    }
  };

  const toggleGroup = (group: Group) => {
    if (group.isParentCommunity) return;
    if (group.readOnly) return;
    setSelectedGroups(prev => 
      prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
    );
  };

  const handleMessageChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    if (hindiEnabled && text.length > message.length) {
      setMessage(text);
      if (text.endsWith(' ') || text.endsWith('\n')) {
        const words = text.split(/(\s+)/);
        const lastWordIndex = words.length - 3; 
        const lastWord = words[lastWordIndex];
        
        if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
          try {
            const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=hi-t-i0-und&num=1`);
            const data = await res.json();
            if (data[0] === 'SUCCESS' && data[1][0][1][0]) {
              words[lastWordIndex] = data[1][0][1][0];
              const newText = words.join('');
              setMessage(newText);
              
              setTimeout(() => {
                if (textareaRef.current) {
                  const newCursorPos = cursor + (newText.length - text.length);
                  textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
              }, 0);
              return;
            }
          } catch (e) {
            console.error("Transliteration failed", e);
          }
        }
      }
    }
    setMessage(text);
  };

  const sendMessage = async () => {
    if (selectedGroups.length === 0 || !message.trim()) {
      toast.error('Please select groups and write a message');
      return;
    }

    setSending(true);
    const loadingToast = toast.loading(`Sending to ${selectedGroups.length} groups...`);

    try {
      const response = await fetch('/api/whatsapp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jids: selectedGroups,
          message: message.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      toast.success(
        <div>
          <b>Broadcast Complete!</b>
          <p style={{ margin: '4px 0 0', fontSize: '0.9em' }}>Delivered to {data.sentCount} out of {data.totalCount} groups.</p>
        </div>,
        { id: loadingToast, duration: 5000, icon: '??' }
      );
      
      setMessage('');
      setSelectedGroups([]);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '28px 32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', padding: '12px', borderRadius: '16px', color: 'white', display: 'flex', boxShadow: '0 8px 16px rgba(37, 211, 102, 0.25)' }}>
              <Megaphone size={26} strokeWidth={2.5} />
            </div>
            Broadcast Hub
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>Compose your message and select the communities you want to reach.</p>
        </div>
        
        {/* Smart Typing Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: hindiEnabled ? '#f0fdf4' : '#f8fafc', padding: '10px 20px', borderRadius: '100px', border: `1px solid ${hindiEnabled ? '#bbf7d0' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
          <div style={{ background: hindiEnabled ? '#22c55e' : '#94a3b8', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Languages size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: hindiEnabled ? '#16a34a' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Typing</div>
            <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}>Hinglish to Hindi</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', marginLeft: '12px' }}>
            <input type="checkbox" checked={hindiEnabled} onChange={(e) => setHindiEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hindiEnabled ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
              <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: hindiEnabled ? '24px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </span>
          </label>
        </div>
      </div>

      {/* Composer Section - Full Width */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <MessageSquare size={22} color="#6366f1" /> Message Editor
          </h2>
          <button 
            onClick={sendMessage} 
            disabled={sending || selectedGroups.length === 0 || !message.trim()}
            style={{ 
              padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '10px', 
              background: (sending || selectedGroups.length === 0 || !message.trim()) ? '#f1f5f9' : 'linear-gradient(135deg, #25D366, #128C7E)', 
              color: (sending || selectedGroups.length === 0 || !message.trim()) ? '#94a3b8' : 'white', 
              border: 'none', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700,
              cursor: (sending || selectedGroups.length === 0 || !message.trim()) ? 'not-allowed' : 'pointer',
              boxShadow: (sending || selectedGroups.length === 0 || !message.trim()) ? 'none' : '0 10px 25px -5px rgba(37, 211, 102, 0.4)',
              transition: 'all 0.2s',
              transform: (sending || selectedGroups.length === 0 || !message.trim()) ? 'none' : 'translateY(-2px)'
            }}
          >
            {sending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your official announcement here...&#10;(e.g. Kal school ki chhutti hai due to heavy rain. Please stay safe!)"
            style={{ 
              width: '100%', minHeight: '180px', padding: '24px', borderRadius: '16px', 
              boxSizing: 'border-box', resize: 'vertical', fontSize: '1.1rem', lineHeight: '1.7',
              border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', color: '#334155',
              transition: 'border-color 0.2s', fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#c7d2fe'}
            onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
          />
          {hindiEnabled && (
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '8px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Languages size={16} /> Translating to Hindi
            </div>
          )}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
          {selectedGroups.length} groups selected for delivery
        </div>
      </div>

      {/* Recipient Selection Section - Full Width */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Users size={22} color="#3b82f6" /> Select Recipients
          </h2>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search communities..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                  fontSize: '0.95rem', outline: 'none', width: '280px', background: '#f8fafc'
                }}
              />
            </div>
            
            <button onClick={fetchGroups} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '12px', fontSize: '0.95rem', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : 'Refresh'}
            </button>
            
            <button 
              onClick={selectAll} 
              disabled={selectableGroups.length === 0}
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: selectableGroups.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', opacity: selectableGroups.length === 0 ? 0.5 : 1 }}
            >
              {selectedGroups.length === selectableGroups.length && selectableGroups.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>} 
              Select All
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Loader2 size={40} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '20px' }} color="#cbd5e1" />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Syncing WhatsApp Contacts...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px', background: '#fef2f2', borderRadius: '16px' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{error}</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
            <Folder size={48} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No communities or groups found matching your search.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Community Folders */}
            {(() => {
              const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
              groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
              filteredGroups.filter(g => g.linkedParent).forEach(g => {
                 if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                 map.get(g.linkedParent!)!.subgroups.push(g);
              });
              return Array.from(map.entries()).filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {
                const pName = comm.parent?.name || 'Community Sub-groups';
                return (
                  <div key={pId} style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#475569' }}>
                       <Folder size={22} fill="#e2e8f0" color="#64748b" />
                       <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{pName}</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {comm.subgroups.map(group => {
                          const isSelected = selectedGroups.includes(group.id);
                          let bgColor = '#ffffff';
                          let borderColor = '#e2e8f0';
                          if (group.readOnly) {
                            bgColor = '#fef2f2'; borderColor = '#fecaca';
                          } else if (group.iAmAdmin) {
                            bgColor = isSelected ? '#dcfce7' : '#ffffff';
                            borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                          } else {
                            bgColor = isSelected ? '#eff6ff' : '#ffffff';
                            borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                          }
                          return (
                            <div key={group.id} onClick={() => toggleGroup(group)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                                background: bgColor, border: `1px solid ${borderColor}`,
                                borderRadius: '16px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                                boxShadow: isSelected ? '0 10px 25px -5px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)'
                              }}>
                              {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>}
                              
                              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: group.readOnly ? '#fee2e2' : (isSelected ? (group.iAmAdmin ? '#22c55e' : '#3b82f6') : '#f1f5f9'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${group.readOnly ? '#fca5a5' : (isSelected ? 'transparent' : '#cbd5e1')}` }}>
                                {isSelected && !group.readOnly && <CheckSquare size={16} color="white" />}
                                {group.readOnly && <Lock size={14} color="#ef4444" />}
                              </div>
                              
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {group.name}
                                  {group.isCommunityAnnounce && <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '100px', fontWeight: 700, border: '1px solid #c7d2fe' }}>Announcement</span>}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <p style={{ margin: 0, fontSize: '0.85rem', color: group.readOnly ? '#b91c1c' : '#64748b' }}>
                                    <Users size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/>{group.participantsCount}
                                  </p>
                                  {group.readOnly ? (
                                    <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}><AlertCircle size={12} style={{display:'inline', marginRight:'2px'}}/> Cannot Send</span>
                                  ) : group.iAmAdmin ? (
                                    <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}><ShieldCheck size={12} style={{display:'inline', marginRight:'2px'}}/> Admin</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )
                      })}
                    </div>
                  </div>
                )
              })
            })()}
            
            {/* Standalone Groups */}
            {(() => {
               const standalone = filteredGroups.filter(g => !g.linkedParent && !g.isParentCommunity);
               if (standalone.length === 0) return null;
               return (
                 <div style={{ background: '#ffffff', borderRadius: '20px', padding: '8px 0' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#475569', padding: '0 8px' }}>
                      <MessageSquare size={22} color="#94a3b8" />
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Other Groups</h3>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                     {standalone.map(group => {
                        const isSelected = selectedGroups.includes(group.id);
                        let bgColor = '#ffffff';
                        let borderColor = '#e2e8f0';
                        if (group.readOnly) {
                          bgColor = '#fef2f2'; borderColor = '#fecaca';
                        } else if (group.iAmAdmin) {
                          bgColor = isSelected ? '#dcfce7' : '#ffffff';
                          borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                        } else {
                          bgColor = isSelected ? '#eff6ff' : '#ffffff';
                          borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                        }
                        return (
                          <div key={group.id} onClick={() => toggleGroup(group)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                              background: bgColor, border: `1px solid ${borderColor}`,
                              borderRadius: '16px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                              boxShadow: isSelected ? '0 10px 25px -5px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                            {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>}
                            
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: group.readOnly ? '#fee2e2' : (isSelected ? (group.iAmAdmin ? '#22c55e' : '#3b82f6') : '#f1f5f9'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${group.readOnly ? '#fca5a5' : (isSelected ? 'transparent' : '#cbd5e1')}` }}>
                              {isSelected && !group.readOnly && <CheckSquare size={16} color="white" />}
                              {group.readOnly && <Lock size={14} color="#ef4444" />}
                            </div>
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {group.name}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: group.readOnly ? '#b91c1c' : '#64748b' }}>
                                  <Users size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/>{group.participantsCount}
                                </p>
                                {group.readOnly ? (
                                  <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}><AlertCircle size={12} style={{display:'inline', marginRight:'2px'}}/> Cannot Send</span>
                                ) : group.iAmAdmin ? (
                                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}><ShieldCheck size={12} style={{display:'inline', marginRight:'2px'}}/> Admin</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )
                     })}
                   </div>
                 </div>
               )
            })()}
          </div>
        )}
      </div>

      {/* Automated Fee Reminder Template */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '8px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Settings2 size={22} color="#f59e0b" /> Automated Fee Reminder Template
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          This exact message will be dynamically personalized and sent to parents. You can use placeholders like <b>{`{{name}}`}</b> for student name and <b>{`{{due}}`}</b> for the due amount.
        </p>
        
        <textarea 
          ref={templateRef}
          value={feeTemplate}
          onChange={(e) => setFeeTemplate(e.target.value)}
          placeholder="Dear Parent, this is a reminder that fees are due for the current month..."
          style={{ 
            width: '100%', minHeight: '120px', padding: '20px', borderRadius: '16px', 
            boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem',
            border: '2px solid #e2e8f0', background: '#fafafa', outline: 'none', color: '#334155'
          }}
          onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button 
            onClick={saveTemplate} 
            disabled={isSavingTemplate || feeTemplate === settings?.feeReminderTemplate}
            style={{ 
              padding: '12px 28px', background: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#f1f5f9' : '#0f172a',
              color: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#94a3b8' : 'white', 
              border: 'none', borderRadius: '14px', fontWeight: 600, fontSize: '1rem',
              cursor: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? 'default' : 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {isSavingTemplate ? <Loader2 size={18} className="spin" /> : null}
            {isSavingTemplate ? 'Saving...' : 'Save Default Template'}
          </button>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};


class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Announcements Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 40, color: 'red'}}>
        <h2>Something went wrong in Announcements.</h2>
        <pre>{String(this.state.error)}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children; 
  }
}

const AnnouncementsWrapped = () => (
  <ErrorBoundary>
    <Announcements />
  </ErrorBoundary>
);
export default AnnouncementsWrapped;

