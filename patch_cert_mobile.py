import glob
import os

mobile_css = """
              @media screen and (max-width: 768px) {
                .preview-overlay {
                  overflow-x: auto !important;
                  width: 100% !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                }
                .tc-container, .cc-container, .bc-container {
                  zoom: 0.45;
                  -moz-transform: scale(0.45);
                  -moz-transform-origin: top center;
                  margin: 1rem auto;
                  margin-bottom: 60px !important;
                }
              }
"""

files = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already added
        if "@media screen and (max-width: 768px)" not in content:
            # We can insert it right before the closing </style> tag
            content = content.replace('            `}\n        </style>', mobile_css + '            `}\n        </style>')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched {file_path}")
        else:
            print(f"Already patched {file_path}")
    else:
        print(f"File not found: {file_path}")
