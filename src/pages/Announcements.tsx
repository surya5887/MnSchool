import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Users, Search, CheckSquare, Square, Send, Loader2, MessageSquare, AlertCircle, Settings2, Languages } from 'lucide-react';
import { useTransliterate } from '../hooks/useTransliterate';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';

interface Group {
  id: string;
  name: string;
  desc?: string;
  participantsCount: number;
  isCommunity: boolean;
  isCommunityAnnounce: boolean;
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
      if (data.feeReminderTemplate) setFeeTemplate(data.feeReminderTemplate);
    }
  };

  const saveTemplate = async () => {
    if (!settings) return;
    setIsSavingTemplate(true);
    await saveSchoolSettings({ ...settings, feeReminderTemplate: feeTemplate });
    setIsSavingTemplate(false);
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/whatsapp-groups');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch groups');
      setGroups(data.groups || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleMessageChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    
    if (hindiEnabled && text.length > message.length) {
      // User is typing
      setMessage(text);
      if (text.endsWith(' ') || text.endsWith('\n')) {
         const { text: newText } = await processText(text, cursor);
         if (newText !== text) {
           setMessage(newText);
           // Restore cursor
           setTimeout(() => {
             if (textareaRef.current) {
               textareaRef.current.setSelectionRange(newCursor, newCursor);
             }
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

  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>
            <Megaphone size={24} color="white" />
          </div>
          Announcements
        </h1>
        <p className="page-subtitle" style={{ marginTop: '8px' }}>Send broadcast messages to WhatsApp groups and manage notification templates.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Groups */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" /> WhatsApp Groups
            </h2>
            <button onClick={fetchGroups} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} disabled={loading}>
              Refresh
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input"
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filteredGroups.length} Groups Found</span>
            <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {selectedGroups.length === filteredGroups.length && filteredGroups.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>} 
              Select All
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '16px' }} />
                Fetching WhatsApp groups...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '32px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                No groups found. Make sure WhatsApp is linked in settings.
              </div>
            ) : (
              filteredGroups.map(group => (
                <div 
                  key={group.id} 
                  onClick={() => toggleGroup(group.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', 
                    background: selectedGroups.includes(group.id) ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.5)', 
                    borderRadius: '16px', cursor: 'pointer', border: `1px solid ${selectedGroups.includes(group.id) ? 'var(--primary)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ color: selectedGroups.includes(group.id) ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {selectedGroups.includes(group.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {group.name} 
                      {group.isCommunity && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '100px' }}>Community</span>}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{group.participantsCount} participants</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Compose & Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} color="var(--primary)" /> Compose Broadcast
              </h2>
              <button 
                onClick={() => setHindiEnabled(!hindiEnabled)}
                className={hindiEnabled ? "btn-primary" : "btn-secondary"} 
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center', borderRadius: '10px' }}
              >
                <Languages size={16} /> Hinglish to Hindi {hindiEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <textarea 
              ref={textareaRef}
              className="glass-input"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message here... (e.g. Tomorrow is a holiday due to rain)"
              style={{ width: '100%', minHeight: '180px', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem', lineHeight: '1.5' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedGroups.length} groups selected
              </span>
              <button 
                className="btn-primary" 
                onClick={sendMessage} 
                disabled={sending || selectedGroups.length === 0 || !message.trim()}
                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {sending ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Send size={18} />}
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>

            {sendResult && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', background: sendResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: sendResult.success ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sendResult.success ? <CheckSquare size={16} /> : <AlertCircle size={16} />}
                {sendResult.success 
                  ? `Successfully sent to ${sendResult.sent} out of ${sendResult.total} groups.` 
                  : sendResult.error}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={20} color="var(--primary)" /> Fee Reminder Template
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              This message will be sent automatically to parents whose fees are due. 
              <br/>(Use Hinglish to Hindi translation by enabling it above)
            </p>
            
            <textarea 
              className="glass-input"
              value={feeTemplate}
              onChange={handleTemplateChange}
              placeholder="Dear Parent, your ward's fee is due. Please pay soon to avoid late fees."
              style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', resize: 'vertical', fontSize: '0.95rem' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                className="btn-secondary" 
                onClick={saveTemplate} 
                disabled={isSavingTemplate}
                style={{ padding: '10px 20px' }}
              >
                {isSavingTemplate ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Announcements;
