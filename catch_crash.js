const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  // We need to wait for the local server to start. 
  // Let's assume the user's project is already built, we can just run preview.
  await page.goto('http://localhost:4173/exam', { waitUntil: 'networkidle2' });
  
  // click the custom docs tab
  try {
      const tabs = await page.$$('button');
      for (const tab of tabs) {
          const text = await page.evaluate(el => el.textContent, tab);
          if (text.includes('Custom Docs')) {
              await tab.click();
              console.log("Clicked Custom Docs tab");
              await new Promise(r => setTimeout(r, 2000));
              break;
          }
      }
  } catch(e) {
      console.log("Error interacting", e);
  }
  
  await browser.close();
})();
