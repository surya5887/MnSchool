const fs = require('fs');
let c1 = fs.readFileSync('src/hooks/useTransliterate.ts', 'utf8');
c1 = c1.replace(`import { useState, useCallback } from 'react';`, '');
fs.writeFileSync('src/hooks/useTransliterate.ts', c1, 'utf8');

let c2 = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
c2 = c2.replace(`motion, AnimatePresence`, `motion`);
c2 = c2.replace(`, Globe2`, ``);
c2 = c2.replace(`const { text: newText, cursorPosition: newCursor } = await processText(text, cursor);`, `const { text: newText } = await processText(text, cursor);`);
fs.writeFileSync('src/pages/Announcements.tsx', c2, 'utf8');
console.log('Fixed TS issues');
