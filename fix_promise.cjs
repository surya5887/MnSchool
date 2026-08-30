const fs = require('fs');
let content = fs.readFileSync('api/send-message.ts', 'utf8');

const target = `await new Promise((resolve, reject) => {
        sock.ev.on('connection.update', (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === 'open') {
            resolve(true);
          } else if (connection === 'close') {
            reject(new Error('Connection closed'));
          }
        });
      });`;

const replacement = `await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout: Could not connect to WhatsApp. Is your phone internet on?')), 8500);
        
        sock.ev.on('connection.update', (update) => {
          const { connection, lastDisconnect, qr } = update;
          
          if (qr) {
            clearTimeout(timeout);
            reject(new Error('WhatsApp Not Linked! System generated a new QR. You need to re-link your WhatsApp.'));
          }
          
          if (connection === 'open') {
            clearTimeout(timeout);
            resolve(true);
          } else if (connection === 'close') {
            clearTimeout(timeout);
            reject(new Error('Connection closed or logged out.'));
          }
        });
      });`;

content = content.replace(target, replacement);

fs.writeFileSync('api/send-message.ts', content, 'utf8');
console.log("Promise fixed!");
