const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('Page error:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5173/admission', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Goto error:', e.message);
  }
  
  await browser.close();
})();
