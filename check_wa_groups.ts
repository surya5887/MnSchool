import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import makeWASocket from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './api/useFirebaseAuthState.ts';

async function checkGroups() {
    const { state } = await useFirebaseAuthState('school_erp');
    if (!state.creds || !state.creds.me) {
        console.log("Not connected");
        return;
    }
    
    console.log("Me:", state.creds.me);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    await new Promise((resolve) => {
        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'open') resolve(true);
        });
    });

    const groups = await sock.groupFetchAllParticipating();
    const myId = state.creds.me.id.split(':')[0].split('@')[0];
    console.log("Resolved myId:", myId);

    for (const jid in groups) {
        const g = groups[jid];
        const me = g.participants.find(p => p.id.includes(myId));
        console.log(`\nGroup: ${g.subject}`);
        console.log(`announce: ${g.announce}, isCommunity: ${g.isCommunity}, isCommunityAnnounce: ${g.isCommunityAnnounce}`);
        if (me) {
            console.log(`Me in participants -> id: ${me.id}, admin: ${me.admin}`);
        } else {
            console.log(`Me NOT found in participants!`);
        }
    }
    
    sock.end(undefined);
    process.exit(0);
}

checkGroups().catch(console.error);
