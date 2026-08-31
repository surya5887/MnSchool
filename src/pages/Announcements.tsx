import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Users, Search, CheckSquare, Square, Send, Loader2, MessageSquare, AlertCircle, Settings2, Languages, Lock, ShieldCheck, Folder } from 'lucide-react';
import { useTransliterate } from '../hooks/useTransliterate';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
  isCommunity: boolean;
  iAmAdmin: boolean;
  readOnly: boolean;
}

const Announcements: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success?: boolean, sent?: number, total?: number, error?: string} | null>(null);
  
  // Transliteration feature
  const [hindiEnabled, setHindiEnabled] = useState(false);
  const { processText } = useTransliterate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  
  // Settings for templates
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [feeTemplate, setFeeTemplate] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await getSchoolSettings();
    if (data) {
      setSettings(data);
      const defaultTemplate = `Dear Parent,\nThis is a gentle reminder from MN Public School that Rs. {{due}} is currently outstanding for your ward {{name}}. Kindly clear the dues at the earliest.\nThank you.`;
      if (data.feeReminderTemplate) {
        setFeeTemplate(data.feeReminderTemplate);
      } else {
        setFeeTemplate(defaultTemplate);
      }
    }
  };

  const saveTemplate = async () => {
    if (!settings) return;
    setIsSavingTemplate(true);
    await saveSchoolSettings({ ...settings, feeReminderTemplate: feeTemplate });
    setIsSavingTemplate(false);
    
    // Show quick success state
    const original = feeTemplate;
    setFeeTemplate('? Saved successfully!');
    setTimeout(() => setFeeTemplate(original), 1500);
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/whatsapp-groups');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch groups');
      setGroups(data.groups || []);
      // Clear selections on refresh
      setSelectedGroups([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (group: Group) => {
    if (group.readOnly) return; // Cannot select read-only groups
    setSelectedGroups(prev => 
      prev.includes(group.id) ? prev.filter(g => g !== group.id) : [...prev, group.id]
    );
  };

  const selectableGroups = groups.filter(g => !g.readOnly && g.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  const selectAll = () => {
    if (selectedGroups.length === selectableGroups.length && selectableGroups.length > 0) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(selectableGroups.map(g => g.id));
    }
  };

  const handleMessageChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    if (hindiEnabled && text.length > message.length) {
      setMessage(text);
      if (text.endsWith(' ') || text.endsWith('\n')) {
         const { text: newText, cursorPosition: newCursor } = await processText(text, cursor);
         if (newText !== text) {
           setMessage(newText);
           setTimeout(() => {
             if (textareaRef.current) textareaRef.current.setSelectionRange(newCursor, newCursor);
           }, 10);
         }
      }
    } else {
      setMessage(text);
    }
  };

  const handleTemplateChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    if (hindiEnabled && text.length > feeTemplate.length) {
      setFeeTemplate(text);
      if (text.endsWith(' ') || text.endsWith('\n')) {
         const { text: newText, cursorPosition: newCursor } = await processText(text, cursor);
         if (newText !== text) {
           setFeeTemplate(newText);
           setTimeout(() => {
             if (templateRef.current) templateRef.current.setSelectionRange(newCursor, newCursor);
           }, 10);
         }
      }
    } else {
      setFeeTemplate(text);
    }
  };

  const sendMessage = async () => {
    if (selectedGroups.length === 0 || !message.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/whatsapp-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupJids: selectedGroups, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSendResult({ success: true, sent: data.sent, total: data.total });
      setMessage('');
      setSelectedGroups([]);
    } catch (err: any) {
      setSendResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '24px 32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.75rem' }}>
            <div style={{ background: '#25D366', padding: '10px', borderRadius: '14px', color: 'white', display: 'flex', boxShadow: '0 8px 16px rgba(37, 211, 102, 0.25)' }}>
              <Megaphone size={28} />
            </div>
            Broadcast Hub
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Manage your WhatsApp communications and templates across all groups.</p>
        </div>
        
        {/* Magic Transliteration Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: hindiEnabled ? '#f0fdf4' : '#f1f5f9', padding: '8px 16px', borderRadius: '100px', border: `1px solid ${hindiEnabled ? '#bbf7d0' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
          <div style={{ background: hindiEnabled ? '#22c55e' : '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Languages size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hindiEnabled ? '#16a34a' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Typing</div>
            <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>Hinglish to Hindi</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', marginLeft: '12px' }}>
            <input type="checkbox" checked={hindiEnabled} onChange={(e) => setHindiEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hindiEnabled ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
              <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: hindiEnabled ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1.2fr) 1.5fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Groups Directory */}
        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', overflow: 'hidden' }}>
          
          {/* Panel Header */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#3b82f6" /> Directory
              </h2>
              <button onClick={fetchGroups} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : 'Refresh'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search groups & communities..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                {filteredGroups.length} total, {selectableGroups.length} selectable
              </span>
              <button 
                onClick={selectAll} 
                disabled={selectableGroups.length === 0}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem', cursor: selectableGroups.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', opacity: selectableGroups.length === 0 ? 0.5 : 1 }}
              >
                {selectedGroups.length === selectableGroups.length && selectableGroups.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>} 
                Select All Allowed
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <Loader2 size={32} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '16px' }} color="#cbd5e1" />
                <p>Loading WhatsApp Groups...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '24px', background: '#fef2f2', borderRadius: '16px' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                No groups found matching your search.
              </div>
            ) : (
              <>
              {/* Community Groups */}
              {Array.from(() => {
                const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
                groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                filteredGroups.filter(g => g.linkedParent).forEach(g => {
                   if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                   map.get(g.linkedParent!)!.subgroups.push(g);
                });
                return map.entries();
              })().filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {
                const pName = comm.parent?.name || 'Community Sub-groups';
                return (
                  <div key={pId} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#475569' }}>
                       <Folder size={18} fill="#e2e8f0" color="#64748b" />
                       <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{pName}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {comm.subgroups.map(group => {
                          const isSelected = selectedGroups.includes(group.id);
                          let bgColor = '#ffffff';
                          let borderColor = '#e2e8f0';
                          let iconColor = '#94a3b8';
                          if (group.readOnly) {
                            bgColor = '#fef2f2'; borderColor = '#fecaca';
                          } else if (group.iAmAdmin) {
                            bgColor = isSelected ? '#dcfce7' : '#f0fdf4';
                            borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                            iconColor = isSelected ? '#16a34a' : '#22c55e';
                          } else {
                            bgColor = isSelected ? '#eff6ff' : '#ffffff';
                            borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                            iconColor = isSelected ? '#2563eb' : '#94a3b8';
                          }
                          return (
                            <div key={group.id} onClick={() => toggleGroup(group)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
                                background: bgColor, border: `1px solid ${borderColor}`,
                                borderRadius: '12px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                              }}>
                              {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {group.name}
                                  {group.isCommunityAnnounce && <span style={{ fontSize: '0.6rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '100px', fontWeight: 700 }}>Announcement</span>}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: group.readOnly ? '#b91c1c' : '#64748b' }}>
                                    <Users size={12} style={{display:'inline', verticalAlign:'text-bottom'}}/> {group.participantsCount}
                                  </p>
                                  {group.readOnly ? (
                                    <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600 }}><AlertCircle size={10} style={{display:'inline'}}/> Cannot Send</span>
                                  ) : group.iAmAdmin ? (
                                    <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}><ShieldCheck size={10} style={{display:'inline'}}/> Admin</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {/* Standalone Groups */}
              {(() => {
                 const standalone = filteredGroups.filter(g => !g.linkedParent && !g.isParentCommunity);
                 if (standalone.length === 0) return null;
                 return (
                   <>
                   <h3 style={{ margin: '12px 0 8px 8px', fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Other Groups</h3>
                   {standalone.map(group => {
                      const isSelected = selectedGroups.includes(group.id);
                      let bgColor = '#ffffff';
                      let borderColor = '#e2e8f0';
                      let iconColor = '#94a3b8';
                      if (group.readOnly) {
                        bgColor = '#fef2f2'; borderColor = '#fecaca';
                      } else if (group.iAmAdmin) {
                        bgColor = isSelected ? '#dcfce7' : '#f0fdf4';
                        borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                        iconColor = isSelected ? '#16a34a' : '#22c55e';
                      } else {
                        bgColor = isSelected ? '#eff6ff' : '#ffffff';
                        borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                        iconColor = isSelected ? '#2563eb' : '#94a3b8';
                      }
                      return (
                        <div key={group.id} onClick={() => toggleGroup(group)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
                            background: bgColor, border: `1px solid ${borderColor}`,
                            borderRadius: '12px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                          }}>
                          {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {group.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: group.readOnly ? '#b91c1c' : '#64748b' }}>
                                <Users size={12} style={{display:'inline', verticalAlign:'text-bottom'}}/> {group.participantsCount}
                              </p>
                              {group.readOnly ? (
                                <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600 }}><AlertCircle size={10} style={{display:'inline'}}/> Cannot Send</span>
                              ) : group.iAmAdmin ? (
                                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}><ShieldCheck size={10} style={{display:'inline'}}/> Admin</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                   })}
                   </>
                 )
              })()}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Compose & Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Broadcast Composer */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={22} color="#8b5cf6" /> Live Broadcast
            </h2>
            
            <div style={{ position: 'relative' }}>
              <textarea 
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                placeholder="Type your announcement here...&#10;(e.g. Kal school ki chhutti hai due to heavy rain. Please stay safe!)"
                style={{ 
                  width: '100%', minHeight: '220px', padding: '20px', borderRadius: '16px', 
                  boxSizing: 'border-box', resize: 'vertical', fontSize: '1.05rem', lineHeight: '1.6',
                  border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', color: '#334155',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
              {hindiEnabled && (
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Languages size={14} /> Translating
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedGroups.length > 0 ? '#10b981' : '#94a3b8' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                  Sending to {selectedGroups.length} selected group{selectedGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button 
                onClick={sendMessage} 
                disabled={sending || selectedGroups.length === 0 || !message.trim()}
                style={{ 
                  padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px', 
                  background: (sending || selectedGroups.length === 0 || !message.trim()) ? '#cbd5e1' : '#25D366', 
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                  cursor: (sending || selectedGroups.length === 0 || !message.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: (sending || selectedGroups.length === 0 || !message.trim()) ? 'none' : '0 4px 14px rgba(37, 211, 102, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                {sending ? 'Broadcasting...' : 'Send Now'}
              </button>
            </div>

            {sendResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: sendResult.success ? '#f0fdf4' : '#fef2f2', border: `1px solid ${sendResult.success ? '#bbf7d0' : '#fecaca'}`, color: sendResult.success ? '#15803d' : '#b91c1c', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                {sendResult.success ? <CheckSquare size={20} /> : <AlertCircle size={20} />}
                {sendResult.success 
                  ? `Success! Message delivered to ${sendResult.sent} out of ${sendResult.total} groups.` 
                  : `Error: ${sendResult.error}`}
              </motion.div>
            )}
          </div>

          {/* Fee Reminder Template Settings */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={22} color="#f59e0b" /> Automated Fee Reminder Template
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              This exact message will be dynamically personalized and sent to parents. You can use placeholders like <b>{`{{name}}`}</b> for student name and <b>{`{{due}}`}</b> for the due amount.
            </p>
            
            <textarea 
              ref={templateRef}
              value={feeTemplate}
              onChange={handleTemplateChange}
              placeholder="Dear Parent, this is a reminder that fees are due for the current month..."
              style={{ 
                width: '100%', minHeight: '120px', padding: '20px', borderRadius: '16px', 
                boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem',
                border: '1px solid #e2e8f0', background: '#fafafa', outline: 'none', color: '#334155'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={saveTemplate} 
                disabled={isSavingTemplate || feeTemplate === settings?.feeReminderTemplate}
                style={{ 
                  padding: '10px 24px', background: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#f1f5f9' : '#0f172a',
                  color: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#94a3b8' : 'white', 
                  border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem',
                  cursor: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isSavingTemplate ? 'Saving...' : 'Save Default Template'}
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default Announcements;
