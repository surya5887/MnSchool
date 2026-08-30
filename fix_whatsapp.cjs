const fs = require('fs');
let content = fs.readFileSync('src/pages/WhatsAppSetup.tsx', 'utf8');

const targetLogic = `  const generateQR = async () => {
    setLoading(true);
    setError('');
    try {
      // In production, this would hit the Vercel API
      // const res = await fetch('/api/generate-qr');
      // const data = await res.json();
      
      // Mocking for UI demonstration
      setTimeout(() => {
        setQrCode("1@mock_qr_code_string_for_demonstration_purposes_only");
        setLoading(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };`;

const newLogic = `  const generateQR = async () => {
    const pwd = prompt("Enter security password to generate QR:");
    if (pwd !== '790077Aa@') {
      if (pwd !== null) alert("Incorrect password.");
      return;
    }

    setLoading(true);
    setError('');
    setQrCode(null);
    setConnected(false);

    try {
      const source = new EventSource('/api/whatsapp-link');
      
      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'qr') {
          setQrCode(data.qr);
          setLoading(false);
        } else if (data.status === 'success') {
          setConnected(true);
          setLoading(false);
          setQrCode(null);
          source.close();
        } else if (data.status === 'timeout' || data.status === 'error') {
          setError(data.message);
          setLoading(false);
          source.close();
        }
      };

      source.onerror = (err) => {
        setError('Connection interrupted.');
        setLoading(false);
        source.close();
      };
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };`;

if (content.includes('const generateQR = async () => {')) {
    content = content.replace(targetLogic, newLogic);
    fs.writeFileSync('src/pages/WhatsAppSetup.tsx', content, 'utf8');
    console.log("Updated WhatsAppSetup.tsx!");
} else {
    console.log("Could not find target logic.");
}
