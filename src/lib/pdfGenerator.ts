import jsPDF from 'jspdf';

export const generateNativePdfReceiptBase64 = async (
  student: any,
  transaction: any,
  classNameStr: string,
  settings: any
): Promise<string> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Settings
  const schoolName = settings?.name || 'M.N. PUBLIC SCHOOL';
  const recognitionText = settings?.recognitionText || 'Recognition from UP Board (CBSE Pattern for English Medium)';
  const email = settings?.email || 'mnpsharsoli@gmail.com';
  const phone = settings?.phone || '8477025152';
  const address = settings?.address || 'Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India';
  
  const marginLeft = 15;
  const marginTop = 20;
  
  // Header Box
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(1);
  doc.line(marginLeft, marginTop + 35, 210 - marginLeft, marginTop + 35);

  const logoUrl = settings?.logo || "/images/logo_circular.png";
  
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(reject, 2000);
    });
    
    // Resize image to max 200x200 to keep PDF size small
    const MAX_SIZE = 200;
    let width = img.width;
    let height = img.height;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      doc.addImage(dataUrl, 'PNG', marginLeft, marginTop, 25, 25);
    }
  } catch (e) {
    console.warn("Could not load logo for PDF generation");
  }

  // School Texts
  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(String(schoolName), marginLeft + 35, marginTop + 8);
  
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(String(recognitionText), marginLeft + 35, marginTop + 15);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Email: ${email}   |   Mobile No.: ${phone}`, marginLeft + 35, marginTop + 22);
  doc.text(String(address), marginLeft + 35, marginTop + 28);

  // Title
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FEE RECEIPT", 105, marginTop + 45, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(90, marginTop + 46, 120, marginTop + 46);

  // Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  let y = marginTop + 55;
  const col1X = marginLeft;
  const col2X = 110;

  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(transaction.receiptNo || transaction.id?.substring(0, 8).toUpperCase()), col1X + 25, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Class:", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(classNameStr), col2X + 25, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Date:", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(transaction.date).toLocaleDateString('en-IN'), col1X + 25, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Roll No:", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(student.rollNumber || 'N/A'), col2X + 25, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Student Name:", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${student.firstName} ${student.lastName}`, col1X + 28, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Admission No:", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(student.admissionNo || 'N/A'), col2X + 28, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Father's Name:", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(student.parentName || 'N/A'), col1X + 28, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Payment Mode:", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(transaction.paymentMethod || 'Cash'), col2X + 28, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Mobile No:", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(student.parentPhone || student.phone || 'N/A'), col1X + 28, y);

  if (transaction.runningBalance !== undefined && transaction.runningBalance > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Pending Dues:", col2X, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Rs. ${transaction.runningBalance.toLocaleString('en-IN')}`, col2X + 28, y);
  } else if (transaction.runningBalance !== undefined && transaction.runningBalance < 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Advance Bal:", col2X, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Rs. ${Math.abs(transaction.runningBalance).toLocaleString('en-IN')}`, col2X + 28, y);
  }
  y += 12;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(0, 0, 0);
  doc.rect(marginLeft, y, 180, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.text("S.No", marginLeft + 5, y + 5);
  doc.text("Particulars", marginLeft + 25, y + 5);
  doc.text("Amount (Rs)", marginLeft + 145, y + 5);
  
  // Lines
  doc.line(marginLeft + 20, y, marginLeft + 20, y + 16);
  doc.line(marginLeft + 140, y, marginLeft + 140, y + 16);
  
  y += 8;
  doc.rect(marginLeft, y, 180, 8); // row 1
  
  // Table Body
  doc.setFont("helvetica", "normal");
  doc.text("1", marginLeft + 8, y + 5);
  doc.text(String(transaction.description || 'Fee Payment'), marginLeft + 25, y + 5);
  doc.text(transaction.amount.toLocaleString('en-IN') + ".00", marginLeft + 175, y + 5, { align: "right" });
  
  y += 8;
  doc.rect(marginLeft, y, 180, 8); // row 2 total
  doc.line(marginLeft + 140, y, marginLeft + 140, y + 8);
  
  doc.setFont("helvetica", "bold");
  doc.text("Total Received", marginLeft + 135, y + 5, { align: "right" });
  doc.text(transaction.amount.toLocaleString('en-IN') + ".00", marginLeft + 175, y + 5, { align: "right" });

  y += 15;
  // Footer
  doc.text("Amount in words:", marginLeft, y);
  doc.setFont("helvetica", "normal");
  doc.text(numToWords(transaction.amount), marginLeft + 35, y);
  
  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("* This is a computer generated receipt.", marginLeft, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("_________________________", 140, y - 5);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signatory", 148, y + 1);

  return doc.output('datauristring');
};

const numToWords = (amount: number): string => {
  const single = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (amount === 0) return 'Rupees Zero Only';
  
  const formatTens = (num: number): string => {
    if (num < 10) return single[num];
    if (num < 20) return double[num - 10];
    const t = Math.floor(num / 10);
    const u = num % 10;
    return tens[t] + (u !== 0 ? ' ' + single[u] : '');
  };

  const formatHundreds = (num: number): string => {
    if (num > 99) {
      const h = Math.floor(num / 100);
      const rem = num % 100;
      return single[h] + ' Hundred' + (rem !== 0 ? ' ' + formatTens(rem) : '');
    } else {
      return formatTens(num);
    }
  };

  let word = '';
  let val = Math.floor(amount);
  
  if (val > 9999999) {
    const cr = Math.floor(val / 10000000);
    word += formatHundreds(cr) + ' Crore ';
    val %= 10000000;
  }
  if (val > 99999) {
    const l = Math.floor(val / 100000);
    word += formatTens(l) + ' Lakh ';
    val %= 100000;
  }
  if (val > 999) {
    const th = Math.floor(val / 1000);
    word += formatTens(th) + ' Thousand ';
    val %= 1000;
  }
  if (val > 0) {
    word += formatHundreds(val);
  }

  return 'Rupees ' + word.trim() + ' Only';
};
