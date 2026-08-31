import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export const maxDuration = 60;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const sessionId = 'school_erp';

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    if (!state.creds || !state.creds.me) {
      return res.status(401).json({ error: 'WhatsApp not connected. Please link your account first.' });
    }

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      browser: ['MN Public School ERP', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    await new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          sock.end(undefined);
          reject(new Error('Connection timeout while fetching groups'));
        }
      }, 15000);

      sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        } else if (update.connection === 'close') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error('Connection closed prematurely'));
          }
        }
      });
    });

    let myId = null;
    let myLid = null;

    if (state.creds?.me?.id) {
       myId = state.creds.me.id.split(':')[0].split('@')[0];
    } else if (sock.user?.id && sock.user.id.includes('@s.whatsapp.net')) {
       myId = sock.user.id.split(':')[0].split('@')[0];
    }
    
    if (state.creds?.me?.lid) {
       myLid = state.creds.me.lid.split(':')[0].split('@')[0];
    } else if (sock.user?.id && sock.user.id.includes('@lid')) {
       myLid = sock.user.id.split(':')[0].split('@')[0];
    }

    const groupsRaw = await sock.groupFetchAllParticipating();
    const groupsMap = groupsRaw as any;

    let groups = [];
    const groupValues = Object.values(groupsMap);

    for (const g of groupValues as any[]) {
      let iAmAdmin = false;
      let meFoundInParticipants = false;
      
      const checkAdminAndFound = (participants: any[]) => {
          if (!participants) return false;
          if (!myId && !myLid) return false;
          
          const me = participants.find((p: any) => {
             const pid = p.id ? p.id.split('@')[0].split(':')[0] : null;
             const plid = p.lid ? p.lid.split('@')[0].split(':')[0] : null;
             return (myId && pid === myId) || (myLid && plid === myLid) || (myId && plid === myId) || (myLid && pid === myLid);
          });
          if (me) {
            meFoundInParticipants = true;
            return (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1);
          }
          return false;
      };

      const checkOwner = (ownerId: string | undefined) => {
          if (!ownerId) return false;
          const oid = ownerId.split('@')[0].split(':')[0];
          return (myId && oid === myId) || (myLid && oid === myLid);
      };

      if (myId || myLid) {
        iAmAdmin = checkAdminAndFound(g.participants);
      }

      if (!iAmAdmin && (myId || myLid)) {
        iAmAdmin = checkOwner(g.owner);
      }

      if (!iAmAdmin && g.linkedParent && (myId || myLid)) {
        let parent = groupsMap[g.linkedParent];
        
        if (!parent) {
          try {
             parent = await sock.groupMetadata(g.linkedParent);
          } catch (err) {}
        }

        if (parent) {
           iAmAdmin = checkAdminAndFound(parent.participants);
           if (!iAmAdmin) {
             iAmAdmin = checkOwner(parent.owner);
           }
        }
      }
      
      if (!iAmAdmin && !meFoundInParticipants) {
         iAmAdmin = true;
      }

      const isAnnounceOnly = !!g.announce;
      
      // If it's a Parent Community Group (not the announcement group), we shouldn't even show it
      // because you can't broadcast to virtual parent groups directly.
      if (g.isCommunity && !g.isCommunityAnnounce) {
          continue; // Skip this group
      }

      // If we couldn't fetch parent data for a community announcement, 
      // assume admin if they are the owner of the announcement group itself.
      if (g.isCommunityAnnounce && !iAmAdmin) {
          iAmAdmin = checkOwner(g.owner);
      }

      // If it's a community announcement group and they are in the participants list but we couldn't verify admin,
      // WhatsApp sometimes hides the admin flag in the announcement group to save bandwidth.
      // We will assume they are an admin if they created it OR if it's a community they are actively participating in.
      // Actually, to avoid false greens, we will ONLY set readOnly = false so they can TRY to send.
      // But they want it to be green if they are admin.
      // We will trust meFoundInParticipants for communities if we couldn't verify explicitly.
      
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;

      groups.push({
        id: g.id,
        name: g.subject || 'Unnamed Group',
        participantsCount: g.participants?.length || 0,
        isCommunity: isCommunity || isCommunityAnnounce,
        iAmAdmin,
        readOnly,
        isAnnounceOnly
      });
    }

    groups = groups.sort((a: any, b: any) => a.name.localeCompare(b.name));
    sock.end(undefined);
    return res.status(200).json({ groups });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch WhatsApp groups.' });
  }
}
