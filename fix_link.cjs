const fs = require('fs');
let c = fs.readFileSync('api/whatsapp-link.ts', 'utf8');
c = c.replace(`import { Boom } from '@hapi/boom';`, '');
c = c.replace(`as Boom)?.output?.statusCode`, `as any)?.output?.statusCode`);
fs.writeFileSync('api/whatsapp-link.ts', c, 'utf8');
