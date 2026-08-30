const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const target = `} catch (parseErr) {
          alert("Failed to parse API response. Are you running on localhost without Vercel API support? Try testing on the live Vercel URL.");
          window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
          setSendingWa(null);
          return;
        }
  
        if (data.success) {
          alert("? Serverless WhatsApp sent successfully!");
        } else {
          alert("API Error: " + (data.error || JSON.stringify(data)));
          window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
        }
      } catch (error: any) {
        alert("Network Error: " + error.message);
        console.error(error);
        window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
      }`;

const replacement = `} catch (parseErr) {
          alert("Failed to parse API response from Vercel Serverless. It might be a 500 Crash or 504 Timeout. Error: " + parseErr);
          setSendingWa(null);
          return; // STOP AND DO NOT OPEN TAB so user can read the error!
        }
  
        if (data.success) {
          alert("? Serverless WhatsApp sent successfully!");
        } else {
          alert("API Error: " + (data.error || JSON.stringify(data)));
          // DO NOT auto open tab, let's see the error
        }
      } catch (error: any) {
        alert("Network Error: " + error.message);
        console.error(error);
      }`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
console.log("Fallback modified!");
