const fs = require('fs');
let content = fs.readFileSync('api/send-message.ts', 'utf8');

// Add maxDuration
const insertStr = `export const maxDuration = 60; // Extend Vercel timeout to 60 seconds

export default async function handler(req: any, res: any) {`;

content = content.replace('export default async function handler(req: any, res: any) {', insertStr);

// Increase my timeout to 45 seconds
content = content.replace('8500', '45000');

fs.writeFileSync('api/send-message.ts', content, 'utf8');
console.log("Max duration added!");
