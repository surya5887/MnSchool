const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
process.env = { ...process.env, ...envConfig };

// Trick to make Vite's import.meta.env work in Node if we were using tsx?
// Actually, let's just make a script that imports it. But since it's ESM in Vite...
