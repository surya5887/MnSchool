import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Insert date logic before return (
logic = """  let finalWritingDate = formData.writingDate || '';
  if (finalWritingDate.length <= 2 && formData.writingMonth) {
      let yr = formData.writingYear || str(new Date().getFullYear());
      if (yr.length === 2) yr = '20' + yr;
      finalWritingDate = `${finalWritingDate}-${formData.writingMonth}-${yr}`;
  }
  if (!finalWritingDate) {
      const today = new Date();
      finalWritingDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  }"""

# Since python's str() is not valid in JS, wait:
logic = """  let finalWritingDate = formData.writingDate || '';
  if (finalWritingDate.length > 0 && finalWritingDate.length <= 2 && formData.writingMonth) {
      let yr = formData.writingYear || String(new Date().getFullYear());
      if (yr.length === 2) yr = '20' + yr;
      finalWritingDate = `${finalWritingDate}-${formData.writingMonth}-${yr}`;
  }
  if (!finalWritingDate) {
      const today = new Date();
      finalWritingDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  }"""

content = content.replace("return (", logic + "\n\n  return (")

# Update the input to use finalWritingDate but still call handleChange which updates writingDate
content = content.replace(
    'name="writingDate" value={formData.writingDate} onChange={handleChange} placeholder="DD-MM-YYYY"',
    'name="writingDate" value={finalWritingDate} onChange={handleChange} placeholder="DD-MM-YYYY"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected dynamic date logic.")
