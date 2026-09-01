const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// 1. Update the Group interface
code = code.replace(/isCommunity: boolean;\r?\n\s*iAmAdmin: boolean;/g, 'isCommunity: boolean;\n  isCommunityAnnounce?: boolean;\n  isParentCommunity?: boolean;\n  linkedParent?: string | null;\n  iAmAdmin: boolean;');

// 2. Change the toggleGroup function so parent communities cannot be selected
code = code.replace(/const toggleGroup = \(group: Group\) => \{/g, 'const toggleGroup = (group: Group) => {\n      if (group.isParentCommunity) return; // Cannot broadcast to parent community shell');

// 3. Replace the flat mapping of selectableGroups with the structured UI
const oldMappingStart = `<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxHeight: '700px', overflowY: 'auto', paddingRight: '12px' }}>`;
const oldMappingEnd = `          </div>
        </div>

        {/* Right Column: Compose & Templates */}`;

const newMapping = `<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxHeight: '700px', overflowY: 'auto', paddingRight: '12px' }}>
            {selectableGroups.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                <Folder size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No groups match your search.</p>
              </div>
            ) : (
              <>
                {/* 1. Communities Section */}
                {Array.from(() => {
                  const map = new Map();
                  // Pre-fill all parents
                  groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                  // Group selectable items
                  selectableGroups.filter(g => g.linkedParent).forEach(g => {
                     if (!map.has(g.linkedParent)) map.set(g.linkedParent, { subgroups: [] });
                     const c = map.get(g.linkedParent);
                     if (g.isCommunityAnnounce) c.announce = g;
                     else c.subgroups.push(g);
                  });
                  return map.entries();
                })().filter(([_, comm]) => comm.announce || comm.subgroups.length > 0).map(([pId, comm]) => {
                  const pName = comm.parent?.name || 'Unknown Community';
                  return (
                    <div key={pId} style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#334155' }}>
                         <Folder size={20} color="#6366f1" fill="#e0e7ff" />
                         <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{pName}</h3>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {[comm.announce, ...comm.subgroups].filter(Boolean).map(group => {
                            const isSelected = selectedGroups.includes(group.id);
                            let bgColor = '#ffffff';
                            let borderColor = '#e2e8f0';
                            let iconColor = '#94a3b8';
                            if (group.readOnly) {
                              bgColor = '#fef2f2'; borderColor = '#fecaca'; iconColor = '#ef4444';
                            } else if (group.iAmAdmin) {
                              bgColor = isSelected ? '#dcfce7' : '#f0fdf4';
                              borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                              iconColor = isSelected ? '#16a34a' : '#22c55e';
                            } else {
                              bgColor = isSelected ? '#eff6ff' : '#ffffff';
                              borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                              iconColor = isSelected ? '#3b82f6' : '#94a3b8';
                            }
                            return (
                              <div
                                key={group.id}
                                onClick={() => toggleGroup(group)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                                  background: bgColor, border: \`1px solid \${borderColor}\`,
                                  borderRadius: '16px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: isSelected ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)',
                                  position: 'relative', overflow: 'hidden'
                                }}
                              >
                                {isSelected && (
                                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>
                                )}
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isSelected ? (group.iAmAdmin ? '#bbf7d0' : '#dbeafe') : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                  {group.isCommunityAnnounce ? <Megaphone size={20} color={iconColor} /> : <MessageSquare size={20} color={iconColor} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {group.name}
                                    {group.isCommunityAnnounce && (
                                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '100px', fontWeight: 700, border: '1px solid #c7d2fe' }}>Announcement</span>
                                    )}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: group.readOnly ? '#b91c1c' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Users size={12} /> {group.participantsCount} participants
                                    </p>
                                    {group.readOnly ? (
                                      <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> Cannot Send</span>
                                    ) : group.iAmAdmin ? (
                                      <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12}/> Admin</span>
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
                
                {/* 2. Standalone Groups Section */}
                {(() => {
                   const standalone = selectableGroups.filter(g => !g.linkedParent && !g.isParentCommunity);
                   if (standalone.length === 0) return null;
                   return (
                     <div style={{ marginTop: '10px' }}>
                       <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: '#64748b', paddingLeft: '8px' }}>Other Groups</h3>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                         {standalone.map(group => {
                            const isSelected = selectedGroups.includes(group.id);
                            let bgColor = '#ffffff';
                            let borderColor = '#e2e8f0';
                            let iconColor = '#94a3b8';
                            if (group.readOnly) {
                              bgColor = '#fef2f2'; borderColor = '#fecaca'; iconColor = '#ef4444';
                            } else if (group.iAmAdmin) {
                              bgColor = isSelected ? '#dcfce7' : '#f0fdf4';
                              borderColor = isSelected ? '#22c55e' : '#bbf7d0';
                              iconColor = isSelected ? '#16a34a' : '#22c55e';
                            } else {
                              bgColor = isSelected ? '#eff6ff' : '#ffffff';
                              borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                              iconColor = isSelected ? '#3b82f6' : '#94a3b8';
                            }
                            return (
                              <div
                                key={group.id}
                                onClick={() => toggleGroup(group)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                                  background: bgColor, border: \`1px solid \${borderColor}\`,
                                  borderRadius: '16px', cursor: group.readOnly ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: isSelected ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)',
                                  position: 'relative', overflow: 'hidden'
                                }}
                              >
                                {isSelected && (
                                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: group.iAmAdmin ? '#22c55e' : '#3b82f6' }}></div>
                                )}
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isSelected ? (group.iAmAdmin ? '#bbf7d0' : '#dbeafe') : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                  <MessageSquare size={20} color={iconColor} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {group.name}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: group.readOnly ? '#b91c1c' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Users size={12} /> {group.participantsCount} participants
                                    </p>
                                    {group.readOnly ? (
                                      <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> Cannot Send</span>
                                    ) : group.iAmAdmin ? (
                                      <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12}/> Admin</span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            )
                         })}
                       </div>
                     </div>
                   );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Compose & Templates */}`;

const startIndex = code.indexOf(oldMappingStart);
const endIndex = code.indexOf(oldMappingEnd) + oldMappingEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newMapping + code.substring(endIndex);
  
  // Make sure Folder icon is imported
  if (!code.includes('Folder,')) {
      code = code.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { $1, Folder } from 'lucide-react';");
  }

  fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
  console.log("Frontend layout updated!");
} else {
  console.log("Could not find replacement boundaries", startIndex, endIndex);
}
